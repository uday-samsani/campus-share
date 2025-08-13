const express = require('express');
const { body, validationResult } = require('express-validator');
const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/groups
// @desc    Get all study groups with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { subject, status, search, page = 1, limit = 12 } = req.query;
    
    let filters = { status: 'active' };
    
    if (subject) filters.subject = subject;
    if (status) filters.status = status;
    
    const result = await StudyGroup.findAll(filters, parseInt(page), parseInt(limit));
    
    // If search is provided, filter results by name/description
    let filteredGroups = result.groups;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGroups = result.groups.filter(group => 
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Populate creator and member information for each group
    const populatedGroups = await Promise.all(
      filteredGroups.map(async (group) => {
        try {
          const creator = await User.findById(group.creatorId);
          const populatedMembers = await Promise.all(
            (group.currentMembers || []).map(async (member) => {
              try {
                const user = await User.findById(member.userId);
                return {
                  ...member,
                  user: user ? {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    university: user.university
                  } : null
                };
              } catch (error) {
                console.error('Error populating member:', error);
                return member;
              }
            })
          );
          
          return {
            ...group,
            creator: creator ? {
              firstName: creator.firstName,
              lastName: creator.lastName,
              university: creator.university
            } : null,
            currentMembers: populatedMembers
          };
        } catch (error) {
          console.error('Error populating group:', error);
          return group;
        }
      })
    );
    
    res.json({
      groups: populatedGroups,
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / limit),
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/groups/:id
// @desc    Get study group by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Populate creator and member information
    try {
      const creator = await User.findById(group.creatorId);
      const populatedMembers = await Promise.all(
        (group.currentMembers || []).map(async (member) => {
          try {
            const user = await User.findById(member.userId);
            return {
              ...member,
              user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university
              } : null
            };
          } catch (error) {
            console.error('Error populating member:', error);
            return member;
          }
        })
      );
      
      group.creator = creator ? {
        firstName: creator.firstName,
        lastName: creator.lastName,
        university: creator.university
      } : null;
      group.currentMembers = populatedMembers;
    } catch (error) {
      console.error('Error populating group:', error);
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups
// @desc    Create a new study group
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().isLength({ min: 1, max: 500 }),
  body('course').trim().notEmpty(),
  body('subject').trim().notEmpty(),
  body('maxMembers').optional().isInt({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const groupData = {
      ...req.body,
      creatorId: req.user.userId, // Changed from _id to userId
      currentMembers: [{
        userId: req.user.userId, // Changed from user to userId
        role: 'admin'
      }],
      status: 'active'
    };

    const group = await StudyGroup.create(groupData);
    
    // Populate creator and member information
    try {
      const creator = await User.findById(req.user.userId);
      if (creator) {
        group.creator = {
          firstName: creator.firstName,
          lastName: creator.lastName,
          university: creator.university
        };
      }
      
      const populatedMembers = await Promise.all(
        (group.currentMembers || []).map(async (member) => {
          try {
            const user = await User.findById(member.userId);
            return {
              ...member,
              user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university
              } : null
            };
          } catch (error) {
            console.error('Error populating member:', error);
            return member;
          }
        })
      );
      group.currentMembers = populatedMembers;
    } catch (error) {
      console.error('Error populating group:', error);
    }
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/join
// @desc    Join a study group
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    if (group.status !== 'active') {
      return res.status(400).json({ message: 'Group is not accepting new members' });
    }
    
    // Check if user is already a member
    const isMember = (group.currentMembers || []).some(member => 
      member.userId === req.user.userId // Changed from _id to userId
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    
    // Check if group is full
    if ((group.currentMembers || []).length >= group.maxMembers) {
      await StudyGroup.update(req.params.id, { status: 'full' });
      return res.status(400).json({ message: 'Group is full' });
    }
    
    const updatedGroup = await StudyGroup.joinGroup(req.user.userId, req.params.id);
    
    // Populate creator and member information
    try {
      const creator = await User.findById(updatedGroup.creatorId);
      const populatedMembers = await Promise.all(
        (updatedGroup.currentMembers || []).map(async (member) => {
          try {
            const user = await User.findById(member.userId);
            return {
              ...member,
              user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university
              } : null
            };
          } catch (error) {
            console.error('Error populating member:', error);
            return member;
          }
        })
      );
      
      updatedGroup.creator = creator ? {
        firstName: creator.firstName,
        lastName: creator.lastName,
        university: creator.university
      } : null;
      updatedGroup.currentMembers = populatedMembers;
    } catch (error) {
      console.error('Error populating group:', error);
    }
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave a study group
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    const memberIndex = (group.currentMembers || []).findIndex(member => 
      member.userId === req.user.userId // Changed from _id to userId
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }
    
    // Creator cannot leave (must delete group instead)
    if (group.currentMembers[memberIndex].role === 'admin') {
      return res.status(400).json({ message: 'Admin cannot leave group. Delete the group instead.' });
    }
    
    const updatedGroup = await StudyGroup.leaveGroup(req.user.userId, req.params.id);
    
    // Populate creator and member information
    try {
      const creator = await User.findById(updatedGroup.creatorId);
      const populatedMembers = await Promise.all(
        (updatedGroup.currentMembers || []).map(async (member) => {
          try {
            const user = await User.findById(member.userId);
            return {
              ...member,
              user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university
              } : null
            };
          } catch (error) {
            console.error('Error populating member:', error);
            return member;
          }
        })
      );
      
      updatedGroup.creator = creator ? {
        firstName: creator.firstName,
        lastName: creator.lastName,
        university: creator.university
      } : null;
      updatedGroup.currentMembers = populatedMembers;
    } catch (error) {
      console.error('Error populating group:', error);
    }
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete a study group
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is the creator
    if (group.creatorId !== req.user.userId) { // Changed from _id to userId
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await StudyGroup.delete(req.params.id);
    res.json({ message: 'Study group removed' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

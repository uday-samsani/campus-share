const express = require('express');
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/proposals
// @desc    Send a proposal for a listing
// @access  Private
router.post('/', [
  auth,
  body('listingId').notEmpty().withMessage('Listing ID is required'),
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters'),
  body('proposedPrice').optional().isFloat({ min: 0 }).withMessage('Proposed price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listingId, message, proposedPrice } = req.body;
    const buyerId = req.user.userId;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is trying to propose on their own listing
    if (listing.sellerId === buyerId) {
      return res.status(400).json({ message: 'You cannot send a proposal on your own listing' });
    }

    // Check if user already has a pending proposal for this listing
    const existingProposals = await Proposal.findByListing(listingId);
    const hasExistingProposal = existingProposals.some(
      proposal => proposal.buyerId === buyerId && proposal.status === 'pending'
    );

    if (hasExistingProposal) {
      return res.status(400).json({ message: 'You already have a pending proposal for this listing' });
    }

    // Create the proposal
    const proposal = await Proposal.create({
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      message,
      proposedPrice: proposedPrice || listing.price
    });

    // Populate buyer information
    try {
      const buyer = await User.findById(buyerId);
      if (buyer) {
        proposal.buyer = {
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          university: buyer.university,
          rating: buyer.rating,
          totalRatings: buyer.totalRatings
        };
      }
    } catch (error) {
      console.error('Error populating buyer:', error);
    }

    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/proposals/my-proposals
// @desc    Get all proposals sent by the current user
// @access  Private
router.get('/my-proposals', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const proposals = await Proposal.findByBuyer(userId);

    // Populate listing and seller information for each proposal
    const populatedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        try {
          const listing = await Listing.findById(proposal.listingId);
          if (listing) {
            // Also fetch seller information
            const seller = await User.findById(listing.sellerId);
            return {
              ...proposal,
              listing: {
                title: listing.title,
                price: listing.price,
                category: listing.category,
                description: listing.description,
                images: listing.images,
                sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown Seller',
                sellerUniversity: seller?.university || 'Unknown University',
                sellerMajor: seller?.major,
                sellerYear: seller?.year,
                sellerRating: seller?.rating || 0,
                sellerTotalRatings: seller?.totalRatings || 0,
                sellerCreatedAt: seller?.createdAt
              }
            };
          }
          return proposal;
        } catch (error) {
          console.error('Error populating listing:', error);
          return proposal;
        }
      })
    );

    res.json(populatedProposals);
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/proposals/received
// @desc    Get all proposals received by the current user
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const proposals = await Proposal.findBySeller(userId);

    // Populate buyer and listing information for each proposal
    const populatedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        try {
          const [buyer, listing] = await Promise.all([
            User.findById(proposal.buyerId),
            Listing.findById(proposal.listingId)
          ]);

          return {
            ...proposal,
            buyer: buyer ? {
              firstName: buyer.firstName,
              lastName: buyer.lastName,
              university: buyer.university,
              rating: buyer.rating,
              totalRatings: buyer.totalRatings
            } : null,
            listing: listing ? {
              title: listing.title,
              price: listing.price,
              category: listing.category,
              description: listing.description,
              images: listing.images
            } : null
          };
        } catch (error) {
          console.error('Error populating proposal data:', error);
          return proposal;
        }
      })
    );

    res.json(populatedProposals);
  } catch (error) {
    console.error('Error fetching received proposals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/proposals/:proposalId
// @desc    Get a specific proposal with full details
// @access  Private
router.get('/:proposalId', auth, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.user.userId;

    // Get the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if user is authorized to view this proposal
    if (proposal.buyerId !== userId && proposal.sellerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this proposal' });
    }

    // Populate listing and seller information
    const listing = await Listing.findById(proposal.listingId);
    if (listing) {
      const seller = await User.findById(listing.sellerId);
      const buyer = await User.findById(proposal.buyerId);

      const populatedProposal = {
        ...proposal,
        listing: {
          title: listing.title,
          price: listing.price,
          category: listing.category,
          description: listing.description,
          images: listing.images,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown Seller',
          sellerUniversity: seller?.university || 'Unknown University',
          sellerMajor: seller?.major,
          sellerYear: seller?.year,
          sellerRating: seller?.rating || 0,
          sellerTotalRatings: seller?.totalRatings || 0,
          sellerCreatedAt: seller?.createdAt
        },
        buyer: buyer ? {
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          university: buyer.university,
          rating: buyer.rating,
          totalRatings: buyer.totalRatings
        } : null
      };

      res.json(populatedProposal);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/proposals/listing/:listingId
// @desc    Get all proposals for a specific listing (seller only)
// @access  Private
router.get('/listing/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.userId;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the seller
    if (listing.sellerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view proposals for this listing' });
    }

    // Get all proposals for the listing
    const proposals = await Proposal.findByListing(listingId);

    // Populate buyer information for each proposal
    const populatedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        try {
          const buyer = await User.findById(proposal.buyerId);
          if (buyer) {
            return {
              ...proposal,
              buyer: {
                firstName: buyer.firstName,
                lastName: buyer.lastName,
                university: buyer.university,
                rating: buyer.rating,
                totalRatings: buyer.totalRatings
              }
            };
          }
          return proposal;
        } catch (error) {
          console.error('Error populating buyer:', error);
          return proposal;
        }
      })
    );

    res.json(populatedProposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/proposals/:proposalId/status
// @desc    Update proposal status (accept/reject/withdraw)
// @access  Private
router.put('/:proposalId/status', [
  auth,
  body('status').isIn(['accepted', 'rejected', 'withdrawn']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { proposalId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Get the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check authorization
    if (status === 'withdrawn') {
      // Only the buyer can withdraw
      if (proposal.buyerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to withdraw this proposal' });
      }
    } else {
      // Only the seller can accept/reject
      if (proposal.sellerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this proposal' });
      }
    }

    // Update the proposal status
    const updatedProposal = await Proposal.updateStatus(proposalId, status);

    // If accepted, update listing status to 'sold'
    if (status === 'accepted') {
      await Listing.update(proposal.listingId, { status: 'sold' });
      
      // Reject all other pending proposals for this listing
      const allProposals = await Proposal.findByListing(proposal.listingId);
      const otherProposals = allProposals.filter(p => p.proposalId !== proposalId);
      
      for (const otherProposal of otherProposals) {
        if (otherProposal.status === 'pending') {
          await Proposal.updateStatus(otherProposal.proposalId, 'rejected');
        }
      }
    }

    res.json(updatedProposal);
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/proposals/:proposalId
// @desc    Delete a proposal (buyer only)
// @access  Private
router.delete('/:proposalId', auth, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.user.userId;

    // Get the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if user is the buyer
    if (proposal.buyerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this proposal' });
    }

    // Check if proposal can be deleted (not accepted)
    if (proposal.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot delete an accepted proposal' });
    }

    await Proposal.delete(proposalId);
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

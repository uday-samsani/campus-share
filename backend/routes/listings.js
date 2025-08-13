const express = require('express');
const { body, validationResult } = require('express-validator');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/listings
// @desc    Get all listings with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, priceType, condition, search, page = 1, limit = 12 } = req.query;
    
    let filters = { status: 'active' };
    
    if (category) filters.category = category;
    if (priceType) filters.priceType = priceType;
    if (condition) filters.condition = condition;
    
    // Note: DynamoDB doesn't support text search like MongoDB
    // We'll filter by title/description in the application layer if search is provided
    
    const result = await Listing.findAll(filters, parseInt(page), parseInt(limit));
    
    // If search is provided, filter results by title/description
    let filteredListings = result.listings;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = result.listings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Populate seller information for each listing
    const populatedListings = await Promise.all(
      filteredListings.map(async (listing) => {
        try {
          const seller = await User.findById(listing.sellerId);
          if (seller) {
            return {
              ...listing,
              seller: {
                firstName: seller.firstName,
                lastName: seller.lastName,
                university: seller.university,
                rating: seller.rating,
                totalRatings: seller.totalRatings,
                major: seller.major,
                year: seller.year
              }
            };
          }
          return listing;
        } catch (error) {
          console.error('Error populating seller:', error);
          return listing;
        }
      })
    );
    
    res.json({
      listings: populatedListings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / limit),
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Increment view count
    listing.views = (listing.views || 0) + 1;
    await Listing.update(listing.listingId, { views: listing.views });
    
    // Populate seller information
    try {
      const seller = await User.findById(listing.sellerId);
      if (seller) {
        listing.seller = {
          firstName: seller.firstName,
          lastName: seller.lastName,
          university: seller.university,
          rating: seller.rating,
          totalRatings: seller.totalRatings,
          major: seller.major,
          year: seller.year
        };
      }
    } catch (error) {
      console.error('Error populating seller:', error);
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().isLength({ min: 1, max: 1000 }),
  body('category').isIn(['textbook', 'laptop', 'cloud-credits', 'equipment', 'other']),
  body('price').isFloat({ min: 0 }),
  body('priceType').isIn(['sale', 'rent', 'free']),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
  body('location').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const listingData = {
      ...req.body,
      sellerId: req.user.userId, // Changed from _id to userId
      status: 'active',
      views: 0,
      favorites: []
    };

    const listing = await Listing.create(listingData);
    
    // Populate seller information
    try {
      const seller = await User.findById(req.user.userId);
      if (seller) {
        listing.seller = {
          firstName: seller.firstName,
          lastName: seller.lastName,
          university: seller.university,
          rating: seller.rating,
          totalRatings: seller.totalRatings,
          major: seller.major,
          year: seller.year
        };
      }
    } catch (error) {
      console.error('Error populating seller:', error);
    }
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['active', 'sold', 'expired', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user owns the listing
    if (listing.sellerId !== req.user.userId) { // Changed from _id to userId
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedListing = await Listing.update(req.params.id, req.body);
    
    // Populate seller information
    try {
      const seller = await User.findById(req.user.userId);
      if (seller) {
        updatedListing.seller = {
          firstName: seller.firstName,
          lastName: seller.lastName,
          university: seller.university,
          rating: seller.rating,
          totalRatings: seller.totalRatings,
          major: seller.major,
          year: seller.year
        };
      }
    } catch (error) {
      console.error('Error populating seller:', error);
    }
    
    res.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user owns the listing
    if (listing.sellerId !== req.user.userId) { // Changed from _id to userId
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Listing.delete(req.params.id);
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/listings/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const favorites = listing.favorites || [];
    const favoriteIndex = favorites.indexOf(req.user.userId); // Changed from _id to userId
    
    if (favoriteIndex > -1) {
      favorites.splice(favoriteIndex, 1);
    } else {
      favorites.push(req.user.userId); // Changed from _id to userId
    }
    
    await Listing.update(req.params.id, { favorites });
    res.json({ message: 'Favorite updated', isFavorited: favoriteIndex === -1 });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

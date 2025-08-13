const express = require('express');
const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/favorites
// @desc    Add a listing to favorites
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user.userId;

    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if already favorited
    const isFavorited = await Favorite.isFavorited(userId, listingId);
    if (isFavorited) {
      return res.status(400).json({ message: 'Listing already in favorites' });
    }

    // Add to favorites
    const favorite = await Favorite.addFavorite(userId, listingId);
    
    res.status(201).json({ 
      message: 'Added to favorites',
      favorite 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:listingId
// @desc    Remove a listing from favorites
// @access  Private
router.delete('/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.userId;

    // Remove from favorites
    await Favorite.removeFavorite(userId, listingId);
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    if (error.message === 'Favorite not found') {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/favorites
// @desc    Get user's favorite listings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's favorites
    const favorites = await Favorite.findByUser(userId);
    
    // Get listing details for each favorite
    const favoriteListings = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          const listing = await Listing.findById(favorite.listingId);
          if (listing) {
            return {
              ...listing,
              favoritedAt: favorite.createdAt
            };
          }
          return null;
        } catch (error) {
          console.error('Error fetching listing:', error);
          return null;
        }
      })
    );

    // Filter out null listings and sort by favorited date
    const validListings = favoriteListings
      .filter(listing => listing !== null)
      .sort((a, b) => new Date(b.favoritedAt) - new Date(a.favoritedAt));

    res.json(validListings);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/favorites/check/:listingId
// @desc    Check if a listing is favorited by user
// @access  Private
router.get('/check/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.userId;
    
    const isFavorited = await Favorite.isFavorited(userId, listingId);
    
    res.json({ isFavorited });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

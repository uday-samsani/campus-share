const express = require('express');
const { upload } = require('../config/s3');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload/images
// @desc    Upload images to S3
// @access  Private
router.post('/images', auth, async (req, res) => {
  try {
    // Check if S3 is configured
    if (!upload) {
      return res.status(503).json({ 
        message: 'Image upload service is not configured. Please add AWS credentials to enable S3 uploads.' 
      });
    }

    // Use multer middleware - handle both single and multiple images
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }

      // Get uploaded file URLs
      const imageUrls = req.files.map(file => file.location);

      // If only one image uploaded, return single URL format for profile images
      if (imageUrls.length === 1) {
        res.json({
          message: 'Image uploaded successfully',
          url: imageUrls[0],
          images: imageUrls,
          count: 1
        });
      } else {
        res.json({
          message: 'Images uploaded successfully',
          images: imageUrls,
          count: req.files.length
        });
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// @route   POST /api/upload/profile-image
// @desc    Upload single profile image to S3
// @access  Private
router.post('/profile-image', auth, async (req, res) => {
  try {
    console.log('Profile image upload request received');
    
    // Check if S3 is configured
    if (!upload) {
      console.log('S3 upload not configured');
      return res.status(503).json({ 
        message: 'Image upload service is not configured. Please add AWS credentials to enable S3 uploads.' 
      });
    }

    console.log('S3 upload configured, processing file...');

    // Use multer middleware for single image
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Multer error in profile upload:', err);
        return res.status(400).json({ message: err.message });
      }

      console.log('Multer processed file:', req.file);

      if (!req.file) {
        console.log('No file received in profile upload');
        return res.status(400).json({ message: 'No image uploaded' });
      }

      console.log('File uploaded successfully:', req.file.location);

      res.json({
        message: 'Profile image uploaded successfully',
        url: req.file.location
      });
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Error uploading profile image' });
  }
});

// @route   DELETE /api/upload/images
// @desc    Delete image from S3
// @access  Private
router.delete('/images', auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const { deleteImage } = require('../config/s3');
    const deleted = await deleteImage(imageUrl);

    if (deleted) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

module.exports = router;

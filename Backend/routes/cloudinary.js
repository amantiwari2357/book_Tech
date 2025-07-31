const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { folder = 'book-tech' } = req.body;
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/upload-multiple', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const { folder = 'book-tech' } = req.body;
    const uploadPromises = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      return cloudinary.uploader.upload(dataURI, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
    });

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      images: results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }))
    });
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete image from Cloudinary
router.delete('/delete', auth, async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// Get image transformations
router.get('/transform/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality } = req.query;

    let transformation = '';
    if (width) transformation += `w_${width},`;
    if (height) transformation += `h_${height},`;
    if (crop) transformation += `c_${crop},`;
    if (quality) transformation += `q_${quality},`;

    // Remove trailing comma
    transformation = transformation.replace(/,$/, '');

    const url = cloudinary.url(publicId, {
      transformation: transformation ? [{ width, height, crop, quality }] : []
    });

    res.json({ url });
  } catch (error) {
    console.error('Cloudinary transform error:', error);
    res.status(500).json({ message: 'Failed to transform image' });
  }
});

// Get folder contents
router.get('/folder/:folderName', auth, async (req, res) => {
  try {
    const { folderName } = req.params;
    const { maxResults = 50 } = req.query;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderName,
      max_results: parseInt(maxResults),
      resource_type: 'image'
    });

    res.json({
      success: true,
      resources: result.resources.map(resource => ({
        url: resource.secure_url,
        publicId: resource.public_id,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        size: resource.bytes,
        createdAt: resource.created_at
      }))
    });
  } catch (error) {
    console.error('Cloudinary folder error:', error);
    res.status(500).json({ message: 'Failed to get folder contents' });
  }
});

// Create folder
router.post('/folder', auth, async (req, res) => {
  try {
    const { folderName } = req.body;
    
    if (!folderName) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Cloudinary doesn't have a direct folder creation API
    // Folders are created automatically when you upload to them
    res.json({ 
      success: true, 
      message: 'Folder will be created when you upload to it',
      folderName 
    });
  } catch (error) {
    console.error('Cloudinary folder creation error:', error);
    res.status(500).json({ message: 'Failed to create folder' });
  }
});

// Get usage statistics
router.get('/usage', auth, async (req, res) => {
  try {
    const result = await cloudinary.api.usage();
    
    res.json({
      success: true,
      usage: {
        plan: result.plan,
        credits: result.credits,
        objects: result.objects,
        bandwidth: result.bandwidth,
        storage: result.storage,
        requests: result.requests
      }
    });
  } catch (error) {
    console.error('Cloudinary usage error:', error);
    res.status(500).json({ message: 'Failed to get usage statistics' });
  }
});

module.exports = router; 
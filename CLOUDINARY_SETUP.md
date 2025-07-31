# Cloudinary Setup Guide for Book-Tech

This guide will help you set up Cloudinary for image storage and management in your Book-Tech application.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

## 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard, you'll need:

- **Cloud Name**: Found in the dashboard header
- **API Key**: Found in the dashboard under "Account Details"
- **API Secret**: Found in the dashboard under "Account Details"

## 3. Create Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name**: `book-tech-preset`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `book-tech`
   - **Access Mode**: `Public`
5. Save the preset

## 4. Environment Variables Setup

### Frontend (.env file in read-verse-premium-club/)

Create a `.env` file in the `read-verse-premium-club` directory:

```env
# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_API_KEY=your-api-key
REACT_APP_CLOUDINARY_API_SECRET=your-api-secret
REACT_APP_CLOUDINARY_UPLOAD_PRESET=book-tech-preset

# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Other Configuration
REACT_APP_SITE_URL=https://www.book-tech.com
REACT_APP_SITE_NAME=Book-Tech
REACT_APP_SITE_DESCRIPTION=Your premier destination for digital books and reading experiences
```

### Backend (.env file in Backend/)

Create a `.env` file in the `Backend` directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# JWT Secret
JWT_SECRET=your-jwt-secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (if using)
EMAIL_HOST=your-email-host
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## 5. Install Dependencies

### Frontend
```bash
cd read-verse-premium-club
npm install cloudinary
```

### Backend
```bash
cd Backend
npm install cloudinary multer
```

## 6. Folder Structure

Cloudinary will automatically create the following folder structure:

```
book-tech/
├── covers/          # Book cover images
├── avatars/         # User profile pictures
├── book-images/     # Book content images
├── icons/           # App icons and logos
├── promos/          # Promotional images
└── general/         # General images
```

## 7. Usage Examples

### Frontend Usage

```tsx
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadBookCover } from '@/lib/cloudinary';

// Upload book cover
<ImageUpload
  onUpload={(url, publicId) => {
    console.log('Uploaded:', url);
    // Save to your database
  }}
  folder="book-tech/covers"
  aspectRatio="3:2"
  maxSize={10}
/>

// Upload user avatar
<ImageUpload
  onUpload={(url, publicId) => {
    console.log('Avatar uploaded:', url);
  }}
  folder="book-tech/avatars"
  aspectRatio="square"
  maxSize={2}
/>
```

### Backend Usage

```javascript
// Upload single image
const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'book-tech/covers',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};
```

## 8. Image Transformations

### Available Transformations

```javascript
// Get optimized image URL
import { getOptimizedImageUrl } from '@/lib/cloudinary';

const thumbnailUrl = getOptimizedImageUrl(imageUrl, 'thumbnail');
const coverUrl = getOptimizedImageUrl(imageUrl, 'cover');
const avatarUrl = getOptimizedImageUrl(imageUrl, 'avatar');
```

### Transformation Presets

- `thumbnail`: 150x150px, fill crop
- `small`: 300x300px, fill crop
- `medium`: 500x500px, fill crop
- `large`: 800x800px, fill crop
- `cover`: 400x600px, fill crop
- `avatar`: 100x100px, fill crop
- `icon`: 50x50px, fill crop

## 9. Security Considerations

1. **Upload Preset**: Use unsigned uploads for client-side uploads
2. **File Validation**: Always validate file types and sizes
3. **Access Control**: Use authentication for sensitive uploads
4. **Rate Limiting**: Implement rate limiting for upload endpoints
5. **CORS**: Configure CORS properly for your domains

## 10. Testing

### Test Upload Component

```tsx
import React from 'react';
import ImageUpload from '@/components/ui/ImageUpload';

const TestUpload = () => {
  const handleUpload = (url: string, publicId: string) => {
    console.log('Upload successful:', { url, publicId });
  };

  const handleError = (error: string) => {
    console.error('Upload failed:', error);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Test Image Upload</h2>
      <ImageUpload
        onUpload={handleUpload}
        onError={handleError}
        folder="book-tech/test"
        maxSize={5}
        showPreview={true}
      />
    </div>
  );
};

export default TestUpload;
```

### Test Backend Endpoint

```bash
# Test upload endpoint
curl -X POST http://localhost:5000/api/cloudinary/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "folder=book-tech/test"
```

## 11. Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Cloudinary account allows your domain
2. **Upload Failures**: Check your API credentials and upload preset
3. **Image Not Loading**: Verify the image URL and transformation parameters
4. **File Size Limits**: Check your Cloudinary plan limits

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with a simple image first
4. Check Cloudinary dashboard for upload logs

## 12. Production Deployment

### Vercel (Frontend)

1. Add environment variables in Vercel dashboard
2. Ensure all Cloudinary variables are set
3. Test upload functionality after deployment

### Render/Railway (Backend)

1. Add environment variables in your hosting platform
2. Ensure CORS is configured for your frontend domain
3. Test all upload endpoints

## 13. Monitoring

### Cloudinary Dashboard

- Monitor upload usage
- Check bandwidth consumption
- Review storage usage
- Monitor transformation usage

### Application Monitoring

- Log upload successes/failures
- Monitor upload performance
- Track user upload patterns
- Alert on upload errors

## 14. Cost Optimization

1. **Image Optimization**: Use automatic quality and format optimization
2. **Caching**: Implement proper caching strategies
3. **CDN**: Cloudinary provides global CDN automatically
4. **Compression**: Use appropriate compression settings
5. **Cleanup**: Regularly clean up unused images

## 15. Advanced Features

### Image Effects

```javascript
// Apply effects
const url = cloudinary.url(publicId, {
  transformation: [
    { effect: 'art:aurora' },
    { width: 400, height: 300, crop: 'fill' }
  ]
});
```

### Video Support

```javascript
// Upload video
const result = await cloudinary.uploader.upload(videoFile, {
  resource_type: 'video',
  folder: 'book-tech/videos'
});
```

### PDF Support

```javascript
// Upload PDF
const result = await cloudinary.uploader.upload(pdfFile, {
  resource_type: 'raw',
  folder: 'book-tech/pdfs'
});
```

This setup provides a complete Cloudinary integration for your Book-Tech application with proper security, optimization, and monitoring capabilities. 
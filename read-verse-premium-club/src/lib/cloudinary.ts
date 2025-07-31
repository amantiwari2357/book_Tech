import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.REACT_APP_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET || 'your-api-secret',
});

// Upload image to Cloudinary
export const uploadImage = async (file: File, folder: string = 'book-tech'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'book-tech-preset');
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files: File[], folder: string = 'book-tech'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/cloudinary/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Transform image URL (resize, crop, etc.)
export const transformImageUrl = (url: string, transformations: string = ''): string => {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/${transformations}/${imagePath}`;
};

// Common transformation presets
export const imageTransformations = {
  thumbnail: 'w_150,h_150,c_fill',
  small: 'w_300,h_300,c_fill',
  medium: 'w_500,h_500,c_fill',
  large: 'w_800,h_800,c_fill',
  cover: 'w_400,h_600,c_fill',
  avatar: 'w_100,h_100,c_fill',
  icon: 'w_50,h_50,c_fill',
};

// Get optimized image URL
export const getOptimizedImageUrl = (url: string, size: keyof typeof imageTransformations = 'medium'): string => {
  return transformImageUrl(url, imageTransformations[size]);
};

// Upload book cover
export const uploadBookCover = async (file: File): Promise<string> => {
  return uploadImage(file, 'book-tech/covers');
};

// Upload user avatar
export const uploadAvatar = async (file: File): Promise<string> => {
  return uploadImage(file, 'book-tech/avatars');
};

// Upload book content images
export const uploadBookImage = async (file: File): Promise<string> => {
  return uploadImage(file, 'book-tech/book-images');
};

// Upload icons and logos
export const uploadIcon = async (file: File): Promise<string> => {
  return uploadImage(file, 'book-tech/icons');
};

// Upload promotional images
export const uploadPromoImage = async (file: File): Promise<string> => {
  return uploadImage(file, 'book-tech/promos');
};

export default cloudinary; 
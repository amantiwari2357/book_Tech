import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { uploadImage, getOptimizedImageUrl } from '@/lib/cloudinary';

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  folder = 'book-tech',
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = false,
  className = '',
  disabled = false,
  showPreview = true,
  aspectRatio = 'square'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const errorMsg = `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size too large. Maximum size: ${maxSize}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      if (showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Cloudinary
      const url = await uploadImage(file, folder);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Extract public ID from URL (this is a simplified approach)
      const publicId = url.split('/').slice(-1)[0].split('.')[0];
      
      onUpload(url, publicId);
      
      // Reset after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setPreview(null);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = 'Failed to upload image. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsUploading(false);
      setUploadProgress(0);
      setPreview(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div
            className={`text-center ${getAspectRatioClass()} flex flex-col items-center justify-center`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!disabled && !isUploading ? handleClick : undefined}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              </div>
            ) : preview ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                  }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <CloudArrowUpIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {dragActive ? 'Drop your image here' : 'Upload an image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to {maxSize}MB
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {uploadProgress === 100 && (
        <div className="mt-2 flex items-center space-x-2 text-green-600">
          <CheckIcon className="w-4 h-4" />
          <span className="text-sm">Upload successful!</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
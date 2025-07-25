import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CloudArrowUpIcon, BookOpenIcon, TagIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/store';
import { addBook } from '@/store/slices/booksSlice';
import { authFetch } from '@/lib/api';

const Upload: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    isPremium: false,
    readingType: '', // <-- Added
  });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.readingType) {
      setError('Reading type (soft or hard) is required');
      return;
    }
    try {
      const newBook = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        coverImage: '/api/placeholder/300/400',
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPremium: formData.isPremium,
        rating: 0,
        totalReviews: 0,
        readingType: formData.readingType, // <-- Added
      };
      const res = await authFetch('/books', {
        method: 'POST',
        body: JSON.stringify(newBook),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(addBook(data));
        setSuccess('Book uploaded successfully!');
        setFormData({
          title: '',
          author: '',
          description: '',
          price: '',
          category: '',
          tags: '',
          isPremium: false,
          readingType: '', // <-- Reset
        });
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log('File dropped:', e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Upload Your Book</h1>
          <p className="text-xl text-muted-foreground">
            Share your knowledge with readers worldwide
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload Book File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your book file here
                </p>
                <p className="text-muted-foreground mb-4">
                  Supported formats: PDF, EPUB, MOBI
                </p>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" />
                Book Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter book title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter book description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Technology, Business"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-sm text-muted-foreground">
                  Add relevant tags to help readers discover your book
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="premium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({...formData, isPremium: checked})}
                />
                <Label htmlFor="premium" className="flex items-center gap-2">
                  Premium Content
                  {formData.isPremium && (
                    <Badge className="bg-gradient-premium text-foreground border-0">
                      Premium
                    </Badge>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Reading Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" />
                Reading Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="readingType"
                    value="soft"
                    checked={formData.readingType === 'soft'}
                    onChange={e => setFormData({ ...formData, readingType: e.target.value })}
                    required
                  />
                  Only Soft Copy (Read Online)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="readingType"
                    value="hard"
                    checked={formData.readingType === 'hard'}
                    onChange={e => setFormData({ ...formData, readingType: e.target.value })}
                    required
                  />
                  Wants to Offer Hard Copy (Delivery Available)
                </label>
              </div>
              {error && !formData.readingType && (
                <div className="text-red-500 text-sm mt-2">Reading type (soft or hard) is required</div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center">
            <Button type="submit" variant="hero" size="lg" className="px-12">
              Upload Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
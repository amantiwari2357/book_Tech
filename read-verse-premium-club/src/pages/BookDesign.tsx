import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store';
import { authFetch } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { EyeIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BookDesign {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  content: string;
  formatting: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    textColor: string;
    backgroundColor: string;
    pageWidth: number;
    pageHeight: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  category: string;
  tags: string[];
  isFree: boolean;
  price: number;
  isPremium: boolean;
  status: 'pending' | 'approved' | 'rejected';
  readCount: number;
  purchaseCount: number;
  createdAt: string;
}

const BookDesign: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [bookDesigns, setBookDesigns] = useState<BookDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState<BookDesign | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    coverImageUrl: '',
    content: '',
    formatting: {
      fontSize: 16,
      fontFamily: 'Arial',
      lineHeight: 1.5,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      pageWidth: 5.5,
      pageHeight: 8.5,
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.75,
        right: 0.75
      }
    },
    category: '',
    tags: [] as string[],
    isFree: true,
    price: 0,
    isPremium: false
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchBookDesigns();
  }, []);

  const fetchBookDesigns = async () => {
    try {
      const res = await authFetch('/book-designs/my/designs');
      if (res.ok) {
        const data = await res.json();
        setBookDesigns(data);
      }
    } catch (error) {
      console.error('Error fetching book designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.author || !form.coverImageUrl || !form.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting book design:', form);
      const url = editingDesign 
        ? `/book-designs/${editingDesign._id}`
        : '/book-designs';
      
      const method = editingDesign ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);
      
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(form)
      });

      console.log('Response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('Book design created/updated:', responseData);
        
        toast({
          title: "Success",
          description: editingDesign 
            ? "Book design updated successfully" 
            : "Book design created successfully"
        });
        
        setShowForm(false);
        setEditingDesign(null);
        resetForm();
        fetchBookDesigns();
      } else {
        const error = await res.json();
        console.error('Error response:', error);
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating book design:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (design: BookDesign) => {
    setEditingDesign(design);
    setForm({
      title: design.title,
      author: design.author,
      description: design.description,
      coverImageUrl: design.coverImageUrl,
      content: design.content,
      formatting: design.formatting,
      category: design.category,
      tags: design.tags,
      isFree: design.isFree,
      price: design.price,
      isPremium: design.isPremium
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book design?')) return;

    try {
      const res = await authFetch(`/book-designs/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Book design deleted successfully"
        });
        fetchBookDesigns();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book design",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      author: '',
      description: '',
      coverImageUrl: '',
      content: '',
      formatting: {
        fontSize: 16,
        fontFamily: 'Arial',
        lineHeight: 1.5,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        pageWidth: 5.5,
        pageHeight: 8.5,
        margins: {
          top: 0.5,
          bottom: 0.5,
          left: 0.75,
          right: 0.75
        }
      },
      category: '',
      tags: [],
      isFree: true,
      price: 0,
      isPremium: false
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (user?.role !== 'author') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Only authors can access the book design feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Book Design Studio</h1>
          <p className="text-gray-600">Create custom books with your own formatting and design</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Create New Design
        </Button>
      </div>

      {/* Book Design Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingDesign ? 'Edit Book Design' : 'Create New Book Design'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter book description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="coverImageUrl">Cover Image URL *</Label>
                <Input
                  id="coverImageUrl"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="Enter cover image URL"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Book Content *</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter your book content here..."
                  rows={10}
                />
              </div>

              {/* Formatting Options */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Formatting Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={form.formatting.fontSize}
                      onChange={(e) => setForm({
                        ...form,
                        formatting: { ...form.formatting, fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={form.formatting.fontFamily}
                      onValueChange={(value) => setForm({
                        ...form,
                        formatting: { ...form.formatting, fontFamily: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lineHeight">Line Height</Label>
                    <Input
                      id="lineHeight"
                      type="number"
                      step="0.1"
                      value={form.formatting.lineHeight}
                      onChange={(e) => setForm({
                        ...form,
                        formatting: { ...form.formatting, lineHeight: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={form.formatting.textColor}
                      onChange={(e) => setForm({
                        ...form,
                        formatting: { ...form.formatting, textColor: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={form.formatting.backgroundColor}
                      onChange={(e) => setForm({
                        ...form,
                        formatting: { ...form.formatting, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Book Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Book Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      disabled={form.isFree}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={form.isFree}
                      onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    />
                    <Label htmlFor="isFree">Free to read</Label>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Preview</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {previewMode ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
                
                {previewMode && (
                  <div 
                    className="border rounded-lg p-6 bg-white"
                    style={{
                      backgroundColor: form.formatting.backgroundColor,
                      color: form.formatting.textColor,
                      fontFamily: form.formatting.fontFamily,
                      fontSize: `${form.formatting.fontSize}px`,
                      lineHeight: form.formatting.lineHeight,
                      width: `${form.formatting.pageWidth * 100}px`,
                      height: `${form.formatting.pageHeight * 100}px`,
                      margin: '0 auto'
                    }}
                  >
                    <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
                    <p className="text-sm mb-4">by {form.author}</p>
                    <div className="prose max-w-none">
                      {form.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button type="submit">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {editingDesign ? 'Update Design' : 'Create Design'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDesign(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Book Designs List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Book Designs</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : bookDesigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No book designs yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookDesigns.map((design) => (
              <Card key={design._id} className="overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {design.coverImageUrl ? (
                    <img
                      src={design.coverImageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">No Cover</p>
                      </div>
                    </div>
                  )}
                  <Badge className={`absolute top-2 right-2 ${getStatusColor(design.status)}`}>
                    {design.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{design.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {design.author}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{design.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {design.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-500">
                      {design.isFree ? 'Free' : `$${design.price}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {design.readCount} reads
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {design.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(design)}
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/book-design-reader/${design._id}`, '_blank')}
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {design.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(design._id)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDesign; 
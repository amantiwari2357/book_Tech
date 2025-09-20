import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  PhotoIcon,
  PaintBrushIcon,
  TypographyIcon,
  PaletteIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  UploadIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface BookContent {
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  language: string;
  pages: number;
  isbn?: string;
  publishDate: string;
  coverImage?: string;
  thumbnailImage?: string;
}

interface BookDesign {
  coverDesign: {
    backgroundColor: string;
    textColor: string;
    titleFont: string;
    authorFont: string;
    titleSize: number;
    authorSize: number;
    layout: 'centered' | 'left' | 'right';
    backgroundImage?: string;
  };
  pageDesign: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    headerColor: string;
    headerFont: string;
    headerSize: number;
  };
  content: {
    chapters: Chapter[];
  };
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

const AuthorBookCreation: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();

  const [bookContent, setBookContent] = useState<BookContent>({
    title: '',
    author: user?.name || '',
    description: '',
    category: '',
    price: 0,
    language: 'English',
    pages: 0,
    publishDate: new Date().toISOString().split('T')[0],
  });

  const [bookDesign, setBookDesign] = useState<BookDesign>({
    coverDesign: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      titleFont: 'Arial',
      authorFont: 'Arial',
      titleSize: 24,
      authorSize: 16,
      layout: 'centered',
    },
    pageDesign: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Arial',
      fontSize: 14,
      lineHeight: 1.5,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      headerColor: '#000000',
      headerFont: 'Arial',
      headerSize: 18,
    },
    content: {
      chapters: [
        {
          id: '1',
          title: 'Chapter 1',
          content: '',
          pageNumber: 1,
        },
      ],
    },
  });

  const fontOptions = [
    'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 
    'Courier New', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS'
  ];

  const colorOptions = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000',
    '#000080', '#808080', '#c0c0c0', '#ffa500', '#800080'
  ];

  const handleSaveBook = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/author/books/create', {
        method: 'POST',
        body: JSON.stringify({
          content: bookContent,
          design: bookDesign,
        }),
      });
      
      if (res.ok) {
        navigate('/author-dashboard');
      }
    } catch (error) {
      console.error('Error creating book:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: (bookDesign.content.chapters.length + 1).toString(),
      title: `Chapter ${bookDesign.content.chapters.length + 1}`,
      content: '',
      pageNumber: bookDesign.content.chapters.length + 1,
    };
    
    setBookDesign(prev => ({
      ...prev,
      content: {
        chapters: [...prev.content.chapters, newChapter],
      },
    }));
  };

  const updateChapter = (chapterId: string, field: keyof Chapter, value: string | number) => {
    setBookDesign(prev => ({
      ...prev,
      content: {
        chapters: prev.content.chapters.map(chapter =>
          chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
        ),
      },
    }));
  };

  const removeChapter = (chapterId: string) => {
    setBookDesign(prev => ({
      ...prev,
      content: {
        chapters: prev.content.chapters.filter(chapter => chapter.id !== chapterId),
      },
    }));
  };

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Book</h1>
          <p className="text-gray-600 mt-2">Design and publish your book with custom styling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="cover">Cover Design</TabsTrigger>
                <TabsTrigger value="pages">Page Design</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Book Title</Label>
                        <Input
                          id="title"
                          value={bookContent.title}
                          onChange={(e) => setBookContent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter book title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="author">Author Name</Label>
                        <Input
                          id="author"
                          value={bookContent.author}
                          onChange={(e) => setBookContent(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="Author name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={bookContent.description}
                        onChange={(e) => setBookContent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Book description"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={bookContent.category} onValueChange={(value) => setBookContent(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fiction">Fiction</SelectItem>
                            <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                            <SelectItem value="romance">Romance</SelectItem>
                            <SelectItem value="mystery">Mystery</SelectItem>
                            <SelectItem value="thriller">Thriller</SelectItem>
                            <SelectItem value="sci-fi">Science Fiction</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="biography">Biography</SelectItem>
                            <SelectItem value="self-help">Self Help</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={bookContent.price}
                          onChange={(e) => setBookContent(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select value={bookContent.language} onValueChange={(value) => setBookContent(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pages">Number of Pages</Label>
                        <Input
                          id="pages"
                          type="number"
                          value={bookContent.pages}
                          onChange={(e) => setBookContent(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="isbn">ISBN (Optional)</Label>
                        <Input
                          id="isbn"
                          value={bookContent.isbn || ''}
                          onChange={(e) => setBookContent(prev => ({ ...prev, isbn: e.target.value }))}
                          placeholder="ISBN number"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Background Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={bookDesign.coverDesign.backgroundColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                coverDesign: { ...prev.coverDesign, backgroundColor: e.target.value }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={bookDesign.coverDesign.backgroundColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                coverDesign: { ...prev.coverDesign, backgroundColor: e.target.value }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Text Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={bookDesign.coverDesign.textColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                coverDesign: { ...prev.coverDesign, textColor: e.target.value }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={bookDesign.coverDesign.textColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                coverDesign: { ...prev.coverDesign, textColor: e.target.value }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Title Font</Label>
                          <Select value={bookDesign.coverDesign.titleFont} onValueChange={(value) => setBookDesign(prev => ({
                            ...prev,
                            coverDesign: { ...prev.coverDesign, titleFont: value }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontOptions.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Title Size</Label>
                          <Input
                            type="number"
                            value={bookDesign.coverDesign.titleSize}
                            onChange={(e) => setBookDesign(prev => ({
                              ...prev,
                              coverDesign: { ...prev.coverDesign, titleSize: parseInt(e.target.value) || 24 }
                            }))}
                          />
                        </div>

                        <div>
                          <Label>Layout</Label>
                          <Select value={bookDesign.coverDesign.layout} onValueChange={(value: any) => setBookDesign(prev => ({
                            ...prev,
                            coverDesign: { ...prev.coverDesign, layout: value }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="centered">Centered</SelectItem>
                              <SelectItem value="left">Left Aligned</SelectItem>
                              <SelectItem value="right">Right Aligned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Cover Preview */}
                      <div className="space-y-4">
                        <Label>Cover Preview</Label>
                        <div 
                          className="w-full h-64 border-2 border-gray-300 rounded-lg flex flex-col justify-center items-center relative"
                          style={{ 
                            backgroundColor: bookDesign.coverDesign.backgroundColor,
                            color: bookDesign.coverDesign.textColor,
                            textAlign: bookDesign.coverDesign.layout
                          }}
                        >
                          <h2 
                            style={{ 
                              fontFamily: bookDesign.coverDesign.titleFont,
                              fontSize: `${bookDesign.coverDesign.titleSize}px`,
                              fontWeight: 'bold'
                            }}
                          >
                            {bookContent.title || 'Book Title'}
                          </h2>
                          <p 
                            style={{ 
                              fontFamily: bookDesign.coverDesign.authorFont,
                              fontSize: `${bookDesign.coverDesign.authorSize}px`
                            }}
                          >
                            by {bookContent.author || 'Author Name'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pages" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Page Background Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={bookDesign.pageDesign.backgroundColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, backgroundColor: e.target.value }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={bookDesign.pageDesign.backgroundColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, backgroundColor: e.target.value }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Text Color</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="color"
                              value={bookDesign.pageDesign.textColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, textColor: e.target.value }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={bookDesign.pageDesign.textColor}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, textColor: e.target.value }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Font Family</Label>
                          <Select value={bookDesign.pageDesign.fontFamily} onValueChange={(value) => setBookDesign(prev => ({
                            ...prev,
                            pageDesign: { ...prev.pageDesign, fontFamily: value }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontOptions.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Font Size</Label>
                            <Input
                              type="number"
                              value={bookDesign.pageDesign.fontSize}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, fontSize: parseInt(e.target.value) || 14 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label>Line Height</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={bookDesign.pageDesign.lineHeight}
                              onChange={(e) => setBookDesign(prev => ({
                                ...prev,
                                pageDesign: { ...prev.pageDesign, lineHeight: parseFloat(e.target.value) || 1.5 }
                              }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Margins (px)</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <Label className="text-xs">Top</Label>
                              <Input
                                type="number"
                                value={bookDesign.pageDesign.marginTop}
                                onChange={(e) => setBookDesign(prev => ({
                                  ...prev,
                                  pageDesign: { ...prev.pageDesign, marginTop: parseInt(e.target.value) || 20 }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Bottom</Label>
                              <Input
                                type="number"
                                value={bookDesign.pageDesign.marginBottom}
                                onChange={(e) => setBookDesign(prev => ({
                                  ...prev,
                                  pageDesign: { ...prev.pageDesign, marginBottom: parseInt(e.target.value) || 20 }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Left</Label>
                              <Input
                                type="number"
                                value={bookDesign.pageDesign.marginLeft}
                                onChange={(e) => setBookDesign(prev => ({
                                  ...prev,
                                  pageDesign: { ...prev.pageDesign, marginLeft: parseInt(e.target.value) || 20 }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Right</Label>
                              <Input
                                type="number"
                                value={bookDesign.pageDesign.marginRight}
                                onChange={(e) => setBookDesign(prev => ({
                                  ...prev,
                                  pageDesign: { ...prev.pageDesign, marginRight: parseInt(e.target.value) || 20 }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Page Preview */}
                      <div className="space-y-4">
                        <Label>Page Preview</Label>
                        <div 
                          className="w-full h-64 border-2 border-gray-300 rounded-lg p-4"
                          style={{ 
                            backgroundColor: bookDesign.pageDesign.backgroundColor,
                            color: bookDesign.pageDesign.textColor,
                            fontFamily: bookDesign.pageDesign.fontFamily,
                            fontSize: `${bookDesign.pageDesign.fontSize}px`,
                            lineHeight: bookDesign.pageDesign.lineHeight,
                            paddingTop: `${bookDesign.pageDesign.marginTop}px`,
                            paddingBottom: `${bookDesign.pageDesign.marginBottom}px`,
                            paddingLeft: `${bookDesign.pageDesign.marginLeft}px`,
                            paddingRight: `${bookDesign.pageDesign.marginRight}px`
                          }}
                        >
                          <h3 
                            style={{ 
                              color: bookDesign.pageDesign.headerColor,
                              fontFamily: bookDesign.pageDesign.headerFont,
                              fontSize: `${bookDesign.pageDesign.headerSize}px`,
                              marginBottom: '10px'
                            }}
                          >
                            Chapter 1: Introduction
                          </h3>
                          <p>
                            This is a sample paragraph to show how your book content will look with the selected design. 
                            The text will wrap naturally and maintain the spacing you've configured.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Book Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Chapters</h3>
                      <Button onClick={addChapter}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Chapter
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {bookDesign.content.chapters.map((chapter, index) => (
                        <div key={chapter.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <Input
                              value={chapter.title}
                              onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                              className="text-lg font-semibold"
                            />
                            <div className="flex gap-2">
                              <Badge variant="outline">Page {chapter.pageNumber}</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeChapter(chapter.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={chapter.content}
                            onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                            placeholder="Enter chapter content..."
                            rows={8}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleSaveBook}
                  disabled={loading}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Book'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit Mode' : 'Preview Mode'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/author-dashboard')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Book Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Book Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Chapters:</span>
                  <span className="font-bold">{bookDesign.content.chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pages:</span>
                  <span className="font-bold">{bookContent.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Price:</span>
                  <span className="font-bold">${bookContent.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Category:</span>
                  <span className="font-bold">{bookContent.category}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorBookCreation;

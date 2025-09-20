import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ShareIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  coverImage?: string;
  content: {
    chapters: Chapter[];
  };
  design: {
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
  };
  rating: number;
  totalReviews: number;
  isPurchased: boolean;
  isInLibrary: boolean;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

const EBookReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await authFetch(`/books/${id}`);
      if (res.ok) {
        const bookData = await res.json();
        setBook(bookData);
        if (bookData.design?.pageDesign) {
          setFontSize(bookData.design.pageDesign.fontSize);
          setLineHeight(bookData.design.pageDesign.lineHeight);
          setBackgroundColor(bookData.design.pageDesign.backgroundColor);
          setTextColor(bookData.design.pageDesign.textColor);
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      const res = await authFetch(`/books/${id}/purchase`, {
        method: 'POST',
      });
      if (res.ok) {
        setBook(prev => prev ? { ...prev, isPurchased: true } : null);
      }
    } catch (error) {
      console.error('Error purchasing book:', error);
    }
  };

  const handleAddToLibrary = async () => {
    try {
      const res = await authFetch(`/books/${id}/library`, {
        method: 'POST',
      });
      if (res.ok) {
        setBook(prev => prev ? { ...prev, isInLibrary: true } : null);
      }
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(page => page !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
    setIsBookmarked(!isBookmarked);
  };

  const nextChapter = () => {
    if (book && currentChapter < book.content.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(1);
    }
  };

  const nextPage = () => {
    if (book && currentChapter < book.content.chapters.length - 1) {
      nextChapter();
    }
  };

  const prevPage = () => {
    if (currentChapter > 0) {
      prevChapter();
    }
  };

  const goToChapter = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Book Not Found</h1>
          <p className="text-gray-600">The book you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentChapterData = book.content.chapters[currentChapter];

  return (
    <div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'bg-gray-50'}`}>
      {!isFullscreen && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{book.title}</h1>
                  <p className="text-gray-600">by {book.author}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setIsFullscreen(true)}>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          {!isFullscreen && (
            <div className="lg:col-span-1 space-y-6">
              {/* Book Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Book Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {book.coverImage && (
                    <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(book.rating)}
                    <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                  </div>
                  <Badge variant="outline">{book.category}</Badge>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${book.price}</span>
                    {!book.isPurchased && (
                      <Button onClick={handlePurchase} size="sm">
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Buy
                      </Button>
                    )}
                  </div>
                  {!book.isInLibrary && book.isPurchased && (
                    <Button onClick={handleAddToLibrary} variant="outline" className="w-full">
                      Add to Library
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Chapter Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Chapters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {book.content.chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => goToChapter(index)}
                        className={`w-full text-left p-2 rounded ${
                          index === currentChapter ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{chapter.title}</div>
                        <div className="text-xs text-gray-500">Page {chapter.pageNumber}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              {showSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reading Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Font Size: {fontSize}px</Label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={10}
                        max={24}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Line Height: {lineHeight}</Label>
                      <Slider
                        value={[lineHeight]}
                        onValueChange={(value) => setLineHeight(value[0])}
                        min={1}
                        max={3}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-8 h-8 rounded border"
                        />
                        <div className="flex gap-1">
                          {['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6'].map(color => (
                            <button
                              key={color}
                              onClick={() => setBackgroundColor(color)}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Text Color</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded border"
                        />
                        <div className="flex gap-1">
                          {['#000000', '#333333', '#666666', '#999999'].map(color => (
                            <button
                              key={color}
                              onClick={() => setTextColor(color)}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Main Reading Area */}
          <div className={`${isFullscreen ? 'col-span-4' : 'lg:col-span-3'}`}>
            <Card className="h-[600px]">
              <CardContent className="h-full p-6">
                {/* Reading Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevChapter}
                      disabled={currentChapter === 0}
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Chapter {currentChapter + 1} of {book.content.chapters.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextChapter}
                      disabled={currentChapter === book.content.chapters.length - 1}
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleBookmark}>
                      <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <HeartIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Book Content */}
                <div 
                  className="h-full overflow-y-auto p-6 rounded-lg"
                  style={{
                    backgroundColor,
                    color: textColor,
                    fontFamily: book.design?.pageDesign?.fontFamily || 'Arial',
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                >
                  <h2 
                    className="mb-6 pb-4 border-b"
                    style={{
                      color: book.design?.pageDesign?.headerColor || textColor,
                      fontFamily: book.design?.pageDesign?.headerFont || book.design?.pageDesign?.fontFamily || 'Arial',
                      fontSize: `${(book.design?.pageDesign?.headerSize || fontSize) + 4}px`,
                    }}
                  >
                    {currentChapterData?.title}
                  </h2>
                  <div 
                    className="prose max-w-none"
                    style={{
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {currentChapterData?.content}
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentChapter === 0}
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {book.content.chapters.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentChapter === book.content.chapters.length - 1}
                  >
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Controls */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-10">
          <Button variant="outline" onClick={() => setIsFullscreen(false)}>
            Exit Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
};

export default EBookReader;

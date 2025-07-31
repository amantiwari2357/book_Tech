import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BookmarkIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';
import { authFetch } from '@/lib/api';

interface Chapter {
  title: string;
  startPage: number;
}

interface EBookReaderProps {
  bookId: string;
  title: string;
  author: string;
  content?: string;
  isPremium?: boolean;
  chapters?: Chapter[];
}

const EBookReader: React.FC<EBookReaderProps> = ({ 
  bookId,
  title, 
  author, 
  content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit...", 
  isPremium = false,
  chapters
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState([16]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const totalPages = 248; // Mock total pages
  // Mock chapters if not provided
  const chapterList: Chapter[] = chapters && chapters.length > 0 ? chapters : [
    { title: 'Chapter 1: The Beginning', startPage: 1 },
    { title: 'Chapter 2: The Journey', startPage: 51 },
    { title: 'Chapter 3: The Challenge', startPage: 101 },
    { title: 'Chapter 4: The Climax', startPage: 151 },
    { title: 'Chapter 5: The Resolution', startPage: 201 },
  ];
  // Find current chapter
  const currentChapterIdx = chapterList.findIndex((c, i) => currentPage >= c.startPage && (i === chapterList.length - 1 || currentPage < chapterList[i + 1].startPage));
  const [progressPercent, setProgressPercent] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipValue, setTooltipValue] = useState('');
  const [goToPage, setGoToPage] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Fetch reading progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isAuthenticated || !bookId) return;
      setLoadingProgress(true);
      try {
        const res = await authFetch('/users/progress');
        if (res.ok) {
          const data = await res.json();
          const progress = data.find((p: any) => p.book === bookId || p.book?._id === bookId);
          if (progress && progress.page && progress.page > 1) {
            setCurrentPage(progress.page);
            setResumeAvailable(progress.page < totalPages);
          }
        }
      } catch {}
      setLoadingProgress(false);
    };
    fetchProgress();
    // eslint-disable-next-line
  }, [bookId, isAuthenticated]);

  // Save progress on page change
  useEffect(() => {
    setProgressPercent(Math.round((currentPage / totalPages) * 100));
    if (!isAuthenticated || !bookId) return;
    const percent = Math.round((currentPage / totalPages) * 100);
    authFetch('/users/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book: bookId, page: currentPage, percent }),
    });
    // eslint-disable-next-line
  }, [currentPage, bookId, isAuthenticated]);

  // Real-time sync: poll for progress every 5s
  useEffect(() => {
    if (!isAuthenticated || !bookId) return;
    const interval = setInterval(async () => {
      const res = await authFetch('/users/progress');
      if (res.ok) {
        const data = await res.json();
        const progress = data.find((p: any) => p.book === bookId || p.book?._id === bookId);
        if (progress && progress.page && progress.page !== currentPage) {
          setCurrentPage(progress.page);
          setResumeAvailable(progress.page < totalPages);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [bookId, isAuthenticated, currentPage, totalPages]);

  // Handler for Resume
  const handleResume = () => {
    setCurrentPage((prev) => prev); // Triggers re-render, but could be improved
  };

  // Bookmark toggle
  const handleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  // Progress bar mouse events
  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setTooltipX(x);
    setTooltipValue(`${percent}% / Page ${Math.round((percent / 100) * totalPages)}`);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Math.max(1, Math.min(totalPages, parseInt(goToPage)));
    setCurrentPage(page);
    setGoToPage('');
  };

  // Update reading progress
  const updateReadingProgress = async (progress: number) => {
    try {
      await authFetch('/users/progress', {
        method: 'POST',
        body: JSON.stringify({
          bookId: bookId,
          progress: progress,
          readingTime: Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
        })
      });
    } catch (error) {
      console.error('Failed to update reading progress:', error);
    }
  };

  // Update reading stats
  const updateReadingStats = async () => {
    try {
      const readingTime = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
      if (readingTime > 0) {
        await authFetch('/users/reading-stats', {
          method: 'POST',
          body: JSON.stringify({
            bookId: bookId,
            readingTime: readingTime,
            pagesRead: Math.floor(readingTime * 2) // Estimate pages read
          })
        });
      }
    } catch (error) {
      console.error('Failed to update reading stats:', error);
    }
  };

  // Track reading progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (currentPage > 0 && totalPages > 0) {
        const progress = Math.round((currentPage / totalPages) * 100);
        updateReadingProgress(progress);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(progressInterval);
      // Update final stats when component unmounts
      updateReadingStats();
    };
  }, [currentPage, totalPages]);

  // Update progress when page changes
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0) {
      const progress = Math.round((currentPage / totalPages) * 100);
      updateReadingProgress(progress);
    }
  }, [currentPage]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground transition-colors flex">
        {/* Chapter Navigation Sidebar */}
        <aside className="hidden md:block w-64 border-r border-border bg-muted/30 p-4">
          <h3 className="font-bold mb-4">Chapters</h3>
          <ul className="space-y-2">
            {chapterList.map((ch, idx) => (
              <li key={ch.title}>
                <button
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${idx === currentChapterIdx ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}`}
                  onClick={() => setCurrentPage(ch.startPage)}
                >
                  {ch.title}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="font-bold mt-8 mb-4">Bookmarks</h3>
          <ul className="space-y-2">
            {bookmarks.length === 0 && <li className="text-muted-foreground text-sm">No bookmarks yet.</li>}
            {bookmarks.sort((a, b) => a - b).map((page) => (
              <li key={page} className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded hover:bg-muted ${page === currentPage ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  Page {page}
                </button>
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => setBookmarks((prev) => prev.filter((p) => p !== page))}
                  title="Remove bookmark"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Main Reader Content */}
        <div className="flex-1">
          {/* Progress Bar with animation and tooltip */}
          <div
            className="h-2 w-full bg-muted/30 relative cursor-pointer"
            ref={progressBarRef}
            onMouseMove={e => { setShowTooltip(true); handleProgressBarMouseMove(e); }}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={e => {
              if (!progressBarRef.current) return;
              const rect = progressBarRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
              setCurrentPage(Math.max(1, Math.round((percent / 100) * totalPages)));
            }}
            style={{ transition: 'background 0.3s' }}
          >
            <div
              className="h-2 bg-primary transition-all"
              style={{ width: `${progressPercent}%`, transition: 'width 0.5s' }}
            />
            {showTooltip && (
              <div
                className="absolute top-0 left-0 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none"
                style={{ transform: `translateX(${tooltipX}px) translateY(-120%)` }}
              >
                {tooltipValue}
              </div>
            )}
          </div>
          {/* Go to Page input */}
          <div className="container mx-auto flex justify-end mt-2">
            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                placeholder="Go to page"
                className="w-24 p-1 border rounded text-sm"
              />
              <Button type="submit" size="sm" variant="outline">Go</Button>
            </form>
          </div>
          {/* Resume Button (hide if on last page) */}
          {resumeAvailable && currentPage < totalPages && (
            <div className="container mx-auto mt-4 flex justify-center">
              <Button variant="outline" onClick={handleResume}>
                Resume from page {currentPage}
              </Button>
            </div>
          )}
          {/* Mark as Finished on last page */}
          {currentPage === totalPages && (
            <div className="container mx-auto mt-4 flex justify-center">
              <Button
                variant="premium"
                onClick={() => {
                  setCurrentPage(totalPages);
                  authFetch('/users/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ book: bookId, page: totalPages, percent: 100 }),
                  });
                }}
              >
                Mark as Finished
              </Button>
            </div>
          )}
          {/* Header */}
          <header className="border-b border-border p-4 sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  ← Back to Library
                </Button>
                <div>
                  <h1 className="font-serif font-semibold text-lg">{title}</h1>
                  <p className="text-sm text-muted-foreground">by {author}</p>
                </div>
                {isPremium && (
                  <Badge className="bg-gradient-premium text-foreground border-0">
                    Premium
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={bookmarks.includes(currentPage) ? 'premium' : 'ghost'}
                  size="icon"
                  onClick={handleBookmark}
                  title={bookmarks.includes(currentPage) ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <BookmarkIcon className={`h-5 w-5 ${bookmarks.includes(currentPage) ? 'fill-current text-accent' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          {/* Reading Controls */}
          <div className="border-b border-border p-2 bg-muted/30">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Font Size:</span>
                <div className="w-24">
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
          {/* Content Area */}
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto min-h-[600px] bg-gradient-book">
              <CardContent className="p-12">
                <div 
                  className="prose max-w-none leading-relaxed text-justify"
                  style={{ fontSize: `${fontSize[0]}px` }}
                >
                  <h2 className="font-serif text-2xl mb-6">Chapter 1: The Beginning</h2>
                  <p className="mb-4">
                    {content} Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                    aliquip ex ea commodo consequat.
                  </p>
                  <p className="mb-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                    eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  {/* More content would go here */}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Navigation */}
          <div className="border-t border-border p-4 sticky bottom-0 bg-background/95 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {Math.round((currentPage / totalPages) * 100)}% complete
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookReader;
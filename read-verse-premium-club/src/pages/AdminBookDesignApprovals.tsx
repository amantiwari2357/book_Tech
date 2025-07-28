import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { EyeIcon, CheckIcon, XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';

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
  authorRef: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const AdminBookDesignApprovals: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [pendingDesigns, setPendingDesigns] = useState<BookDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<BookDesign | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPendingDesigns();
  }, []);

  const fetchPendingDesigns = async () => {
    try {
      console.log('Fetching pending book designs...');
      console.log('User authentication status:', isAuthenticated);
      
      const res = await authFetch('/book-designs/admin/pending');
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Pending designs data:', data);
        setPendingDesigns(data);
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        toast({
          title: "Error",
          description: "Failed to fetch pending book designs",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching pending designs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending book designs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (designId: string) => {
    try {
      const res = await authFetch(`/book-designs/admin/approve/${designId}`, {
        method: 'POST'
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Book design approved successfully"
        });
        setPendingDesigns(pendingDesigns.filter(d => d._id !== designId));
      } else {
        toast({
          title: "Error",
          description: "Failed to approve book design",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve book design",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (designId: string) => {
    try {
      const res = await authFetch(`/book-designs/admin/reject/${designId}`, {
        method: 'POST'
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Book design rejected successfully"
        });
        setPendingDesigns(pendingDesigns.filter(d => d._id !== designId));
      } else {
        toast({
          title: "Error",
          description: "Failed to reject book design",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject book design",
        variant: "destructive"
      });
    }
  };

  const openPreview = (design: BookDesign) => {
    setSelectedDesign(design);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Design Approvals</h1>
        <p className="text-gray-600">Review and approve pending book designs from authors</p>
      </div>

      {pendingDesigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Designs</h3>
            <p className="text-gray-600">All book designs have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingDesigns.map((design) => (
            <Card key={design._id} className="overflow-hidden">
              {/* Cover Image */}
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
                      <BookOpenIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No Cover</p>
                    </div>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                  Pending
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{design.title}</h3>
                    <p className="text-gray-600 text-sm">by {design.author}</p>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {design.description}
                  </p>

                  {/* Tags */}
                  {design.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {design.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Author Info */}
                  <div className="text-xs text-gray-500">
                    <p>Author: {design.authorRef.name}</p>
                    <p>Email: {design.authorRef.email}</p>
                    <p>Category: {design.category}</p>
                    <p>Price: {design.isFree ? 'Free' : `$${design.price}`}</p>
                  </div>

                  {/* Formatting Info */}
                  <div className="text-xs text-gray-500">
                    <p>Font: {design.formatting.fontFamily} {design.formatting.fontSize}px</p>
                    <p>Size: {design.formatting.pageWidth}" × {design.formatting.pageHeight}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPreview(design)}
                      className="flex-1"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(design._id)}
                      className="flex-1"
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(design._id)}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Preview: {selectedDesign.title}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowPreview(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Book Info */}
                <div>
                  <h3 className="font-semibold mb-2">Book Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {selectedDesign.title}</p>
                    <p><strong>Author:</strong> {selectedDesign.author}</p>
                    <p><strong>Category:</strong> {selectedDesign.category}</p>
                    <p><strong>Price:</strong> {selectedDesign.isFree ? 'Free' : `$${selectedDesign.price}`}</p>
                    <p><strong>Tags:</strong> {selectedDesign.tags.join(', ')}</p>
                    <p><strong>Description:</strong> {selectedDesign.description}</p>
                  </div>

                  <h3 className="font-semibold mb-2 mt-4">Formatting</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Font:</strong> {selectedDesign.formatting.fontFamily} {selectedDesign.formatting.fontSize}px</p>
                    <p><strong>Line Height:</strong> {selectedDesign.formatting.lineHeight}</p>
                    <p><strong>Text Color:</strong> {selectedDesign.formatting.textColor}</p>
                    <p><strong>Background:</strong> {selectedDesign.formatting.backgroundColor}</p>
                    <p><strong>Page Size:</strong> {selectedDesign.formatting.pageWidth}" × {selectedDesign.formatting.pageHeight}"</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <h3 className="font-semibold mb-2">Content Preview</h3>
                  <div 
                    className="border rounded-lg p-4 overflow-y-auto max-h-96"
                    style={{
                      backgroundColor: selectedDesign.formatting.backgroundColor,
                      color: selectedDesign.formatting.textColor,
                      fontFamily: selectedDesign.formatting.fontFamily,
                      fontSize: `${selectedDesign.formatting.fontSize}px`,
                      lineHeight: selectedDesign.formatting.lineHeight,
                    }}
                  >
                    <h1 className="text-xl font-bold mb-2">{selectedDesign.title}</h1>
                    <p className="text-sm mb-4">by {selectedDesign.author}</p>
                    <div className="whitespace-pre-wrap">
                      {selectedDesign.content.substring(0, 1000)}
                      {selectedDesign.content.length > 1000 && '...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(selectedDesign._id)}
                  className="flex-1"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Approve Design
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedDesign._id)}
                  className="flex-1"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject Design
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookDesignApprovals; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, HomeIcon, MagnifyingGlassIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Page Not Found - BookTech</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our digital library and discover thousands of books." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry though - you can still explore our amazing collection of books!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/')}>
              <CardHeader className="text-center">
                <HomeIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Go Home</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Return to our homepage and discover featured books
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/browse')}>
              <CardHeader className="text-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Browse Books</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore our entire collection of books by genre
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/categories')}>
              <CardHeader className="text-center">
                <BookOpenIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find books by category or topic
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/subscriptions')}>
              <CardHeader className="text-center">
                <UserIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upgrade to premium for unlimited access
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate('/')}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Return Home
            </Button>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>If you believe this is an error, please contact our support team.</p>
            <p className="mt-2">
              <a href="/support/contact" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

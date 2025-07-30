import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Share2,
  Heart,
  BookOpen,
  Users,
  Star
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Social media sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out BookTech - Your Premium Digital Library Platform!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Discover thousands of books on BookTech - Your Premium Digital Library Platform! 📚');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('BookTech - Premium Digital Library Platform');
    const summary = encodeURIComponent('Discover thousands of premium books and enjoy seamless reading experiences.');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out BookTech - Your Premium Digital Library Platform! 📚');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">BookTech</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Your premium digital library platform. Discover thousands of books, 
              enjoy seamless reading experiences, and unlock knowledge.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.open('https://facebook.com/booktech', '_blank')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.open('https://twitter.com/booktech', '_blank')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.open('https://instagram.com/booktech', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.open('https://linkedin.com/company/booktech', '_blank')}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => window.open('https://youtube.com/booktech', '_blank')}
              >
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-gray-300 hover:text-white transition-colors">
                  Premium Plans
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/support/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/support/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Share Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Share BookTech</h4>
            <p className="text-gray-300 text-sm">
              Help others discover our amazing digital library!
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800"
                onClick={shareOnFacebook}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Share on Facebook
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800"
                onClick={shareOnLinkedIn}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800"
                onClick={shareOnWhatsApp}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold">10,000+</span>
              </div>
              <p className="text-sm text-gray-300">Books Available</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold">50,000+</span>
              </div>
              <p className="text-sm text-gray-300">Happy Readers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold">4.8</span>
              </div>
              <p className="text-sm text-gray-300">Average Rating</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <p className="text-sm text-gray-300">Support Available</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} BookTech. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant="secondary" className="text-xs">
              Made with ❤️ for readers
            </Badge>
            <Badge variant="outline" className="text-xs">
              Version 2.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-serif font-bold text-primary">BookTech</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your premier destination for digital books and premium reading experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">Browse Books</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/new-releases" className="text-muted-foreground hover:text-primary transition-colors">New Releases</Link></li>
              <li><Link to="/bestsellers" className="text-muted-foreground hover:text-primary transition-colors">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/subscriptions" className="text-muted-foreground hover:text-primary transition-colors">Premium Plans</Link></li>
              <li><Link to="/upload" className="text-muted-foreground hover:text-primary transition-colors">Upload Books</Link></li>
              <li><Link to="/reader" className="text-muted-foreground hover:text-primary transition-colors">Online Reader</Link></li>
              <li><Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 BookTech. All rights reserved. Empowering readers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
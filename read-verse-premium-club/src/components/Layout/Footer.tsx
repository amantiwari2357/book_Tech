import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer: React.FC = () => {
  const { elementRef: footerRef, isVisible: footerVisible } = useScrollAnimation();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const footerSections = [
    {
      id: 'quick-links',
      title: 'Quick Links',
      links: [
        { name: 'Browse Books', to: '/browse' },
        { name: 'Categories', to: '/categories' },
        { name: 'New Releases', to: '/new-releases' },
        { name: 'Bestsellers', to: '/bestsellers' },
        { name: 'Premium Plans', to: '/subscriptions' }
      ]
    },
    {
      id: 'services',
      title: 'Services',
      links: [
        { name: 'Upload Books', to: '/upload' },
        { name: 'Online Reader', to: '/reader' },
        { name: 'Book Design Studio', to: '/book-design' },
        { name: 'Support Center', to: '/support' },
        { name: 'Notifications', to: '/notifications' }
      ]
    },
    {
      id: 'contact-support',
      title: 'Contact & Support',
      links: [
        { name: 'Help Center', to: '/help' },
        { name: 'Contact Us', to: '/contact' },
        { name: 'Privacy Policy', to: '/privacy' },
        { name: 'Terms of Service', to: '/terms' },
        { name: 'About Us', to: '/about' }
      ]
    }
  ];

  return (
    <footer ref={footerRef} className={`bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-16 relative overflow-hidden footer-mobile ${footerVisible ? 'fade-in-bounce animate-in' : 'fade-in-bounce'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section - Full width on mobile, 1/4 on desktop */}
          <div className={`lg:col-span-1 space-y-6 footer-mobile-brand ${footerVisible ? 'slide-in-left animate-in' : 'slide-in-left'}`}>
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg shadow-lg">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-serif font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                BookTech
              </span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center lg:text-left">
              Your premier destination for digital books and premium reading experiences. 
              Discover, read, and explore the world of literature.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <a href="#" className="mobile-social-icon p-2 rounded-full transition-all duration-300 hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="mobile-social-icon p-2 rounded-full transition-all duration-300 hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="mobile-social-icon p-2 rounded-full transition-all duration-300 hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Sections - Responsive Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {footerSections.map((section, index) => (
                <div key={section.id} className={`footer-mobile-links ${footerVisible ? 'slide-in-left animate-in' : 'slide-in-left'}`} style={{ transitionDelay: `${(index + 1) * 0.1}s` }}>
                  {/* Mobile Accordion Header */}
                  <div className="md:hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between py-4 text-left border-b border-gray-200"
                    >
                      <h3 className="mobile-section-header font-bold text-lg text-gray-800 relative">
                        {section.title}
                        <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                      </h3>
                      {expandedSections[section.id] ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500 transition-transform" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden md:block">
                    <h3 className="mobile-section-header font-bold text-lg mb-6 text-gray-800 relative">
                      {section.title}
                      <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                    </h3>
                  </div>

                  {/* Links - Show on desktop, conditional on mobile */}
                  <div className={`${expandedSections[section.id] ? 'block' : 'hidden'} md:block`}>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link 
                            to={link.to} 
                            className="mobile-link-hover text-gray-600 hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                          >
                            <span className="w-1 h-1 bg-primary rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section - Enhanced Mobile Responsive */}
        <div className={`footer-mobile-newsletter mt-12 lg:mt-16 ${footerVisible ? 'scale-in animate-in' : 'scale-in'}`} style={{ transitionDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 lg:p-8 border border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div className="text-center lg:text-left">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">Stay Updated</h3>
                <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                  Get the latest books and reading recommendations delivered to your inbox. 
                  Never miss a new release or exclusive content.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="mobile-newsletter-input px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-sm lg:text-base flex-1"
                />
                <button className="mobile-newsletter-btn px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className={`footer-mobile-bottom mt-8 lg:mt-12 ${footerVisible ? 'fade-in-bounce animate-in' : 'fade-in-bounce'}`} style={{ transitionDelay: '0.5s' }}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200">
            <div className="text-center lg:text-left">
              <p className="text-gray-600 text-sm lg:text-base">
                © 2025 <span className="font-semibold text-primary">BookTech</span>. All rights reserved. 
                <span className="hidden lg:inline"> Empowering readers worldwide.</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 text-sm lg:text-base">
              <span className="text-gray-500 flex items-center">
                <span className="text-red-500 mr-1">❤️</span>
                Made with love for readers
              </span>
              <div className="hidden lg:flex items-center space-x-2 text-gray-400">
                <GlobeAltIcon className="h-4 w-4" />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
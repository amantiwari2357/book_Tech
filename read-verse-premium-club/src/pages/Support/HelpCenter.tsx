import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CreditCardIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      description: 'Learn the basics of using BookTech',
      articles: 8,
      color: 'bg-blue-500'
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: UserIcon,
      description: 'Manage your account settings and profile',
      articles: 12,
      color: 'bg-green-500'
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions & Billing',
      icon: CreditCardIcon,
      description: 'Questions about plans and payments',
      articles: 15,
      color: 'bg-purple-500'
    },
    {
      id: 'reading',
      title: 'Reading & Library',
      icon: BookOpenIcon,
      description: 'How to read books and manage your library',
      articles: 10,
      color: 'bg-orange-500'
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: WrenchScrewdriverIcon,
      description: 'Troubleshooting and technical issues',
      articles: 6,
      color: 'bg-red-500'
    }
  ];

  const popularArticles = [
    {
      title: 'How to start reading a book',
      category: 'Getting Started',
      views: 1234,
      helpful: 89
    },
    {
      title: 'Understanding subscription plans',
      category: 'Subscriptions',
      views: 987,
      helpful: 76
    },
    {
      title: 'How to download books for offline reading',
      category: 'Reading',
      views: 856,
      helpful: 92
    },
    {
      title: 'Troubleshooting login issues',
      category: 'Account',
      views: 743,
      helpful: 68
    },
    {
      title: 'How to cancel your subscription',
      category: 'Subscriptions',
      views: 621,
      helpful: 71
    }
  ];

  const faqs = [
    {
      question: 'How do I start reading a book?',
      answer: 'To start reading a book, simply click on any book cover in your library or browse section. If you have a premium subscription, you can read unlimited books. Free users can access a limited selection.'
    },
    {
      question: 'What\'s included in the premium subscription?',
      answer: 'Premium subscription includes unlimited access to our entire library, offline reading, advanced reading features, priority customer support, and early access to new releases.'
    },
    {
      question: 'Can I read books offline?',
      answer: 'Yes! Premium subscribers can download books for offline reading. Simply click the download button on any book page to save it to your device.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription anytime from your account settings. Go to Subscriptions > Manage Plan > Cancel Subscription. Your access will continue until the end of your billing period.'
    },
    {
      question: 'What devices are supported?',
      answer: 'BookTech works on all modern web browsers including Chrome, Firefox, Safari, and Edge. We also have mobile-optimized web experience for iOS and Android devices.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the sign-in page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to set a new password.'
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: ChatBubbleLeftRightIcon,
      available: 'Available 24/7',
      action: 'Start Chat'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: QuestionMarkCircleIcon,
      available: 'Response within 24 hours',
      action: 'Send Email'
    },
    {
      title: 'Phone Support',
      description: 'Call our support hotline',
      icon: PhoneIcon,
      available: 'Mon-Fri 9AM-6PM EST',
      action: 'Call Now'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              How can we help you?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search our knowledge base or browse categories to find answers
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg"
              />
              <Button className="absolute right-2 top-2 h-10">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <Badge variant="secondary">{category.articles} articles</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.views} views</span>
                        <span>•</span>
                        <span>{article.helpful}% helpful</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="px-6 py-4 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Options */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Still need help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index}>
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">{option.available}</p>
                    <Button className="w-full" asChild>
                      <Link to="/contact">{option.action}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
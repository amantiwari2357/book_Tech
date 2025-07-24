import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircleIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const CheckoutSuccess: React.FC = () => {
  const features = [
    {
      title: 'Unlimited Reading',
      description: 'Access to our entire library of books',
      icon: BookOpenIcon
    },
    {
      title: 'Offline Access',
      description: 'Download books to read anywhere',
      icon: SparklesIcon
    },
    {
      title: 'Premium Features',
      description: 'Advanced reading tools and customization',
      icon: SparklesIcon
    }
  ];

  const nextSteps = [
    {
      title: 'Browse the Library',
      description: 'Explore thousands of books across all genres',
      link: '/browse',
      button: 'Start Browsing'
    },
    {
      title: 'Discover New Releases',
      description: 'Check out the latest additions to our collection',
      link: '/categories',
      button: 'View New Releases'
    },
    {
      title: 'Get Recommendations',
      description: 'Find books tailored to your interests',
      link: '/recommendations',
      button: 'Get Recommendations'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Welcome to BookTech Premium!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your subscription is now active and ready to use
            </p>
          </div>

          {/* Subscription Details */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Premium Subscription</span>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </CardTitle>
              <CardDescription>
                You now have unlimited access to our entire library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's next?</CardTitle>
              <CardDescription>
                Here are some great ways to get started with your new subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Button asChild>
                    <Link to={step.link} className="flex items-center space-x-2">
                      <span>{step.button}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Subscription Plan</h4>
                  <p className="text-muted-foreground">Premium Monthly</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Next Billing Date</h4>
                  <p className="text-muted-foreground">January 15, 2025</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Amount</h4>
                  <p className="text-muted-foreground">$19.99/month</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Status</h4>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  You can manage your subscription, update payment methods, or cancel anytime from your account settings.
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" asChild>
                    <Link to="/account">Manage Subscription</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/help">Get Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Email */}
          <Card>
            <CardContent className="p-6 text-center">
              <h4 className="font-medium text-foreground mb-2">Confirmation Email Sent</h4>
              <p className="text-sm text-muted-foreground mb-4">
                We've sent a confirmation email with your subscription details. 
                Please check your inbox and spam folder.
              </p>
              <div className="flex justify-center space-x-3">
                <Button asChild>
                  <Link to="/">Go to Homepage</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/browse">Start Reading</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
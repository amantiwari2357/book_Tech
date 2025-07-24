import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '@/lib/api';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Message sent!');
        setEmail('');
        setMessage('');
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      details: 'support@booktech.com',
      description: 'Response within 24 hours'
    },
    {
      icon: MapPinIcon,
      title: 'Address',
      details: '123 Innovation Drive',
      description: 'San Francisco, CA 94105'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      details: 'Monday - Friday',
      description: '9:00 AM - 6:00 PM EST'
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: ChatBubbleLeftRightIcon,
      action: 'Start Chat',
      available: true
    },
    {
      title: 'Technical Support',
      description: 'Report bugs or technical issues',
      icon: PhoneIcon,
      action: 'Report Issue',
      available: true
    },
    {
      title: 'Billing Support',
      description: 'Questions about your subscription or billing',
      icon: EnvelopeIcon,
      action: 'Contact Billing',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help. Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select name="subject" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select name="priority" defaultValue="normal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="normal">Normal - Standard inquiry</SelectItem>
                        <SelectItem value="high">High - Issue affecting service</SelectItem>
                        <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {success && (
                    <p className="text-green-500 text-center">{success}</p>
                  )}
                  {error && (
                    <p className="text-red-500 text-center">{error}</p>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Need immediate help? Try these options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={!action.available}
                      >
                        {action.action}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Other ways to reach us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mt-1">
                        <IconComponent className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{info.title}</h4>
                        <p className="text-sm text-foreground">{info.details}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-medium text-foreground mb-2">
                  Looking for quick answers?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our FAQ section for instant solutions to common questions.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/help">Browse FAQ</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
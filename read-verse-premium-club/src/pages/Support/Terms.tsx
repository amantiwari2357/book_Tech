import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Terms: React.FC = () => {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using BookTech, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Changes to Terms",
          text: "We reserve the right to change these terms at any time. Your continued use of the platform constitutes acceptance of such changes."
        }
      ]
    },
    {
      title: "Account Registration",
      content: [
        {
          subtitle: "Account Creation",
          text: "To access certain features of our service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason."
        }
      ]
    },
    {
      title: "Subscription Services",
      content: [
        {
          subtitle: "Premium Subscriptions",
          text: "Our premium subscription services provide access to additional features and content. Subscription fees are billed in advance on a recurring basis."
        },
        {
          subtitle: "Billing and Payment",
          text: "By subscribing to our premium service, you agree to pay all applicable fees. Payments are processed through secure third-party payment processors."
        },
        {
          subtitle: "Cancellation",
          text: "You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period, and no refunds are provided for partial periods."
        },
        {
          subtitle: "Price Changes",
          text: "We reserve the right to change subscription prices with 30 days advance notice to subscribers."
        }
      ]
    },
    {
      title: "Content and Intellectual Property",
      content: [
        {
          subtitle: "Platform Content",
          text: "All content available on BookTech, including but not limited to text, graphics, logos, images, and software, is the property of BookTech or its content suppliers."
        },
        {
          subtitle: "User-Generated Content",
          text: "By uploading content to our platform, you grant BookTech a non-exclusive, royalty-free license to use, display, and distribute such content."
        },
        {
          subtitle: "Copyright Protection",
          text: "We respect intellectual property rights. If you believe your copyright has been infringed, please contact us with details of the alleged infringement."
        },
        {
          subtitle: "Prohibited Use",
          text: "You may not copy, modify, distribute, sell, or lease any part of our services or included software, nor may you reverse engineer or attempt to extract the source code."
        }
      ]
    },
    {
      title: "User Conduct",
      content: [
        {
          subtitle: "Acceptable Use",
          text: "You agree to use our service only for lawful purposes and in accordance with these terms. You will not use the service in any way that could damage, disable, or impair the service."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not: upload malicious content, attempt to gain unauthorized access, interfere with the service's operation, or violate any applicable laws or regulations."
        },
        {
          subtitle: "Content Standards",
          text: "Any content you upload must not be illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable."
        }
      ]
    },
    {
      title: "Privacy and Data Protection",
      content: [
        {
          subtitle: "Privacy Policy",
          text: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices."
        },
        {
          subtitle: "Data Collection",
          text: "We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws."
        }
      ]
    },
    {
      title: "Disclaimers and Limitations",
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive to provide continuous service but do not guarantee that the service will be uninterrupted or error-free. We reserve the right to modify or discontinue the service at any time."
        },
        {
          subtitle: "Content Accuracy",
          text: "While we strive to provide accurate and up-to-date content, we make no warranties about the completeness, reliability, or accuracy of the information."
        },
        {
          subtitle: "Third-Party Content",
          text: "Our service may contain links to third-party websites or services. We are not responsible for the content or practices of these third parties."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        {
          subtitle: "Damages",
          text: "In no event shall BookTech be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
        },
        {
          subtitle: "Maximum Liability",
          text: "Our total liability for any claims arising from or related to this agreement shall not exceed the amount paid by you for the service during the 12 months preceding the claim."
        }
      ]
    },
    {
      title: "Governing Law",
      content: [
        {
          subtitle: "Jurisdiction",
          text: "These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions."
        },
        {
          subtitle: "Dispute Resolution",
          text: "Any disputes arising from these terms or your use of the service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using our service
            </p>
            <Badge variant="secondary" className="text-sm">
              Last updated: {lastUpdated}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to BookTech. These Terms of Service ("Terms") govern your use of our website, 
                mobile application, and services (collectively, the "Service") operated by BookTech. 
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                with any part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    {index + 1}. {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h4 className="font-semibold text-foreground mb-2">
                        {item.subtitle}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@booktech.com</p>
                <p><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>

          {/* Effective Date */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h4 className="font-semibold text-foreground mb-2">
                Effective Date and Updates
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service are effective as of {lastUpdated}. We reserve the right to 
                update or change our Terms of Service at any time. Any changes will be posted on this 
                page with an updated revision date. Your continued use of the Service after any such 
                changes constitutes your acceptance of the new Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
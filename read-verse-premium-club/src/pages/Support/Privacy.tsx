import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Privacy: React.FC = () => {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect your name, email address, and password. If you subscribe to our premium service, we also collect billing information through our secure payment processor."
        },
        {
          subtitle: "Reading Data",
          text: "We track your reading progress, bookmarks, and preferences to provide personalized recommendations and sync your library across devices."
        },
        {
          subtitle: "Usage Information",
          text: "We collect information about how you interact with our platform, including pages visited, features used, and time spent reading."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our book reading services, including personalizing your experience and recommendations."
        },
        {
          subtitle: "Communication",
          text: "We may send you service-related emails, updates about new features, and promotional content (which you can opt out of at any time)."
        },
        {
          subtitle: "Analytics",
          text: "We analyze usage patterns to improve our platform performance and develop new features that benefit our users."
        }
      ]
    },
    {
      title: "Information Sharing",
      content: [
        {
          subtitle: "We Do Not Sell Your Data",
          text: "We never sell, rent, or trade your personal information to third parties for marketing purposes."
        },
        {
          subtitle: "Service Providers",
          text: "We may share information with trusted service providers who help us operate our platform, such as payment processors and cloud hosting services."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law or to protect our rights, privacy, safety, or property."
        }
      ]
    },
    {
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols. Your password is hashed and never stored in plain text."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and regularly audit our systems to ensure your data remains secure."
        },
        {
          subtitle: "Regular Updates",
          text: "We regularly update our security measures and conduct security assessments to protect against new threats."
        }
      ]
    },
    {
      title: "Your Rights",
      content: [
        {
          subtitle: "Access and Portability",
          text: "You can access, download, or delete your personal data at any time through your account settings."
        },
        {
          subtitle: "Correction",
          text: "You can update your personal information through your account settings or by contacting our support team."
        },
        {
          subtitle: "Deletion",
          text: "You can request deletion of your account and associated data. Some information may be retained for legal or legitimate business purposes."
        }
      ]
    },
    {
      title: "Cookies and Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use cookies that are necessary for the platform to function, such as keeping you logged in and remembering your preferences."
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use analytics cookies to understand how users interact with our platform and to improve our services."
        },
        {
          subtitle: "Cookie Control",
          text: "You can control cookie settings through your browser preferences, though disabling some cookies may affect platform functionality."
        }
      ]
    },
    {
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Age Restrictions",
          text: "Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13."
        },
        {
          subtitle: "Parental Consent",
          text: "If we become aware that we have collected personal information from a child under 13, we will delete that information promptly."
        }
      ]
    },
    {
      title: "International Data Transfers",
      content: [
        {
          subtitle: "Global Service",
          text: "Our service is available globally, and your data may be processed in countries other than your own."
        },
        {
          subtitle: "Adequate Protection",
          text: "We ensure that any international data transfers comply with applicable privacy laws and provide adequate protection for your data."
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
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              How we collect, use, and protect your information
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
                At BookTech, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website and use our services. 
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
                policy, please do not access the site.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
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
                Contact Us About Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, the practices of this site, 
                or your dealings with this site, please contact us at:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@booktech.com</p>
                <p><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h4 className="font-semibold text-foreground mb-2">
                Changes to This Privacy Policy
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time in order to reflect changes to our 
                practices or for other operational, legal, or regulatory reasons. We will notify you of 
                any material changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
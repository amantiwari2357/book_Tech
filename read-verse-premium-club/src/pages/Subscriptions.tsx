import React from 'react';
import PricingSection from '@/components/Subscription/PricingSection';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Subscriptions: React.FC = () => {
  const features = [
    {
      name: 'Access to basic library',
      basic: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Standard reading features',
      basic: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Premium books access',
      basic: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Offline reading',
      basic: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Advanced reader settings',
      basic: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Priority support',
      basic: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Team collaboration',
      basic: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'Admin dashboard',
      basic: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'Custom integrations',
      basic: false,
      premium: false,
      enterprise: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Unlock unlimited access to premium content with flexible subscription options 
            designed for every type of reader.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Feature Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Compare Plans</h2>
            <p className="text-muted-foreground">
              See exactly what's included with each subscription tier
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-background rounded-lg shadow-book overflow-hidden">
              <div className="grid grid-cols-4 gap-0">
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <h3 className="font-semibold">Features</h3>
                </div>
                <div className="p-6 border-b border-border text-center">
                  <h3 className="font-semibold">Basic</h3>
                  <p className="text-sm text-muted-foreground">$9.99/month</p>
                </div>
                <div className="p-6 border-b border-border text-center bg-gradient-premium/10">
                  <h3 className="font-semibold">Premium</h3>
                  <p className="text-sm text-muted-foreground">$19.99/month</p>
                </div>
                <div className="p-6 border-b border-border text-center">
                  <h3 className="font-semibold">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">$39.99/month</p>
                </div>

                {/* Features */}
                {features.map((feature, index) => (
                  <React.Fragment key={feature.name}>
                    <div className={`p-4 border-b border-border ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      <span className="text-sm">{feature.name}</span>
                    </div>
                    <div className={`p-4 border-b border-border text-center ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      {feature.basic ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </div>
                    <div className={`p-4 border-b border-border text-center ${index % 2 === 0 ? 'bg-muted/30 bg-gradient-premium/5' : 'bg-gradient-premium/5'}`}>
                      {feature.premium ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </div>
                    <div className={`p-4 border-b border-border text-center ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      {feature.enterprise ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected 
                in your next billing cycle.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                All plans include a 7-day free trial so you can explore our platform risk-free.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and other secure payment methods.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscriptions;
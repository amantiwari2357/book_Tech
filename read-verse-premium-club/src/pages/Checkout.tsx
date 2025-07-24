import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store';
import { 
  CheckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const { availablePlans } = useAppSelector((state) => state.subscription);

  const handleCheckout = async (planId: string) => {
    setIsProcessing(true);
    // Stripe checkout integration will be implemented with Supabase
    console.log('Processing checkout for plan:', planId);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to success page
      navigate('/checkout-success');
    }, 2000);
  };

  const selectedPlanDetails = availablePlans.find(plan => plan.id === selectedPlan);

  const features = [
    'Access to entire library',
    'Unlimited reading time',
    'Offline reading capability',
    'Advanced reading features',
    'Priority customer support',
    'Early access to new releases',
    'Personalized recommendations',
    'Cross-device synchronization'
  ];

  const securityFeatures = [
    'Secure SSL encryption',
    '30-day money-back guarantee',
    'Cancel anytime',
    'Instant access'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Complete Your Subscription
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Join thousands of readers and unlock access to our entire library
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Options */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>
                  Select the subscription plan that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedPlan === plan.id && (
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">{plan.name}</h3>
                            {plan.isPopular && (
                              <Badge variant="default">Most Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {plan.features[0]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          ${plan.price}
                        </div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Your payment will be processed securely by Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">Credit/Debit Card</h3>
                    <p className="text-sm text-muted-foreground">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  <span>Secure & Protected</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlanDetails && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {selectedPlanDetails.name} Plan
                        </h3>
                        <p className="text-sm text-muted-foreground">Monthly subscription</p>
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        ${selectedPlanDetails.price}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">What's included:</h4>
                      <div className="space-y-1">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckIcon className="h-3 w-3 text-primary" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total per month</span>
                      <span>${selectedPlanDetails.price}</span>
                    </div>

                    <Button
                      className="w-full h-12 text-lg"
                      onClick={() => handleCheckout(selectedPlan)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Start Subscription'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By clicking "Start Subscription", you agree to our{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-medium text-foreground mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Our support team is here to assist you
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
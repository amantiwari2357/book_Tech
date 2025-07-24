import React from 'react';
import PricingCard from './PricingCard';
import { useAppSelector } from '@/store';
import { SubscriptionPlan } from '@/store/slices/subscriptionSlice';

const PricingSection: React.FC = () => {
  const { availablePlans, currentPlan } = useAppSelector((state) => state.subscription);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    // This will be implemented with Stripe integration
    console.log('Subscribe to plan:', plan);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Choose Your Reading Plan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited access to our premium library with flexible subscription options
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {availablePlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isCurrentPlan={currentPlan?.id === plan.id}
            />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
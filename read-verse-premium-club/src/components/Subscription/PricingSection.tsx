import React, { useEffect } from 'react';
import PricingCard from './PricingCard';
import { useAppSelector, useAppDispatch } from '@/store';
import { SubscriptionPlan, fetchPlans } from '@/store/slices/subscriptionSlice';
import { authFetch } from '@/lib/api';

const PricingSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availablePlans, currentPlan, loading, error } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    console.log('PricingSection: Fetching plans...');
    dispatch(fetchPlans());
  }, [dispatch]);

  // Fallback plans if API fails
  const fallbackPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: ['Access to 1000+ books', 'Standard support', 'Basic reading features'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: ['Access to all books', 'Priority support', 'Advanced reading features', 'Offline reading'],
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 39.99,
      features: ['Everything in Premium', 'Team collaboration', 'Admin dashboard', 'Custom integrations'],
    },
  ];

  const plansToShow = availablePlans.length > 0 ? availablePlans : fallbackPlans;

  console.log('PricingSection: availablePlans:', availablePlans);
  console.log('PricingSection: plansToShow:', plansToShow);
  console.log('PricingSection: loading:', loading);
  console.log('PricingSection: error:', error);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      const res = await authFetch('/checkout/create-subscription-link', {
        method: 'POST',
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          planPrice: plan.price,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paymentLink) {
          window.location.href = data.paymentLink;
        } else {
          alert('Failed to create payment link');
        }
      } else {
        let errorMsg = 'Subscription failed';
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        alert(errorMsg);
      }
    } catch (error) {
      alert('Subscription failed. Please try again.');
    }
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
        {loading && <p className="text-center text-lg">Loading plans...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && availablePlans.length === 0 && (
          <p className="text-center text-yellow-600 mb-4">Using default plans (API not available)</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plansToShow.map((plan) => (
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
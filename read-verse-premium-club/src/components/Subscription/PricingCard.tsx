import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from '@heroicons/react/24/solid';
import { SubscriptionPlan } from '@/store/slices/subscriptionSlice';

interface PricingCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onSubscribe, isCurrentPlan }) => {
  return (
    <Card className={`relative overflow-hidden ${plan.isPopular ? 'border-accent shadow-premium scale-105' : ''} ${isCurrentPlan ? 'bg-gradient-book' : ''}`}>
      {plan.isPopular && (
        <Badge className="absolute top-4 right-4 bg-gradient-premium text-foreground border-0">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <h3 className="text-2xl font-serif font-bold">{plan.name}</h3>
        <div className="flex items-baseline justify-center space-x-1">
          <span className="text-4xl font-bold text-primary">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <CheckIcon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        {isCurrentPlan ? (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            Current Plan
          </Button>
        ) : (
          <Button
            variant={plan.isPopular ? "premium" : "default"}
            className="w-full"
            onClick={() => onSubscribe(plan)}
          >
            {plan.isPopular ? "Get Premium" : "Subscribe"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
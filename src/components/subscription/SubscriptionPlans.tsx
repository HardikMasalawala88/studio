
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { ALL_SUBSCRIPTION_PLANS, USER_ROLES } from '@/lib/constants';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { format, formatDistanceToNowStrict } from 'date-fns';

export function SubscriptionPlans() {
  const { user, updateSubscription, refreshUser, isSubscriptionActive, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null); // Plan ID being loaded

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user || user.role !== USER_ROLES.ADVOCATE) return;
    setIsLoading(plan.id);
    const success = await updateSubscription(plan);
    if (success) {
      await refreshUser(); // Refresh user data from AuthContext to get updated subscription
    }
    setIsLoading(null);
  };

  const currentPlan = user?.subscriptionPlanId ? ALL_SUBSCRIPTION_PLANS.find(p => p.id === user.subscriptionPlanId) : null;

  return (
    <div className="space-y-8">
      {user && user.role === USER_ROLES.ADVOCATE && currentPlan && (
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Your Current Plan: {currentPlan.name}
            </CardTitle>
            {user.subscriptionExpiryDate && (
              <CardDescription>
                {isSubscriptionActive
                  ? `Expires on: ${format(new Date(user.subscriptionExpiryDate), "PPP")} (${formatDistanceToNowStrict(new Date(user.subscriptionExpiryDate))} remaining)`
                  : `Expired on: ${format(new Date(user.subscriptionExpiryDate), "PPP")}`}
              </CardDescription>
            )}
          </CardHeader>
           {user.subscriptionExpiryDate && !isSubscriptionActive && (
             <CardContent>
                <p className="text-destructive font-semibold">Your subscription has expired. Please choose a plan to continue full access.</p>
             </CardContent>
           )}
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_SUBSCRIPTION_PLANS.filter(plan => !plan.isTrial).map((plan) => ( // Don't show trial as a selectable option here
          <Card key={plan.id} className={`flex flex-col ${currentPlan?.id === plan.id && isSubscriptionActive ? 'border-2 border-green-500' : 'hover:shadow-xl transition-shadow'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-headline">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <p className="text-3xl font-bold">
                ₹{plan.priceINR} <span className="text-sm font-normal text-muted-foreground">/ {plan.durationMonths} months</span>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Full access to all features</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Add, Edit, Delete Cases</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority Support (Simulated)</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSelectPlan(plan)} 
                disabled={isLoading === plan.id || authLoading || (currentPlan?.id === plan.id && isSubscriptionActive)}
              >
                {isLoading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentPlan?.id === plan.id && isSubscriptionActive ? 'Currently Active' : 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <p className="text-center text-sm text-muted-foreground mt-8">
        Payments are processed securely (simulation). By subscribing, you agree to our Terms of Service.
      </p>
    </div>
  );
}


"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { USER_ROLES, type SubscriptionPlanId } from '@/lib/constants';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { getSubscriptionPlans, getSubscriptionPlanById } from '@/lib/userService'; // Fetch plans from service
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export function SubscriptionPlans() {
  const { user, updateSubscription: authUpdateSubscription, refreshUser, isSubscriptionActive, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null); // Plan ID being loaded
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      setLoadingPlans(true);
      const plans = await getSubscriptionPlans();
      setAllPlans(plans.filter(p => !p.isTrial)); // Don't show trial as a selectable option here
      setLoadingPlans(false);
    }
    fetchPlans();
  }, []);

  const handleSelectPlan = async (planToSelect: SubscriptionPlan) => {
    if (!user || user.role !== USER_ROLES.ADVOCATE) return;
    setIsLoading(planToSelect.id);
    // Fetch the latest plan details from service before updating
    // This ensures any admin changes to price/duration are used
    const latestPlanDetails = await getSubscriptionPlanById(planToSelect.id);
    if (!latestPlanDetails) {
        // toast({ title: "Error", description: "Selected plan details could not be found. Please try again.", variant: "destructive" });
        setIsLoading(null);
        return;
    }
    const success = await authUpdateSubscription(latestPlanDetails.id); // Pass only ID, AuthContext will fetch details
    if (success) {
      await refreshUser(); 
    }
    setIsLoading(null);
  };

  const currentPlan = user?.subscriptionPlanId ? allPlans.find(p => p.id === user.subscriptionPlanId) : null;
  // If current plan is not in allPlans (e.g. it's a trial plan), fetch it directly for display
  const [currentPlanDetails, setCurrentPlanDetails] = useState<SubscriptionPlan | null>(null);
  useEffect(() => {
    if (user?.subscriptionPlanId) {
        getSubscriptionPlanById(user.subscriptionPlanId).then(plan => {
            if (plan) setCurrentPlanDetails(plan);
        });
    } else {
        setCurrentPlanDetails(null);
    }
  }, [user?.subscriptionPlanId]);


  if (loadingPlans || authLoading) {
     return (
        <div className="space-y-8">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
     )
  }

  return (
    <div className="space-y-8">
      {user && user.role === USER_ROLES.ADVOCATE && currentPlanDetails && (
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Your Current Plan: {currentPlanDetails.name}
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
        {allPlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${currentPlanDetails?.id === plan.id && isSubscriptionActive ? 'border-2 border-green-500' : 'hover:shadow-xl transition-shadow'}`}>
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
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> AI-Powered Summaries</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> {plan.id === 'paid_12m_800inr' ? "Priority Support" : "Basic Support"} (Simulated)</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSelectPlan(plan)} 
                disabled={isLoading === plan.id || authLoading || (currentPlanDetails?.id === plan.id && isSubscriptionActive)}
              >
                {isLoading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentPlanDetails?.id === plan.id && isSubscriptionActive ? 'Currently Active' : 'Choose Plan'}
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

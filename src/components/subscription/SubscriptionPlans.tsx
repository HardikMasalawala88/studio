"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import type { AuthUser, SubscriptionPackage, UserSubscription } from '@/lib/model';
import { useAuth } from '@/context/AuthContext';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import ApiService from '@/api/apiService';

export function SubscriptionPlans() {
  // const { user, updateSubscription: authUpdateSubscription, refreshUser, isSubscriptionActive, loading: authLoading, userSubscription } = useAuth();
  const { user, refreshUser, isSubscriptionActive, loading: authLoading, userSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPackage[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<SubscriptionPackage | null>(null);
  const [selectedGateway, setSelectedGateway] = useState("PhonePe");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

  const daysLeft =
    userSubscription && userSubscription.endDate
      ? Math.ceil((new Date(userSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const canPurchaseNewPlan = !isSubscriptionActive || daysLeft <= 7;
  const hasFuturePlan = userSubscription && new Date(userSubscription.startDate) > new Date();

  const refreshSubscriptionDetails = async () => {
    try {
      const subRes = await ApiService.getLatestUserSubscription(user?.uid);
      const userSub: UserSubscription = subRes.data;
      setSubscriptionEndDate(new Date(userSub.endDate));

      if (userSub?.subscriptionPackageId) {
        const planRes = await ApiService.getSubscriptionPackageById(userSub.subscriptionPackageId);
        const plan = planRes.data;
        if (plan) {
          setCurrentPlanDetails(plan);
        }
      }
    } catch (err) {
      console.error("Error refreshing subscription details:", err);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoadingPlans(true);

      try {
        // 1. Fetch subscription plans
        const plansRes = await ApiService.listSubscriptionPackages();
        const plans: SubscriptionPackage[] = plansRes.data;
        setAllPlans(plans);

        // 2. Fetch current plan if user has one
        if (user?.subscriptionPackageId) {
          await refreshSubscriptionDetails();
          // try {
          //   const subRes = await ApiService.getLatestUserSubscription(user?.uid);
          //   const userSub: UserSubscription = subRes.data;
          //   setSubscriptionEndDate(new Date(userSub.endDate));

          //   if (userSub?.subscriptionPackageId) {
          //     const planRes = await ApiService.getSubscriptionPackageById(userSub.subscriptionPackageId);
          //     const plan = planRes.data;
          //     if (plan) {
          //       setCurrentPlanDetails(plan);
          //     }
          //   }
          // } catch (err) {
          //   console.error("Error refreshing subscription details:", err);
          // }
        }

        // 3. Fetch selected payment gateway
        try {
          const gatewayRes = await ApiService.getSelectedGateway();
          setSelectedGateway(gatewayRes.data.gateway);
        } catch (e) {
          console.error("Failed to load selected payment gateway.");
        }

      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchData();
  }, [user?.subscriptionPackageId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };


  const handleSelectPlan = async (planToSelect: SubscriptionPackage) => {
    if (!user || user.role !== USER_ROLES.ADVOCATE) return;

    setIsLoading(planToSelect.id ?? null);

    // Calculate start and end dates
    let startDate = new Date(); // Default: now
    if (userSubscription && new Date(userSubscription.endDate) > new Date()) {
      // If user has an ongoing or scheduled plan, start after it ends
      const latestEnd = new Date(userSubscription.endDate);
      latestEnd.setDate(latestEnd.getDate() + 1); // Day after current plan ends
      startDate = latestEnd;
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + planToSelect.durationMonth);

    try {
      if (selectedGateway === "PhonePe") {
        const res = await ApiService.createPhonepePayment({
          userId: user.uid,
          subscriptionPackageId: planToSelect.id!,
          amount: planToSelect.packagePrice,
        });
        if (res?.data?.url) {
          window.location.href = res.data.url;
        }
      } else if (selectedGateway === "Razorpay") {
        await loadRazorpayScript();

        const res = await ApiService.createRazorpayPayment({
          userId: user.uid,
          subscriptionPackageId: planToSelect.id!,
          amount: planToSelect.packagePrice,
          startDate,
          endDate,
        });

        const { orderId, amount, key } = res.data;

        const options = {
          key,
          amount,
          currency: "INR",
          name: "Acme Corp",
          description: planToSelect.name,
          order_id: orderId,
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
          handler: async function (response: any) {
            try {
              await ApiService.razorpayCallBack({
                providerTransactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                subscriptionPackageId: planToSelect.id!,
                amount: planToSelect.packagePrice,
                userId: user.uid,
                status: "SUCCESS",
                paymentDate: new Date(),
              });
              refreshUser();
              await refreshSubscriptionDetails();
            } catch (error) {
              console.error("Callback error", error);
            }
          },
          // modal: {
          //   ondismiss: async function () {
          //     // FAIL/CANCEL CASE
          //     await ApiService.razorpayCallBack({
          //       orderId: orderId,
          //       subscriptionPackageId: planToSelect.id!,
          //       amount: planToSelect.packagePrice,
          //       userId: user.uid,
          //       status: "FAILED",
          //       paymentDate: new Date(),
          //     });
          //   }
          // },
          theme: {
            color: "#0d9488",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        throw new Error("Unsupported payment gateway");
      }
    } catch (err) {
      console.error("Payment error", err);
    } finally {
      setIsLoading(null);
    }
  };

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
    );
  }

  return (
    <div className="space-y-8">
      {user && user.role === USER_ROLES.ADVOCATE && currentPlanDetails && subscriptionEndDate && (
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              {hasFuturePlan
                ? `Upcoming Plan: ${currentPlanDetails?.name}`
                : `Your Current Plan: ${currentPlanDetails?.name}`}
              {currentPlanDetails?.isTrial && (
                <span className="ml-2 text-xs bg-yellow-300 text-black px-2 py-0.5 rounded">Trial</span>
              )}
            </CardTitle>

            <CardDescription>
              {hasFuturePlan && userSubscription?.startDate
                ? `Scheduled to start on: ${format(new Date(userSubscription.startDate), "PPP")} (${formatDistanceToNowStrict(new Date(userSubscription.startDate))} from now)`
                : isSubscriptionActive && userSubscription?.endDate
                  ? `Expires on: ${format(new Date(userSubscription.endDate), "PPP")} (${formatDistanceToNowStrict(new Date(userSubscription.endDate))} remaining)`
                  : userSubscription?.endDate
                    ? `Expired on: ${format(new Date(userSubscription.endDate), "PPP")}`
                    : null}
            </CardDescription>

          </CardHeader>
          {!userSubscription ? (
            <CardContent>
              <p className="text-destructive font-semibold">
                Your subscription has expired. Please choose a plan to continue full access.
              </p>
            </CardContent>
          ) : hasFuturePlan ? (
            <CardContent>
              <p className="text-primary font-semibold">
                You have an upcoming plan: <strong>{currentPlanDetails?.name}</strong> starting from{" "}
                {format(new Date(userSubscription.startDate), "PPP")} (
                {formatDistanceToNowStrict(new Date(userSubscription.startDate))} from now)
              </p>
            </CardContent>
          ) : isSubscriptionActive && daysLeft <= 7 ? (
            <CardContent>
              <p className="text-destructive font-semibold">
                Your current subscription will expire soon (
                {formatDistanceToNowStrict(new Date(userSubscription.endDate))} left). Please consider selecting a new plan.
              </p>
            </CardContent>
          ) : !isSubscriptionActive ? (
            <CardContent>
              <p className="text-destructive font-semibold">
                Your subscription has expired. Please choose a plan to continue full access.
              </p>
            </CardContent>
          ) : null}

        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans.filter((plan) => !plan.isTrial).map((plan) => {
          const isActivePlan = currentPlanDetails?.id === plan.id && isSubscriptionActive;
          return (
            <Card key={plan.id} className={`flex flex-col ${isActivePlan ? 'border-2 border-green-500' : 'hover:shadow-xl transition-shadow'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-headline">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-3xl font-bold">
                  ₹{plan.packagePrice} <span className="text-sm font-normal text-muted-foreground">/ {plan.durationMonth} months</span>
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
                  disabled={isLoading === plan.id || authLoading || !canPurchaseNewPlan || !!hasFuturePlan}
                >
                  {isLoading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isActivePlan ? 'Currently Active' : 'Choose Plan'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Payments are processed securely (simulation). By subscribing, you agree to our Terms of Service.
      </p>
    </div>
  );
}

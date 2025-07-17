
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Briefcase, Users, FileText, Zap, Brain, Sparkles, ShieldCheck, Award, Gift } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME, SUBSCRIPTION_PLAN_IDS } from '@/lib/constants';
import type { SubscriptionPlan } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getSubscriptionPlans } from '@/lib/userService'; // Fetch plans from service
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function LandingPage() {
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      setLoadingPlans(true);
      const plans = await getSubscriptionPlans();
      setAllPlans(plans);
      setLoadingPlans(false);
    }
    fetchPlans();
  }, []);

  const trialPlan = allPlans.find(p => p.isTrial === true);
  const paidPlans = allPlans.filter(p => p.isTrial !== true);
  const featuredPlanId = SUBSCRIPTION_PLAN_IDS.HALF_YEARLY; // For "Best Value" highlight

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">{APP_NAME}</span>
          </Link>
          <nav className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    The <span className='text-red-600 font-semibold text-4xl sm:text-5xl xl:text-6xl/none'>AI-POWERED</span> <s className='text-muted-foreground opacity-70'>Traditional</s> Way to Manage Your Cases
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-lg xl:text-xl">
                    {APP_NAME} is intelligently designed to streamline case management, enhance client collaboration, and elevate your legal strategy with cutting-edge AI.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild className="shadow hover:shadow-md transition-shadow">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Access Your Account</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="CaseConnect platform dashboard"
                className="mx-auto overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-xl"
                data-ai-hint="legal dashboard software"
                priority
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-3">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary font-semibold shadow-sm font-headline">Core Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Empowering Legal Professionals, Intelligently</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {APP_NAME} provides a comprehensive suite of tools built for efficiency, security, and cutting-edge AI assistance.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <FeatureCard
                icon={<Briefcase className="h-8 w-8" />}
                title="Comprehensive Case Management"
                description="Track every detail, from initial client contact to case closure. Manage documents, notes, and hearing schedules all in one place."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Role-Based Access & Dashboards"
                description="Tailored dashboards and permissions for Advocates, Clients, and Admin, ensuring secure and relevant information access."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="AI-Powered Summaries"
                description="Instantly distill lengthy case notes into concise, actionable summaries with our advanced AI. Save critical time and quickly grasp key information for hearings and strategy."
              />
              <FeatureCard
                icon={<Brain className="h-8 w-8" />}
                title="Intelligent Case Assistance"
                description="Go beyond summaries. Our AI offers intelligent task suggestions, helps identify crucial data points, and provides deeper analytical insights to strengthen your case preparation."
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8" />}
                title="Hearing Report Generator"
                description="Quickly generate printable PDF reports for daily hearings, keeping you organized and prepared."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8" />}
                title="Secure Document Handling"
                description="Upload, organize, and securely share case-related documents with version control and access logs."
              />
            </div>
          </div>
        </section>

        <section id="ai-advantage" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-accent/10 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-3">
                 <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary font-semibold shadow-sm font-headline">The {APP_NAME} AI Advantage</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Work Smarter, Not Harder with AI</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Leverage cutting-edge Artificial Intelligence seamlessly integrated into your workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-2 lg:grid-cols-3 lg:gap-12">
              <BenefitPoint
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="AI-Accelerated Workflow"
                description="Let AI handle repetitive tasks like document summarization and data organization, freeing up your time for critical legal thinking and client interaction."
              />
              <BenefitPoint
                icon={<Brain className="h-10 w-10 text-primary" />}
                title="Smarter Case Strategy"
                description="Uncover deeper insights from your case data. Our AI helps identify patterns, potential risks, and key information to build more robust legal strategies."
              />
              <BenefitPoint
                icon={<Sparkles className="h-10 w-10 text-primary" />}
                title="Future-Ready Practice"
                description={`Embrace the future of legal tech. ${APP_NAME} equips you with sophisticated AI tools, ensuring your practice remains competitive and efficient.`}
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-3">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary font-semibold shadow-sm font-headline">Pricing Plans</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Flexible Plans for Every Advocate</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose a plan that fits your practice. All paid plans include full access to AI features and dedicated support. Kickstart with our 1-month free trial!
                </p>
              </div>
            </div>

            {loadingPlans ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <>
                {trialPlan && (
                  <div className="flex justify-center mb-10 md:mb-12">
                    <div className="w-full max-w-md">
                      <PricingCard
                        key={trialPlan.id}
                        plan={trialPlan}
                      />
                    </div>
                  </div>
                )}

                {paidPlans.length > 0 && (
                  <div className="mx-auto grid max-w-6xl items-stretch gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {paidPlans.map((plan) => (
                      <PricingCard
                        key={plan.id}
                        plan={plan}
                        isFeatured={plan.id === featuredPlanId}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
             <p className="text-center text-sm text-muted-foreground mt-12">
              All transactions are in INR. Services are intended for advocates practicing in India.
            </p>
          </div>
        </section>

      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved. Powered by MountainsDriven Technologies Pvt.Ltd.
          <span className="mx-1">|</span>
          Built with Firebase & Genkit AI.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
      <CardHeader className="items-start">
         <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary p-0">
           {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
        </div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

interface BenefitPointProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitPoint({ icon, title, description }: BenefitPointProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-0">
         {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-primary" })}
      </div>
      <h3 className="mb-2 text-xl font-bold font-headline">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

interface PricingCardProps {
  plan: SubscriptionPlan;
  isFeatured?: boolean;
}

function PricingCard({ plan, isFeatured = false }: PricingCardProps) {
  const isTrialPlan = plan.isTrial === true;

  const trialFeatures = [
    "Full Case Management Suite (1 Month)",
    "AI-Powered Case Summaries (1 Month)",
    "Intelligent Case Assistance (1 Month)",
    "Client Collaboration Portal (1 Month)",
    "Secure Document Storage (1 Month)",
    "No Credit Card Required for Trial",
  ];

  const paidFeaturesBase = [
    "Full Case Management Suite",
    "AI-Powered Case Summaries",
    "Intelligent Case Assistance",
    "Client Collaboration Portal",
    "Daily Hearing Reports & Alerts",
    "Secure Document Storage",
    "Role-Based Access Control",
    "Basic Support",
  ];
  
  let features = paidFeaturesBase;
  if (isTrialPlan) {
    features = trialFeatures;
  } else if (plan.id === 'paid_12m_800inr') { // Assuming this ID corresponds to the yearly plan
    features = [...paidFeaturesBase, "Priority Support"];
  }


  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300 h-full",
      isFeatured && !isTrialPlan ? 'border-2 border-primary shadow-xl relative ring-2 ring-primary ring-offset-2' : 'hover:shadow-xl',
      isTrialPlan ? 'border-2 border-pink-500 shadow-lg relative ring-2 ring-pink-500 ring-offset-2' : ''
    )}>
      {isFeatured && !isTrialPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg flex items-center gap-1">
          <Award className="h-4 w-4" /> Best Value
        </div>
      )}
      {isTrialPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg flex items-center gap-1">
          <Gift className="h-4 w-4" /> Start Free!
        </div>
      )}
      <CardHeader className={cn("pb-4", (isFeatured || isTrialPlan) ? 'pt-10' : 'pt-6')}>
        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
        {isTrialPlan ? (
          <CardDescription>Everything you need to get started, free for {plan.durationMonths} month.</CardDescription>
        ) : (
          <>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">₹{plan.priceINR}</span>
              <span className="ml-1 text-muted-foreground">/ {plan.durationMonths} months</span>
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={(isFeatured && !isTrialPlan) || isTrialPlan ? 'default' : 'outline'}>
          <Link href="/signup">{isTrialPlan ? 'Start Free Trial' : 'Get Started'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


import { AppLayout } from '@/components/layout/AppLayout';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE]}>
      <PageHeader 
        title="Manage Your Subscription" 
        description="Choose a plan that suits your needs to continue accessing all features." 
      />
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Important Notice</AlertTitle>
        <AlertDescription>
          Currently, payment gateway integration (PhonePe) is **not live** in this prototype. 
          Selecting a plan will simulate a successful subscription update for demonstration purposes only.
          This service is intended for advocates practicing in India.
        </AlertDescription>
      </Alert>
      <SubscriptionPlans />
    </AppLayout>
  );
}


import { AppLayout } from '@/components/layout/AppLayout';
import { SubscriptionPlanList } from '@/components/admin/SubscriptionPlanList';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function AdminSubscriptionSettingsPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADMIN]}>
      <PageHeader title="Subscription Plan Settings" description="Manage subscription plan names, descriptions, prices, and durations." />
      <SubscriptionPlanList />
    </AppLayout>
  );
}

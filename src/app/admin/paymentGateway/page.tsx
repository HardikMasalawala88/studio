
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';
import PaymentGatewaySettings from '@/components/admin/PaymentGatewaySettings';

export default function AdminPaymentGatewaySettingsPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADMIN]}>
      <PageHeader title="Paymeny Gateway Settings" description="Select payment gateway method for advocates." />
      <PaymentGatewaySettings />
    </AppLayout>
  );
}


import { AppLayout } from '@/components/layout/AppLayout';
import { ClientList } from '@/components/clients/ClientList';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function ClientsPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE]}>
      <PageHeader title="Client Management" description="View, add, and manage your clients." />
      <ClientList />
    </AppLayout>
  );
}

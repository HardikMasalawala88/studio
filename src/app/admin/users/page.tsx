import { AppLayout } from '@/components/layout/AppLayout';
import { UserList } from '@/components/admin/UserList';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function AdminUsersPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADMIN]}>
      <PageHeader title="User Management" description="Administer all users in the system." />
      <UserList />
    </AppLayout>
  );
}

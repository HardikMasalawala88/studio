import { AppLayout } from '@/components/layout/AppLayout';
import { CaseList } from '@/components/cases/CaseList';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function CasesPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN]}>
      <PageHeader title="Case Management" description="View, search, and manage all your cases." />
      <CaseList />
    </AppLayout>
  );
}

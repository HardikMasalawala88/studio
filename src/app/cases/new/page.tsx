import { AppLayout } from '@/components/layout/AppLayout';
import { CaseForm } from '@/components/cases/CaseForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function NewCasePage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
      <PageHeader title="Create New Case" description="Fill in the details to register a new case." />
      <CaseForm />
    </AppLayout>
  );
}

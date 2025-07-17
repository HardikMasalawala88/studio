import { AppLayout } from '@/components/layout/AppLayout';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { USER_ROLES } from '@/lib/constants';

export default function CaseDetailPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN]}>
      <CaseDetail />
    </AppLayout>
  );
}

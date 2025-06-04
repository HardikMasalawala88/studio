import { AppLayout } from '@/components/layout/AppLayout';
import { HearingReport } from '@/components/cases/HearingReport';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';

export default function DailyReportPage() {
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE]}>
      <PageHeader title="Daily Hearing Report" description="View and print your scheduled hearings for today." />
      <HearingReport />
    </AppLayout>
  );
}

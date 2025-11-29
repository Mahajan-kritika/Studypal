
import AppLayout from '@/components/layout/app-layout';
import { StudyPlanGenerator } from '@/components/study-plan/study-plan-generator';

export default function StudyPlanPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Personalized Study Plan
            </h2>
            <p className="text-muted-foreground">
              Let our AI craft the perfect study schedule to help you achieve your goals.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
            <StudyPlanGenerator />
        </div>
      </div>
    </AppLayout>
  );
}

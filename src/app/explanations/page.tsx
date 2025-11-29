import AppLayout from '@/components/layout/app-layout';
import { ExplanationGenerator } from '@/components/explanations/explanation-generator';

export default function ExplanationsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Intelligent Explanations
            </h2>
            <p className="text-muted-foreground">
              Break down any complex topic into simple, easy-to-understand concepts.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
          <ExplanationGenerator />
        </div>
      </div>
    </AppLayout>
  );
}

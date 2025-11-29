
'use client';

import AppLayout from '@/components/layout/app-layout';
import { TestGenerator } from '@/components/practice/test-generator';

export default function PracticePage() {
  const pageTitle = 'Practice Test Generator';
  const pageDescription = 'Create custom quizzes and exams to test your knowledge.';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              {pageTitle}
            </h2>
            <p className="text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
          <TestGenerator />
        </div>
      </div>
    </AppLayout>
  );
}

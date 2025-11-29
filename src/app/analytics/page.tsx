
'use client';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  StudyTimeChart,
  TopicMasteryChart,
  PerformanceByTopic,
} from '@/components/analytics/charts';
import { ManageTrackedTopics } from '@/components/analytics/manage-topics';
import { TrackedTopicsProvider } from '@/hooks/use-tracked-topics';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <TrackedTopicsProvider>
        <div className="space-y-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Analytics Dashboard
              </h2>
              <p className="text-muted-foreground">
                A deep dive into your learning journey and performance.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Study Time Analysis</CardTitle>
                <CardDescription>
                  Your total study hours over the past month.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <StudyTimeChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2">
                <TopicMasteryChart />
            </div>
            <ManageTrackedTopics />
          </div>
          <Card>
            <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
                <CardDescription>
                    A detailed breakdown of your performance in each topic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PerformanceByTopic />
            </CardContent>
          </Card>
        </div>
      </TrackedTopicsProvider>
    </AppLayout>
  );
}

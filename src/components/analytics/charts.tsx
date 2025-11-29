
'use client';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { BarChart3 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useHistory } from '@/hooks/use-history';
import { Separator } from '../ui/separator';
import { subDays, format, parseISO } from 'date-fns';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';

const studyTimeConfig = {
  hours: {
    label: 'Study Hours',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const topicMasteryConfig = {
  mastery: {
    label: 'Mastery',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function StudyTimeChart() {
  const { history } = useHistory();

  const studyTimeData = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
          date: format(date, 'MMM d'),
          fullDate: format(date, 'yyyy-MM-dd'),
          hours: 0,
      };
    });

    history.forEach(item => {
        const itemDate = parseISO(item.timestamp);
        const formattedDate = format(itemDate, 'yyyy-MM-dd');
        const dayEntry = days.find(d => d.fullDate === formattedDate);

        if (dayEntry) {
            let timeInSeconds = 0;
            if (item.type === 'Practice Test') {
                timeInSeconds = item.duration || 0;
            } else if (item.type === 'Explanation') {
                timeInSeconds = 600; // 10 minutes
            } else if (item.type === 'Study Plan') {
                timeInSeconds = 300; // 5 minutes
            }
            dayEntry.hours += Number((timeInSeconds / 3600).toFixed(1));
        }
    });

    return days;
  }, [history]);

  return (
    <ChartContainer config={studyTimeConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={studyTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
          <Tooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function TopicMasteryChart() {
  const { history } = useHistory();
  const { trackedTopics } = useTrackedTopics();

  const { topicMasteryData, overallPerformance } = useMemo(() => {
    const testHistory = history.filter(item => item.type === 'Practice Test' && item.score !== undefined);
    const trackedTopicNames = trackedTopics.map(t => t.topic);

    const topicScores: { [topic: string]: { scores: number[], count: number } } = {};

    testHistory.forEach(item => {
      const name = item.topic || 'General';
      
      // Check if the topic or subject is being tracked
      if (trackedTopicNames.includes(name)) {
        const percentage = (item.score! / item.content.length) * 100;
        if (!topicScores[name]) {
          topicScores[name] = { scores: [], count: 0 };
        }
        topicScores[name].scores.push(percentage);
        topicScores[name].count++;
      }
    });
    
    // Create mastery data for all tracked topics
    const calculatedMasteryData = trackedTopics.map(({ topic }) => {
      const data = topicScores[topic];
      if (data) {
        const averageScore = data.scores.reduce((acc, score) => acc + score, 0) / data.count;
        return {
          topic: topic,
          mastery: Math.round(averageScore),
        };
      }
      return {
        topic: topic,
        mastery: 0, // Default to 0 if no tests are taken for a tracked topic
      };
    });

    const relevantTestHistory = history.filter(item => {
        if (item.type !== 'Practice Test' || item.score === undefined) return false;
        const name = item.topic || 'General';
        return trackedTopicNames.includes(name);
    });

    const totalTests = relevantTestHistory.length;
    const totalPercentage = relevantTestHistory.reduce((acc, item) => {
        const percentage = (item.score! / item.content.length) * 100;
        return acc + percentage;
    }, 0);

    const overallAverage = totalTests > 0 ? Math.round(totalPercentage / totalTests) : 0;

    return { topicMasteryData: calculatedMasteryData, overallPerformance: overallAverage };
  }, [history, trackedTopics]);


  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Topic Mastery</CardTitle>
          <CardDescription>
            Your mastery level for topics based on your practice tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
        {topicMasteryData.length > 0 ? (
          <ChartContainer config={topicMasteryConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <RadarChart data={topicMasteryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Radar name="Mastery" dataKey="mastery" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No test data found.</p>
                <p className="text-sm text-muted-foreground">Take a practice test to see your topic mastery.</p>
            </div>
        )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Performance
          </CardTitle>
          <CardDescription>
            Your average score across all practice tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
          <div className="relative h-40 w-40">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200 dark:text-gray-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
              />
              <path
                className="stroke-current text-primary"
                strokeDasharray={`${overallPerformance}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">{overallPerformance}%</span>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">
            Keep up the great work!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const topicPerformanceChartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function PerformanceByTopic() {
    const { history } = useHistory();
    const { trackedTopics } = useTrackedTopics();

    const topicPerformanceData = useMemo(() => {
        const testHistory = history.filter(item => item.type === 'Practice Test' && item.score !== undefined);
        const topicData: { [topic: string]: { scores: { score: number, attempt: number }[], count: number, subject: string } } = {};
        const trackedTopicNames = trackedTopics.map(t => t.topic);

        testHistory.reverse().forEach((item) => {
            const name = item.topic || 'General';
            const trackedTopic = trackedTopics.find(t => t.topic === name);

            if (trackedTopic) {
                const percentage = (item.score! / item.content.length) * 100;
                if (!topicData[name]) {
                    topicData[name] = { scores: [], count: 0, subject: trackedTopic.subject };
                }
                topicData[name].scores.push({ score: Math.round(percentage), attempt: topicData[name].count + 1 });
                topicData[name].count++;
            }
        });

        return trackedTopics.map(({ topic, subject }) => {
            const data = topicData[topic];
            if (data) {
                const averageScore = data.scores.reduce((acc, s) => acc + s.score, 0) / data.count;
                return {
                    topic,
                    subject,
                    averageScore: Math.round(averageScore),
                    testCount: data.count,
                    scores: data.scores,
                };
            }
            return {
                topic,
                subject,
                averageScore: 0,
                testCount: 0,
                scores: [],
            };
        });
    }, [history, trackedTopics]);

    if (topicPerformanceData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No test data available.</p>
                <p className="text-sm text-muted-foreground">Complete a practice test to see your performance breakdown.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {topicPerformanceData.map((topicData, index) => (
                <div key={`${topicData.topic}-${index}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold">{topicData.topic}</h3>
                            <p className="text-sm text-muted-foreground">{topicData.subject}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Score</p>
                                    <p className="text-2xl font-bold">{topicData.averageScore}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tests Taken</p>
                                    <p className="text-2xl font-bold">{topicData.testCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                        {topicData.scores.length > 0 ? (
                            <ChartContainer config={topicPerformanceChartConfig} className="h-[100px] w-full">
                                <ResponsiveContainer>
                                    <LineChart data={topicData.scores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="attempt" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Test ${val}`} />
                                        <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                No tests taken for this topic.
                            </div>
                        )}
                        </div>
                    </div>
                    {index < topicPerformanceData.length - 1 && <Separator />}
                </div>
            ))}
        </div>
    );
}

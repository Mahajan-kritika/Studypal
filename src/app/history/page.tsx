
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useHistory } from '@/hooks/use-history';
import { History, Wand2, Lightbulb, FileText, Clock, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  'Study Plan': <Wand2 className="h-5 w-5 text-accent" />,
  'Explanation': <Lightbulb className="h-5 w-5 text-accent" />,
  'Practice Test': <FileText className="h-5 w-5 text-accent" />,
  'Doubt Solver': <BrainCircuit className="h-5 w-5 text-accent" />,
};

const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

export default function HistoryPage() {
  const { history } = useHistory();

  const renderContent = (item: any) => {
    switch (item.type) {
      case 'Study Plan':
        // For Study Plan, content is an object with keyHighlights, weeklySchedule, finalSummary
        if (!item.content || !item.content.keyHighlights || !item.content.weeklySchedule) {
            return <p>This study plan content is unavailable.</p>;
        }
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h4>Key Highlights</h4>
            <ul>
              {item.content.keyHighlights.map((highlight: string, index: number) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
            <h4>Weekly Schedule</h4>
            {/* A simple representation for history view */}
            <ul>
              {item.content.weeklySchedule.map((day: any, index: number) => (
                <li key={index}>
                  <strong>{day.day}:</strong> {day.focusTopics.join(', ')} ({day.estimatedTime})
                </li>
              ))}
            </ul>
            {item.content.finalSummary && <p><em>{item.content.finalSummary}</em></p>}
          </div>
        );
      case 'Explanation':
        // For Explanation, content is an object with summary, detailedExplanation, analogy
        if (!item.content) {
            return <p>This explanation content is unavailable.</p>;
        }
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
            {item.content.summary && (
                <div>
                    <h4 className="font-semibold">Summary</h4>
                    <p>{item.content.summary}</p>
                </div>
            )}
            {item.content.detailedExplanation && (
                <div>
                    <h4 className="font-semibold">Detailed Explanation</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.content.detailedExplanation.replace(/\n/g, '<br />') }} />
                </div>
            )}
            {item.content.analogy && (
                <div>
                    <h4 className="font-semibold">Analogy</h4>
                    <p>{item.content.analogy}</p>
                </div>
            )}
          </div>
        );
      case 'Practice Test':
        if (!item.content) {
            return <p>This practice test content is unavailable.</p>;
        }
        return (
          <div>
            {item.score !== undefined && (
                <Badge>Score: {item.score} / {item.content.length}</Badge>
            )}
             {item.duration !== undefined && (
                <Badge variant="outline" className="ml-2 flex items-center gap-1 w-fit">
                    <Clock className="h-3 w-3"/>
                    {formatDuration(item.duration)}
                </Badge>
            )}
          <ul className="space-y-4 mt-4">
            {item.content.map((qa: any, index: number) => (
              <li key={index}>
                <p className="font-semibold">{index + 1}. {qa.question}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 pl-2">Answer: {qa.answer}</p>
              </li>
            ))}
          </ul>
          </div>
        );
      default:
        // Fallback for other types or if content is a simple string
        if (typeof item.content === 'string') {
          return <p>{item.content}</p>;
        }
        return <p>This item cannot be displayed.</p>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Action History
            </h2>
            <p className="text-muted-foreground">
              A log of all your recent AI-powered activities.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              Recent Actions
            </CardTitle>
            <CardDescription>
              Here are the study plans, explanations, and tests you've generated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {history.map((item) => (
                  <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        {iconMap[item.type as keyof typeof iconMap] || <FileText className="h-5 w-5 text-accent" />}
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), "PPP p")}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="bg-muted/50">
                          <CardHeader>
                              <CardTitle className="text-lg">{item.type}</CardTitle>
                              <CardDescription>{item.title}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {renderContent(item)}
                          </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Your history is currently empty.
                </p>
                <p className="text-sm text-muted-foreground">
                  Generated content will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    

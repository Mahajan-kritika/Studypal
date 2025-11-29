
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, ArrowRight, History, User, X } from 'lucide-react';
import Link from 'next/link';
import { WeeklyProgressChart } from '@/components/dashboard/overview-cards';
import { useUser } from '@/hooks/use-user-role';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useHistory } from '@/hooks/use-history';
import { format, parseISO } from 'date-fns';

const motivationalQuotes = [
  "The secret to getting ahead is getting started.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "The only way to learn mathematics is to do mathematics.",
  "Strive for progress, not perfection.",
  "Your only limit is your mind."
];

const renderContent = (item: any) => {
    switch (item.type) {
        case 'Study Plan':
            if (!item.content || !item.content.keyHighlights) {
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
                {item.content.finalSummary && <p><em>{item.content.finalSummary}</em></p>}
                </div>
            );
        case 'Explanation':
            if (!item.content) {
                return <p>This explanation content is unavailable.</p>;
            }
            return (
                <div className="prose prose-sm max-w-none dark:prose-invert space-y-2">
                    {item.content.summary && <p className="font-semibold italic">{item.content.summary}</p>}
                    {item.content.detailedExplanation && <p>{item.content.detailedExplanation.substring(0, 200)}...</p>}
                    {item.content.analogy && <p className="text-xs">Analogy: {item.content.analogy}</p>}
                </div>
            );
        case 'Practice Test':
            if (!item.content) {
                return <p>This practice test content is unavailable.</p>;
            }
            return (
                <ul className="space-y-4">
                    {item.content.slice(0, 3).map((qa: any, index: number) => ( // Preview first 3 questions
                        <li key={index}>
                            <p className="font-semibold">{index + 1}. {qa.question}</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 pl-2">Answer: {qa.answer}</p>
                        </li>
                    ))}
                    {item.content.length > 3 && <p className="text-xs text-muted-foreground">...and {item.content.length - 3} more questions.</p>}
                </ul>
            );
        default:
            if (typeof item.content === 'string') {
                return <p>{item.content}</p>;
            }
            return <p>This item cannot be displayed in preview.</p>;
    }
  };


export default function DashboardPage() {
  const { userName } = useUser();
  const { history } = useHistory();
  const [quote, setQuote] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');
  const dailyHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select a random quote on the client-side to avoid hydration mismatch
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  useEffect(() => {
    if (selectedDate && dailyHistoryRef.current) {
        dailyHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);
  
  const dailyHistory = useMemo(() => {
    if (!selectedDate) return [];
    return history.filter(item => format(parseISO(item.timestamp), 'yyyy-MM-dd') === selectedDate);
  }, [selectedDate, history]);

  const handleBarClick = (date: string) => {
    // By setting it to null first, we ensure the useEffect hook always fires
    setSelectedDate(null); 
    setTimeout(() => {
      setSelectedDate(date);
    }, 0);
  }

  const handleCloseDailyHistory = () => {
    setSelectedDate(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Welcome back, {userName.split(' ')[0]}!
            </h2>
            {quote && (
              <p className="text-sm text-muted-foreground italic mt-2">
                &quot;{quote}&quot;
              </p>
            )}
          </div>
        </div>
        
        <Card className="relative overflow-hidden">
          {heroImage && (
              <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill={true}
                  style={{objectFit: "cover"}}
                  className="opacity-10 dark:opacity-5"
                  data-ai-hint={heroImage.imageHint}
              />
          )}
          <div className="relative z-10 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 lg:col-span-2 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>
                        Your study activities over the last 7 days. Click a bar to see details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <WeeklyProgressChart onBarClick={handleBarClick} />
                </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2 flex flex-col bg-background/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                    Jump right back into your learning journey.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-4">
                    <Link href="/explanations" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Explain a Complex Topic
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/practice" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate a Practice Test
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/history" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <History className="mr-2 h-4 w-4" />
                        View Action History
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/profile" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Edit Your Profile
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                </CardContent>
                </Card>
            </div>
          </div>
        </Card>

        {selectedDate && (
          <div ref={dailyHistoryRef}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activities for {format(parseISO(selectedDate), 'PPP')}</CardTitle>
                  <CardDescription>A log of your activities on this day.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseDailyHistory}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>
              <CardContent>
                {dailyHistory.length > 0 ? (
                  <div className="space-y-4">
                    {dailyHistory.map((item) => (
                      <Card key={item.id} className="bg-muted/50">
                          <CardHeader>
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <CardDescription>
                                  {item.type} - {format(parseISO(item.timestamp), 'p')}
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              {renderContent(item)}
                          </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No activities recorded on this day.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

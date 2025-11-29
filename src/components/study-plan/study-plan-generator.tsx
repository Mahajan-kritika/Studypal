
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generatePersonalizedStudyPlan,
  type PersonalizedStudyPlanOutput,
} from '@/ai/flows/personalized-study-plan';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ArrowRight, Download, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';

const formSchema = z.object({
  goals: z.string().min(10, {
    message: 'Please describe your goals in at least 10 characters.',
  }),
  deadline: z.string().min(3, {
    message: 'Please provide a deadline.',
  }),
  learningPace: z.enum(['slow', 'moderate', 'fast']),
});

export function StudyPlanGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] =
    useState<PersonalizedStudyPlanOutput | null>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      deadline: '',
      learningPace: 'moderate',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStudyPlan(null);
    setFormValues(values);
    try {
      const result = await generatePersonalizedStudyPlan(values);
      setStudyPlan(result);
      addHistoryItem({
        type: 'Study Plan',
        title: `For: ${values.goals}`,
        content: result, // Storing the whole object
      });
      toast({
        title: 'Study Plan Generated!',
        description: 'Your personalized study plan is ready.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Plan',
        description:
          'There was an issue creating your study plan. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleDownload = () => {
    if (!studyPlan) return;
    
    let textContent = `Study Plan for: ${formValues?.goals}\n\n`;
    
    textContent += "--- KEY HIGHLIGHTS ---\n";
    studyPlan.keyHighlights.forEach(highlight => {
        textContent += `- ${highlight}\n`;
    });
    textContent += "\n";

    textContent += "--- WEEKLY SCHEDULE ---\n";
    studyPlan.weeklySchedule.forEach(day => {
        textContent += `${day.day.toUpperCase()}: ${day.focusTopics.join(', ')} (${day.estimatedTime})\n`;
    });
    textContent += "\n";

    textContent += `--- SUMMARY ---\n${studyPlan.finalSummary}\n`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-accent" />
          Study Plan Details
        </CardTitle>
        <CardDescription>
          Fill in the details below to generate your plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>What are your learning goals?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Pass the calculus final exam' or 'Learn the basics of React'"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your deadline?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'In 3 weeks' or 'By December 15th'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="learningPace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Learning Pace</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a pace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="slow">Slow & Steady</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="fast">Fast-paced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {studyPlan && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            studyPlan ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Your Custom Study Plan</CardTitle>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className='text-lg font-semibold mb-2 text-primary'>Key Highlights</h3>
                    <ul className='space-y-2'>
                        {studyPlan.keyHighlights.map((highlight, index) => (
                            <li key={index} className='flex items-start gap-2'>
                                <CheckCircle className="h-4 w-4 mt-1 text-green-500"/>
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className='text-lg font-semibold mb-2 text-primary'>Weekly Schedule</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[120px]'>Day</TableHead>
                                <TableHead>Focus Topics</TableHead>
                                <TableHead className='w-[150px] text-right'>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studyPlan.weeklySchedule.map((item) => (
                                <TableRow key={item.day}>
                                    <TableCell className='font-medium'>{item.day}</TableCell>
                                    <TableCell>{item.focusTopics.join(', ')}</TableCell>
                                    <TableCell className='text-right'>{item.estimatedTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <p className='text-center text-muted-foreground italic pt-4'>{studyPlan.finalSummary}</p>
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

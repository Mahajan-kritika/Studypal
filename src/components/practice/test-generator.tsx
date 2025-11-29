

'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generatePracticeTest,
  type GeneratePracticeTestOutput,
} from '@/ai/flows/practice-test-generator';
import { evaluateAnswer } from '@/ai/flows/evaluate-answer';


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
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  FileText,
  ArrowRight,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '../ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHistory } from '@/hooks/use-history';
import { useUser } from '@/hooks/use-user-role';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';
import { Checkbox } from '../ui/checkbox';

const studentFormSchema = z
  .object({
    stream: z.string().min(1, { message: 'Please select or enter a stream.' }),
    customStream: z.string().optional(),
    subject: z.string().min(1, { message: 'Please select a subject.' }),
    customSubject: z.string().optional(),
    topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
    numberOfQuestions: z.number().min(1).max(20),
    includeInAnalytics: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.stream === 'other') {
        return data.customStream && data.customStream.length > 0;
      }
      return true;
    },
    {
      message: 'Please specify the stream.',
      path: ['customStream'],
    }
  )
  .refine(
    (data) => {
        if (data.subject === 'other') {
            return data.customSubject && data.customSubject.length > 0;
        }
        return true;
    },
    {
        message: 'Please specify the subject.',
        path: ['customSubject'],
    }
  );

type StudentAnswers = { [key: number]: string };
type AnswerCorrectness = { [key: number]: boolean };

const streamAndSubjectMap: Record<string, Record<string, Record<string, string>>> = {
    '6th Grade': { 'General': { 'Mathematics': 'Fractions', 'Science': 'Ecosystems', 'English': 'Grammar', 'History': 'Ancient Civilizations', 'Geography': 'Map Skills', 'Civics': 'Local Government', 'Art': 'Color Theory' } },
    '7th Grade': { 'General': { 'Mathematics': 'Algebraic Expressions', 'Science': 'Cell Biology', 'English': 'Sentence Structure', 'History': 'The Middle Ages', 'Geography': 'World Climates', 'Civics': 'Democracy', 'Music': 'Music Notation' } },
    '8th Grade': { 'General': { 'Mathematics': 'Linear Equations', 'Physics': 'Newtons Laws', 'Chemistry': 'The Periodic Table', 'Biology': 'Human Anatomy', 'English': 'Essay Writing', 'History': 'The Renaissance', 'Geography': 'Tectonic Plates', 'Computer Science': 'Introduction to HTML' } },
    '9th Grade': { 'General': { 'Mathematics': 'Quadratic Equations', 'Physics': 'Kinematics', 'Chemistry': 'Chemical Reactions', 'Biology': 'Genetics', 'English': 'Literary Devices', 'History': 'Industrial Revolution', 'Economics': 'Supply and Demand', 'Physical Education': 'Rules of Soccer' } },
    '10th Grade': { 'General': { 'Mathematics': 'Trigonometry', 'Physics': 'Optics', 'Chemistry': 'Stoichiometry', 'Biology': 'Evolution', 'English': 'Shakespeare', 'History': 'World War I', 'Computer Science': 'Basic Programming', 'Social Studies': 'Federalism' } },
    '11th Grade': {
        'Science': { 'Physics': 'Electromagnetism', 'Chemistry': 'Organic Chemistry', 'Mathematics': 'Calculus', 'Biology': 'Biotechnology', 'Computer Science': 'Data Structures', 'English': 'Modern Literature', 'Engineering Drawing': 'Projections' },
        'Commerce': { 'Accountancy': 'Journal Entries', 'Business Studies': 'Principles of Management', 'Economics': 'Macroeconomics', 'Mathematics': 'Statistics', 'English': 'Business Communication', 'Taxation': 'Direct and Indirect Taxes', 'Informatics Practices': 'Database Concepts' },
        'Arts': { 'History': 'Modern History', 'Political Science': 'Constitutional Framework', 'Sociology': 'Social Structures', 'Psychology': 'Introduction to Psychology', 'English': 'Poetry Analysis', 'Home Science': 'Nutrition', 'Fine Arts': 'History of Art' }
    },
    '12th Grade': {
        'Science': { 'Physics': 'Modern Physics', 'Chemistry': 'Polymers', 'Mathematics': 'Differential Equations', 'Biology': 'Ecology', 'Computer Science': 'Algorithms', 'English': 'Critical Analysis', 'Biotechnology': 'Genetic Engineering' },
        'Commerce': { 'Accountancy': 'Financial Statements', 'Business Studies': 'Marketing', 'Economics': 'International Trade', 'Mathematics': 'Linear Programming', 'English': 'Advanced Writing', 'Entrepreneurship': 'Business Plan', 'Legal Studies': 'Types of Law' },
        'Arts': { 'History': 'Contemporary World Politics', 'Political Science': 'International Relations', 'Sociology': 'Social Change', 'Psychology': 'Clinical Psychology', 'English': 'Literary Criticism', 'Philosophy': 'Indian Philosophy', 'Fashion Studies': 'History of Fashion' }
    },
    'Undergraduate': {
        'Computer Science': { 'Data Structures': 'Linked Lists', 'Algorithms': 'Sorting Algorithms', 'Operating Systems': 'Process Management', 'Database Management': 'SQL Queries', 'Computer Networks': 'OSI Model', 'Theory of Computation': 'Finite Automata', 'Software Engineering': 'Waterfall Model' },
        'Engineering: Computer Engg': { 'Digital Logic': 'Boolean Algebra', 'Computer Architecture': 'CPU Design', 'Microprocessors': '8085 Architecture', 'Compiler Design': 'Parsing Techniques', 'Distributed Systems': 'Concurrency Control', 'Information Security': 'Cryptography', 'Artificial Intelligence': 'Search Algorithms' },
        'Engineering: Civil': { 'Structural Analysis': 'Truss Analysis', 'Fluid Mechanics': 'Bernoulli\'s Principle', 'Geotechnical Engineering': 'Soil Classification', 'Transportation Engineering': 'Traffic Flow', 'Environmental Engineering': 'Water Treatment', 'Construction Management': 'Project Scheduling', 'Hydrology': 'Rainfall-Runoff Modeling' },
        'Engineering: Mechanical': { 'Thermodynamics': 'First Law', 'Machine Design': 'Gear Systems', 'Fluid Mechanics': 'Pipe Flow', 'Heat Transfer': 'Conduction', 'Manufacturing Processes': 'Casting', 'Control Systems': 'Laplace Transforms', 'Robotics': 'Kinematics' },
        'Medicine': { 'Anatomy': 'Musculoskeletal System', 'Physiology': 'Cardiovascular System', 'Biochemistry': 'Metabolic Pathways', 'Pharmacology': 'Drug Actions', 'Pathology': 'Inflammation', 'Microbiology': 'Bacterial Infections', 'Forensic Medicine': 'Post-mortem' },
        'Business': { 'Marketing': 'SWOT Analysis', 'Finance': 'Time Value of Money', 'Human Resources': 'Recruitment Process', 'Operations Management': 'Inventory Control', 'International Business': 'Global Strategy', 'Organizational Behavior': 'Leadership Theories', 'Business Law': 'Contract Law' },
        'Arts': { 'Philosophy': 'Existentialism', 'Literature': 'Postmodernism', 'Psychology': 'Cognitive Biases', 'Sociology': 'Social Stratification', 'Economics': 'Game Theory', 'Political Science': 'Democratic Theory', 'Anthropology': 'Cultural Relativism' },
        'Law': { 'Constitutional Law': 'Fundamental Rights', 'Criminal Law': 'Mens Rea', 'Contract Law': 'Offer and Acceptance', 'Torts': 'Negligence', 'International Law': 'State Sovereignty', 'Property Law': 'Easements', 'Corporate Law': 'Company Formation' }
    }
};

export function TestGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const { userClass, userField } = useUser();
  const { addTrackedTopic } = useTrackedTopics();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [test, setTest] = useState<GeneratePracticeTestOutput | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerCorrectness, setAnswerCorrectness] = useState<AnswerCorrectness>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formValues, setFormValues] = useState<z.infer<typeof studentFormSchema> | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (startTime && !endTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    } else if (endTime) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [startTime, endTime]);


  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      stream: '',
      customStream: '',
      subject: '',
      customSubject: '',
      topic: '',
      numberOfQuestions: 5,
      includeInAnalytics: true,
    },
  });

  const watchStream = form.watch('stream');
  const watchSubject = form.watch('subject');
  
  const [availableStreams, setAvailableStreams] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    let streams: string[] = [];
    if (userClass) {
        let fieldStreams: Record<string, any> = {};

        if (userClass === 'Undergraduate') {
            const undergraduateStreams = streamAndSubjectMap['Undergraduate'] || {};
            if (userField) {
                 const mainField = userField.split(':')[0];
                 fieldStreams = Object.keys(undergraduateStreams)
                    .filter(key => key.startsWith(mainField))
                    .reduce((obj, key) => {
                        obj[key] = undergraduateStreams[key];
                        return obj;
                    }, {} as Record<string, any>);
            }
            // If no specific field matches, use all undergraduate streams
            if (Object.keys(fieldStreams).length === 0) {
                fieldStreams = undergraduateStreams;
            }
        } else {
            fieldStreams = streamAndSubjectMap[userClass] || {};
        }
        streams = Object.keys(fieldStreams);
    }
    setAvailableStreams(streams);

    // Set initial stream if available
    const firstStream = streams[0];
    if (firstStream) {
        form.setValue('stream', firstStream);
    }
}, [userClass, userField, form]);

  useEffect(() => {
    let subjects: string[] = [];
    if (userClass && watchStream && watchStream !== 'other') {
        const classStreams = streamAndSubjectMap[userClass] || {};
        const streamSubjects = classStreams[watchStream] || {};
        subjects = Object.keys(streamSubjects);
    }
    setAvailableSubjects(subjects);

    const firstSubject = subjects[0];
    if(firstSubject) {
        form.setValue('subject', firstSubject);
    } else {
        form.setValue('subject', '');
    }

  }, [watchStream, userClass, form]);

  useEffect(() => {
    if (userClass && watchStream && watchStream !== 'other' && watchSubject) {
      if (watchSubject !== 'other') {
        const classStreams = streamAndSubjectMap[userClass] || {};
        const streamSubjects = classStreams[watchStream] || {};
        const suggestedTopic = streamSubjects[watchSubject];
        if (suggestedTopic) {
          form.setValue('topic', suggestedTopic);
        } else {
          form.setValue('topic', '');
        }
      }
    } else if (watchSubject !== 'other') {
        form.setValue('topic', '');
    }
  }, [watchStream, watchSubject, userClass, form]);


  async function onSubmit(values: z.infer<typeof studentFormSchema>) {
    setIsLoading(true);
    setTest(null);
    setStudentAnswers({});
    setAnswersSubmitted(false);
    setScore(0);
    setAnswerCorrectness({});
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    
    const finalStream = values.stream === 'other' ? values.customStream! : values.stream;
    const finalSubject = values.subject === 'other' ? values.customSubject! : values.subject;
    setFormValues({...values, stream: finalStream, subject: finalSubject});


    try {
      const result = await generatePracticeTest({
        class: userClass === 'Undergraduate' ? `${userClass} (${userField})` : userClass,
        subject: finalSubject,
        topic: values.topic,
        numberOfQuestions: values.numberOfQuestions,
      });
      setTest(result);
      setStartTime(new Date());

      toast({
        title: 'Practice Test Generated!',
        description: 'Your custom test is ready to go. The timer has started.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Test',
        description: 'There was an issue creating your test. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    setStudentAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmitAnswers = async () => {
    if (!test?.answerKey) return;

    setIsSubmitting(true);
    const submissionTime = new Date();
    setEndTime(submissionTime);
    const finalElapsedTime = Math.floor((submissionTime.getTime() - (startTime?.getTime() ?? submissionTime.getTime())) / 1000);
    setElapsedTime(finalElapsedTime);


    let correctAnswers = 0;
    const correctness: AnswerCorrectness = {};

    for (let i = 0; i < test.answerKey.length; i++) {
        const item = test.answerKey[i];
        const studentAnswer = studentAnswers[i] || '';

        try {
            const evaluation = await evaluateAnswer({
                question: item.question,
                studentAnswer: studentAnswer,
                correctAnswer: item.answer,
            });
            correctness[i] = evaluation.isCorrect;
            if (evaluation.isCorrect) {
                correctAnswers++;
            }
        } catch (error) {
            console.error(`Error evaluating answer for question ${i + 1}:`, error);
            // Fallback to simple check on error
            correctness[i] = studentAnswer.trim().toLowerCase() === item.answer.trim().toLowerCase();
            if (correctness[i]) {
                correctAnswers++;
            }
        }
    }

    setAnswerCorrectness(correctness);
    setScore(correctAnswers);
    setAnswersSubmitted(true);
    setIsSubmitting(false);

    if (formValues?.includeInAnalytics) {
        try {
          addTrackedTopic({topic: formValues.topic, subject: formValues.subject});
        } catch (e) {
          console.log("Did not add topic, it might already be tracked:", e);
        }
    }

    addHistoryItem({
      type: 'Practice Test',
      title: `Test on: ${formValues?.topic}`,
      content: test.answerKey,
      score: correctAnswers,
      duration: finalElapsedTime,
      subject: formValues?.subject,
      topic: formValues?.topic,
    });

    toast({
      title: 'Answers Submitted!',
      description: 'You can now view the answer key and your results.',
    });
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  const isCorrect = (index: number) => {
    return answerCorrectness[index] === true;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          Generate a Practice Test
        </CardTitle>
        <CardDescription>
          Select your stream and subject to generate a custom
          test. Your class is automatically set from your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Stream</FormLabel>
                        <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a stream" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableStreams.map((stream) => (
                                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {watchStream === 'other' && (
                    <FormField
                    control={form.control}
                    name="customStream"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Custom Stream</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter a stream" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={availableSubjects.length === 0 && watchStream !== 'other'}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                 {watchSubject === 'other' && (
                    <FormField
                        control={form.control}
                        name="customSubject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custom Subject</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a subject" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Algebra', 'Thermodynamics', or 'The Cold War'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="includeInAnalytics"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Include in Analytics
                            </FormLabel>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground">
                                Allow this test's score to be included in your analytics and topic mastery charts.
                            </p>
                        </div>
                    </FormItem>
                )}
                />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {test && test.answerKey && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            test ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>Your Practice Test</CardTitle>
                        <CardDescription>
                            Enter your answers below and submit to see the answer key.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {test.answerKey.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1 font-medium">{item.question}</p>
                  </div>
                  <div className="pl-10">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={studentAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={answersSubmitted || isSubmitting}
                    />
                  </div>
                </div>
              ))}
              {!answersSubmitted && (
                <Button onClick={handleSubmitAnswers} disabled={isSubmitting}>
                  {isSubmitting ? (
                      <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating...
                      </>
                  ) : (
                      <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Test
                      </>
                  )}
                </Button>
              )}
            </CardContent>
            {answersSubmitted && (
              <CardFooter className="flex-col items-start gap-4">
                 <Card className='w-full'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'>
                            <BarChart3 className="h-5 w-5" />
                            Test Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='flex justify-between items-center'>
                        <div className="flex gap-8">
                            <div>
                                <p className='text-sm text-muted-foreground'>Score</p>
                                <p className='text-2xl font-bold'>{score} / {test.answerKey.length}</p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Percentage</p>
                                <p className='text-2xl font-bold'>{((score / test.answerKey.length) * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Time Taken</p>
                                <p className='text-2xl font-bold'>{formatTime(elapsedTime)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Show Answer Key & Compare</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-6 mt-4">
                        {test.answerKey.map((item, index) => (
                          <li key={index}>
                            <p className="font-semibold">
                              {index + 1}. {item.question}
                            </p>
                            <div className="mt-2 p-3 rounded-md bg-background/50 border border-input relative">
                               <div className='absolute top-2 right-2'>
                                  {isCorrect(index) ? (
                                        <Badge variant="secondary" className='bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'>
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Correct
                                        </Badge>
                                  ) : (
                                        <Badge variant="destructive">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Incorrect
                                        </Badge>
                                  )}
                               </div>

                              <p className="text-sm font-medium">Your Answer:</p>
                              <p className="text-sm text-muted-foreground pr-20">
                                {studentAnswers[index] || 'No answer provided.'}
                              </p>
                            </div>
                            {!isCorrect(index) && (
                                <div className="mt-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    Correct Answer:
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    {item.answer}
                                 </p>
                                </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardFooter>
            )}
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

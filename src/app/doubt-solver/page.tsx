
import AppLayout from '@/components/layout/app-layout';
import { DoubtSolver } from '@/components/doubt-solver/doubt-solver';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Lightbulb, FileUp } from 'lucide-react';

export default function DoubtSolverPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Doubt Solver
          </h2>
          <p className="text-muted-foreground">
            Ask any academic question and get a clear, step-by-step answer from our AI tutor.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className='lg:col-span-2'>
                <DoubtSolver />
            </div>
            <div className='lg:col-span-1 space-y-8'>
                <Card className='bg-muted/30'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Lightbulb className='text-accent' />
                            How it works
                        </CardTitle>
                        <CardDescription>
                            Get the most out of your AI Tutor with these tips.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4 text-sm'>
                        <div className='space-y-2'>
                            <h3 className='font-semibold text-foreground'>Example Prompts</h3>
                            <ul className='list-disc list-inside text-muted-foreground space-y-1'>
                                <li>&quot;Explain the Pythagorean theorem like I'm 10.&quot;</li>
                                <li>&quot;What are the main causes of World War I?&quot;</li>
                                <li>&quot;Help me solve this algebra problem (with file).&quot;</li>
                            </ul>
                        </div>
                         <div className='space-y-2'>
                            <h3 className='font-semibold text-foreground'>Tips for Better Answers</h3>
                            <ul className='list-disc list-inside text-muted-foreground space-y-1'>
                                <li>Be specific in your questions.</li>
                                <li>Provide context if the problem is complex.</li>
                                <li>Check the AI's answer with your notes.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
                 <Card className='bg-muted/30'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                           <FileUp className='text-accent' />
                            File Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 text-sm text-muted-foreground'>
                        <p>
                           Don't want to type out a long problem? Just click the attachment icon, upload any file, and let the AI solve it for you.
                        </p>
                         <p>
                           Works great for math equations, diagrams, documents, and more.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}

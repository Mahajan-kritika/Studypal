'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  askQuestion,
  type AskQuestionOutput,
} from '@/ai/flows/ask-a-question';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, HelpCircle, Send, User, Bot, Navigation } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user-role';


const formSchema = z.object({
  question: z.string().min(1, {
    message: 'Please enter a message.',
  }),
});

const AnswerDisplay = ({ text }: { text: string }) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: string[] = [];

    const renderList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
                    {currentList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            renderList();
            elements.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-4 mb-2 text-primary">{trimmedLine.replace(/\*\*/g, '')}</h3>);
        } else if (trimmedLine.startsWith('* ')) {
            currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine === '') {
            renderList();
            if (elements.length > 0 && lines[index-1]?.trim() !== '') {
                elements.push(<div key={`br-${index}`} className="h-4" />);
            }
        } else {
            renderList();
            elements.push(<p key={`p-${index}`} className="leading-relaxed">{trimmedLine}</p>);
        }
    });

    renderList();
    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
};

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

export function AskQuestion() {
  const { toast } = useToast();
  const router = useRouter();
  const { userName } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: `Hello ${userName.split(' ')[0]}! How can I help you today? Ask a question or tell me where you'd like to go.` }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const userMessage: Message = { sender: 'user', text: values.question };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const response = await askQuestion({ question: values.question });
      const aiMessage: Message = { sender: 'ai', text: response.answer };
      setMessages(prev => [...prev, aiMessage]);

      if (response.navigationTarget) {
        toast({
            title: 'Navigating...',
            description: `Taking you to ${response.navigationTarget}`,
            icon: <Navigation className="h-5 w-5 text-primary" />,
        });
        setTimeout(() => {
            router.push(response.navigationTarget!);
        }, 1500);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Getting Answer',
        description: 'There was an issue getting an answer. Please try again.',
      });
      console.error(error);
      setMessages(prev => prev.slice(0, -1)); // Remove the user message if there was an error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-accent" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Have a question or need to go somewhere? Ask our AI assistant for help.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 h-96 flex flex-col">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'ai' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <AnswerDisplay text={message.text} />
                            </div>
                            {message.sender === 'user' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="mt-4">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel className="sr-only">Your Question</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="e.g., 'Take me to my history'"
                                {...field}
                                disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

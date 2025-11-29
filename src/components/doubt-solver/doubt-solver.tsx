
'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import {
  solveDoubt,
} from '@/ai/flows/doubt-solver';

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
import { Loader2, BrainCircuit, Send, User, Bot, Paperclip, X, File as FileIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user-role';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const formSchema = z.object({
  doubt: z.string(), // Now optional, but we'll enforce at least one field is present in onSubmit
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
    image?: string;
    fileName?: string;
};

export function DoubtSolver() {
  const { toast } = useToast();
  const { userName } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filePreview, setFilePreview] = useState<{ data: string; name: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'profile-card-background');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doubt: '',
    },
  });

  useEffect(() => {
    if (userName && messages.length === 0) {
        setMessages([
            { sender: 'ai', text: `Hello ${userName.split(' ')[0]}! I'm your AI Tutor. Ask a question or upload a file.` }
        ]);
    }
  }, [userName, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          data: reader.result as string,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.doubt && !filePreview) {
        form.setError('doubt', { message: 'Please enter a question or upload a file.'});
        return;
    }
    setIsLoading(true);
    
    const userMessage: Message = { 
        sender: 'user', 
        text: values.doubt || `Please analyze the file: ${filePreview?.name}`,
        image: filePreview?.data.startsWith('data:image') ? filePreview.data : undefined,
        fileName: !filePreview?.data.startsWith('data:image') ? filePreview?.name : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    const fileDataUri = filePreview?.data;
    removeFile();

    try {
      const response = await solveDoubt({ 
          doubt: values.doubt,
          fileDataUri: fileDataUri,
        });
      const aiMessage: Message = { sender: 'ai', text: response.answer };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Getting Answer',
        description: 'There was an issue getting an answer. Please try again.',
      });
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.sender === 'user' && (lastMessage.text === values.doubt || lastMessage.text.includes("Please analyze the file"))) {
            newMessages.pop();
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full h-[75vh] flex flex-col relative overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill={true}
                style={{objectFit: "cover"}}
                className="opacity-20"
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/80 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-accent" />
                AI Tutor Chat
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                {message.sender === 'ai' && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg p-3 max-w-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm border'}`}>
                                    {message.image && (
                                        <Image
                                            src={message.image}
                                            alt="User upload"
                                            width={200}
                                            height={200}
                                            className="rounded-md mb-2 max-w-full h-auto"
                                        />
                                    )}
                                    {message.fileName && (
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-black/10 dark:bg-white/10 mb-2">
                                            <FileIcon className="h-5 w-5" />
                                            <span className="text-sm font-medium truncate">{message.fileName}</span>
                                        </div>
                                    )}
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
                <div className="mt-auto pt-4 border-t">
                    {filePreview && (
                        <div className="relative w-full mb-2 border rounded-md p-2 flex items-center gap-2 bg-muted/50">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate flex-1">{filePreview.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={removeFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <FormField
                            control={form.control}
                            name="doubt"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormLabel className="sr-only">Your Doubt</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="Explain the problem in the file or ask a question..."
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
            </CardContent>
        </div>
    </Card>
  );
}

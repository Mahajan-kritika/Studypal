
'use client';

import Link from "next/link"
import { BookOpen, Loader2, RefreshCw } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser, type UserProfile } from "@/hooks/use-user-role"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"


const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    captcha: z.string().min(1, { message: "Please enter the text from the image." }),
});

const getMockUserDatabase = () => {
    if (typeof window === 'undefined') {
      return {};
    }
    const storedDb = localStorage.getItem('mockUserDatabase');
    if (storedDb) {
      try {
        return JSON.parse(storedDb);
      } catch (e) {
        return {};
      }
    }
    return {};
};

const saveMockUserDatabase = (db: { [email: string]: UserProfile }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockUserDatabase', JSON.stringify(db));
    }
};

const generateCaptchaText = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // Avoid ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const generateNoise = (width: number, height: number) => {
    const noiseLines = [];
    for (let i = 0; i < 5; i++) {
        noiseLines.push(`<line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" stroke="hsl(var(--muted-foreground))" stroke-width="1" opacity="0.3" />`);
    }
    let noiseDots = '';
    for (let i = 0; i < 100; i++) {
      noiseDots += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="1" fill="hsl(var(--muted-foreground))" opacity="0.2" />`;
    }
    const strikePathY = height / 2 + (Math.random() * 10 - 5);
    const strikePath = `<path d="M5 ${strikePathY} C ${width/3} ${strikePathY - 10 + Math.random() * 20}, ${width*2/3} ${strikePathY - 10 + Math.random() * 20}, ${width - 5} ${strikePathY}" stroke="hsl(var(--muted-foreground))" stroke-width="1" fill="none" opacity="0.5" />`;

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0">${noiseDots}${noiseLines.join('')}${strikePath}</svg>`;
  };

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { loadUserByEmail } = useUser();
    const [captchaText, setCaptchaText] = useState('');
    const [isClient, setIsClient] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            captcha: "",
        },
    });

    useEffect(() => {
        setIsClient(true);
        regenerateCaptcha();
    }, []);

    const regenerateCaptcha = () => {
        setCaptchaText(generateCaptchaText());
    }

    const captchaNoiseSvg = useMemo(() => {
        if (!isClient) return '';
        const noise = generateNoise(180, 40);
        return `data:image/svg+xml;base64,${btoa(noise)}`;
    }, [captchaText, isClient]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.captcha.toLowerCase() !== captchaText.toLowerCase()) {
            form.setError("captcha", {
                type: "manual",
                message: "Incorrect CAPTCHA. Please try again.",
            });
            regenerateCaptcha();
            return;
        }

        setIsLoading(true);
        
        const db = getMockUserDatabase();
        
        // If user already exists, treat it as a login
        if (db[values.email.toLowerCase()]) {
            setTimeout(() => {
                loadUserByEmail(values.email);
                toast({
                    title: 'Welcome Back!',
                    description: "You're already registered. Logging you in now.",
                });
                router.push('/dashboard');
                setIsLoading(false);
            }, 1000);
            return;
        }

        // Otherwise, create a new account
        setTimeout(() => {
            const userId = values.email.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const newUser: UserProfile = {
                name: `${values.firstName} ${values.lastName}`,
                email: values.email.toLowerCase(),
                id: userId,
                avatar: `https://i.pravatar.cc/150?u=${userId}`,
                role: 'Student',
                class: '10th Grade',
                field: '',
                institution: '',
            };

            db[newUser.email] = newUser;
            saveMockUserDatabase(db);
            
            loadUserByEmail(newUser.email);

            toast({
                title: "Account Created!",
                description: "Welcome to StudyPal. You're being redirected to your dashboard.",
            });

            router.push('/dashboard');
            setIsLoading(false);
        }, 1000);
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative">
        <div className="absolute top-4 right-4">
            <ModeToggle />
        </div>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
           <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary font-headline">
                StudyPal
              </h1>
            </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Max" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Robinson" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="space-y-2">
                    <FormLabel htmlFor="captcha">Human Verification</FormLabel>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted select-none">
                        {!isClient ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <>
                            <div className="relative font-mono text-2xl tracking-widest flex-grow text-center" style={{ height: '40px' }}>
                                <img src={captchaNoiseSvg} alt="CAPTCHA background noise" className="absolute inset-0 w-full h-full" />
                                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                    {captchaText.split('').map((char, index) => {
                                        const colors = ['hsl(var(--primary))', 'hsl(var(--foreground))', 'hsl(var(--accent-foreground))'];
                                        const rotation = Math.random() * 30 - 15;
                                        const yOffset = Math.random() * 8 - 4;
                                        const skew = Math.random() * 20 - 10;
                                        const color = colors[Math.floor(Math.random() * colors.length)];
                                        return (
                                            <span key={index} style={{
                                                transform: `rotate(${rotation}deg) translateY(${yOffset}px) skewX(${skew}deg)`,
                                                color,
                                                display: 'inline-block',
                                                fontWeight: Math.random() > 0.5 ? 'bold' : 'normal'
                                            }}>
                                                {char}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={regenerateCaptcha}>
                                <RefreshCw className="w-4 h-4" />
                                <span className="sr-only">Refresh CAPTCHA</span>
                            </Button>
                            </>
                        )}
                    </div>
                    <FormField
                        control={form.control}
                        name="captcha"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Enter the text above" {...field} id="captcha" autoComplete="off" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create an account
                </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
    

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
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
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser, type UserProfile } from '@/hooks/use-user-role';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

const getMockUserDatabase = (): { [email: string]: UserProfile } => {
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
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { loadUserByEmail } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // In a real app, this would be an API call to your backend to check credentials.
    const mockUserDatabase = getMockUserDatabase();

    if (!mockUserDatabase[values.email.toLowerCase()]) {
        setTimeout(() => {
            toast({
                variant: 'destructive',
                title: 'User Not Found',
                description: "This email isn't registered. Please sign up first.",
            });
            setIsLoading(false);
        }, 1000);
        return;
    }

    // Simulate API call for genuine users
    setTimeout(() => {
      loadUserByEmail(values.email);
      toast({
        title: 'Login Successful',
        description: "Welcome back! You're being redirected to your dashboard.",
      });
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
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
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline text-primary"
                >
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  );
}

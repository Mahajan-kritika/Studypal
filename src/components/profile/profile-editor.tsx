'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Save, Camera, School, KeyRound, BookCopy, AtSign, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user-role';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const profileSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    institutionName: z.string().optional(),
    class: z.string().optional(),
    field: z.string().optional(),
    customField: z.string().optional(),
    engineeringField: z.string().optional(),
    customEngineeringField: z.string().optional(),
  })
  .refine(
    (data) => {
        if (data.class === 'Undergraduate' && data.field === 'Other') {
            return data.customField && data.customField.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Please specify your field of study.',
        path: ['customField'],
    }
  ).refine(data => {
    if (data.field === 'Engineering' && data.engineeringField === 'Other') {
        return data.customEngineeringField && data.customEngineeringField.trim().length > 0;
    }
    return true;
  }, {
    message: 'Please specify your engineering field.',
    path: ['customEngineeringField'],
  });

export function ProfileEditor() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser, userAvatar, setUserAvatar, userId } = useUser();
  const profileBgImage = PlaceHolderImages.find(img => img.id === 'profile-card-background');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      institutionName: '',
      class: '',
      field: '',
      customField: '',
      engineeringField: '',
      customEngineeringField: '',
    },
  });

  const watchClass = form.watch('class');
  const watchField = form.watch('field');
  const watchEngineeringField = form.watch('engineeringField');

  useEffect(() => {
    if (user && user.email) { // Check if user data is loaded
        const predefinedFields = ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts', 'Law'];
        const engineeringFields = ['Computer Engg', 'Civil', 'Mechanical'];
        
        let mainField = user.field || '';
        let engField = '';
        let customEngField = '';
        let customMainField = '';

        if (user.field?.startsWith('Engineering: ')) {
            mainField = 'Engineering';
            const specificEngField = user.field.replace('Engineering: ', '');
            if (engineeringFields.includes(specificEngField)) {
                engField = specificEngField;
            } else {
                engField = 'Other';
                customEngField = specificEngField;
            }
        } else if (user.field && !predefinedFields.includes(user.field)) {
            mainField = 'Other';
            customMainField = user.field;
        }

        form.reset({
          name: user.name || '',
          email: user.email || '',
          institutionName: user.institution || '',
          class: user.class || '',
          field: mainField || '',
          customField: customMainField || '',
          engineeringField: engField || '',
          customEngineeringField: customEngField || '',
        });
        setIsFormLoaded(true);
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSubmitting(true);

    let finalField = values.field;
    if (values.class === 'Undergraduate') {
        if (values.field === 'Other') {
            finalField = values.customField;
        } else if (values.field === 'Engineering') {
            if (values.engineeringField === 'Other') {
                finalField = `Engineering: ${values.customEngineeringField}`;
            } else {
                finalField = `Engineering: ${values.engineeringField}`;
            }
        }
    } else {
        finalField = '';
    }
    
    updateUser({
      name: values.name,
      email: values.email,
      class: values.class,
      field: finalField,
      institution: values.institutionName,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
        toast({
            title: "Picture updated!",
            description: "Your new profile picture has been set."
        })
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 relative overflow-hidden">
          {profileBgImage && (
            <Image
                src={profileBgImage.imageUrl}
                alt={profileBgImage.description}
                layout="fill"
                objectFit="cover"
                className="opacity-20"
                data-ai-hint={profileBgImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-background/50 dark:bg-background/70" />
          <div className="relative z-10 h-full flex flex-col">
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 flex-grow">
                <Avatar className="h-32 w-32 border-4 border-background/50 shadow-lg">
                <AvatarImage src={userAvatar} alt="User avatar" />
                <AvatarFallback>
                    <User className="h-16 w-16" />
                </AvatarFallback>
                </Avatar>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
                />
                <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                >
                <Camera className="mr-2 h-4 w-4" />
                Change Picture
                </Button>
            </CardContent>
          </div>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and other details here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isFormLoaded ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Loading profile...</p>
                </div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={userId}
                        disabled
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                       <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="email" placeholder="your@email.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                >
                                <FormControl>
                                    <div className="relative">
                                        <BookCopy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <SelectTrigger className='pl-10'>
                                            <SelectValue placeholder="Select your class" />
                                        </SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="6th Grade">6th Grade</SelectItem>
                                    <SelectItem value="7th Grade">7th Grade</SelectItem>
                                    <SelectItem value="8th Grade">8th Grade</SelectItem>
                                    <SelectItem value="9th Grade">9th Grade</SelectItem>
                                    <SelectItem value="10th Grade">10th Grade</SelectItem>
                                    <SelectItem value="11th Grade">11th Grade</SelectItem>
                                    <SelectItem value="12th Grade">12th Grade</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    {watchClass === 'Undergraduate' && (
                        <div className='space-y-6 pl-4 border-l-2'>
                            <FormField
                                control={form.control}
                                name="field"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Field of Study</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <div className='relative'>
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <SelectTrigger className='pl-10'>
                                                    <SelectValue placeholder="Select your field of study" />
                                                </SelectTrigger>
                                            </div>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                            <SelectItem value="Medicine">Medicine</SelectItem>
                                            <SelectItem value="Business">Business</SelectItem>
                                            <SelectItem value="Arts">Arts</SelectItem>
                                            <SelectItem value="Law">Law</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {watchField === 'Other' && (
                                <FormField
                                    control={form.control}
                                    name="customField"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom Field of Study</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 'Neuroscience'" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {watchField === 'Engineering' && (
                                <div className='space-y-6 pl-4 border-l-2'>
                                <FormField
                                    control={form.control}
                                    name="engineeringField"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Engineering Field</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                                <div className='relative'>
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <SelectTrigger className='pl-10'>
                                                        <SelectValue placeholder="Select your engineering field" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Computer Engg">Computer Engg</SelectItem>
                                                <SelectItem value="Civil">Civil</SelectItem>
                                                <SelectItem value="Mechanical">Mechanical</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {watchEngineeringField === 'Other' && (
                                    <FormField
                                        control={form.control}
                                        name="customEngineeringField"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custom Engineering Field</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 'Aerospace'" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                </div>
                            )}
                        </div>
                    )}
                    <FormField
                      control={form.control}
                      name="institutionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g., 'State University'"
                                {...field}
                                className="pl-10"
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

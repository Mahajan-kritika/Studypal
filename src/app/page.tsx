import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoginForm } from '@/components/login-form';
import { ModeToggle } from '@/components/layout/mode-toggle';

export default function LoginPage() {
  const loginHeroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen relative">
       <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary font-headline">
                StudyPal
              </h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to start your personalized learning path.
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginHeroImage && (
          <Image
            src={loginHeroImage.imageUrl}
            alt={loginHeroImage.description}
            layout="fill"
            objectFit="cover"
            className="h-full w-full"
            data-ai-hint={loginHeroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
         <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-4xl font-bold">Your Personalized Path to Mastery</h2>
            <p className="mt-2 max-w-lg">Unlock your potential with AI-powered study plans, intelligent explanations, and adaptive practice tests.</p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { UserProvider } from '@/hooks/use-user-role';
import { HistoryProvider } from '@/hooks/use-history';
import { ThemeProvider } from '@/components/theme-provider';
import { TrackedTopicsProvider } from '@/hooks/use-tracked-topics';

export const metadata: Metadata = {
  title: 'StudyPal',
  description: 'Your personalized path to academic excellence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <UserProvider>
            <HistoryProvider>
                <TrackedTopicsProvider>
                  {children}
                </TrackedTopicsProvider>
            </HistoryProvider>
          </UserProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

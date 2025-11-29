
'use client';

import {
  LogOut,
  Settings,
  User,
  Trash2,
  FileDown,
  History,
  Info,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
  } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user-role';
import { useHistory } from '@/hooks/use-history';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { userName, userEmail, userAvatar, resetUser } = useUser();
  const { history, clearHistory } = useHistory();
  const { clearTrackedTopics } = useTrackedTopics();
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const handleLogout = () => {
    router.push('/');
  };

  const handleClearAllData = () => {
    try {
        clearHistory();
        clearTrackedTopics();
        resetUser(); // Resets user profile in local storage
        toast({
            title: "Local Data Cleared",
            description: "All your local history and settings have been reset. The app will now reload."
        });
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear local data."
        })
    }
  }

  const handleClearHistory = () => {
    try {
        clearHistory();
        toast({
            title: "History Cleared",
            description: "Your action history has been cleared for this user."
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear history."
        })
    }
  }

  const handleExportHistory = () => {
    try {
        if (history.length === 0) {
            toast({
                variant: 'destructive',
                title: "Nothing to Export",
                description: "Your history is empty."
            });
            return;
        }
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `studypal_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        toast({
            title: "History Exported",
            description: "Your action history has been downloaded as a JSON file."
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not export history."
        });
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && (
              <AvatarImage
                src={userAvatar}
                alt="User avatar"
              />
            )}
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setIsAboutDialogOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>About StudyPal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportHistory}>
                  <FileDown className="mr-2 h-4 w-4" />
                  <span>Export History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <History className="mr-2 h-4 w-4" />
                      <span>Clear History</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your action history for this user. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Clear History</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Clear All Data</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete ALL your local data, including your profile, history, and tracked topics. This action cannot be undone and will log you out.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Yes, delete everything</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    About StudyPal
                </DialogTitle>
                <DialogDescription>
                    Your personalized path to academic excellence.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                    <strong>Version:</strong> 1.0.0
                </p>
                <p>
                    StudyPal is a revolutionary AI-powered learning assistant designed to help students of all ages achieve their academic goals. From personalized study plans to intelligent explanations of complex topics, StudyPal is your dedicated partner in education.
                </p>
                <p>
                    For more information, visit our website.
                </p>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
                <a href="#" target="_blank" rel="noopener noreferrer" className='text-xs text-muted-foreground'>
                    www.studypal.com
                </a>
                <Button type="button" onClick={() => setIsAboutDialogOpen(false)}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

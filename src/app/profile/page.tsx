
import AppLayout from '@/components/layout/app-layout';
import { ProfileEditor } from '@/components/profile/profile-editor';

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              My Profile
            </h2>
            <p className="text-muted-foreground">
              Manage your personal information and account settings.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
          <ProfileEditor />
        </div>
      </div>
    </AppLayout>
  );
}

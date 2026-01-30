'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth-client';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AddActivityModal } from '@/components/dashboard/add-activity-modal';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Give a small delay to ensure token is set if coming from OAuth callback
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.log('No current user, redirecting to login');
        router.push('/login');
        return;
      }
      console.log('User authenticated:', currentUser);
      setUser(currentUser);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8B4513]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#8B4513]">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#333333]">
              {user.email}
            </span>
            <Button
              onClick={logout}
              variant="outline"
              className="text-sm"
            >
              Logout
            </Button>
            <AddActivityModal />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

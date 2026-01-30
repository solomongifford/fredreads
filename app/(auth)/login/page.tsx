'use client';

import { login } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { checkAuthCallback } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we're returning from OAuth callback (this sets the token in localStorage)
    const hasToken = checkAuthCallback();
    
    if (hasToken) {
      // Token was just set from URL, redirect immediately
      router.push('/classes');
      return;
    }
    
    // If we already have a token, redirect to dashboard
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/classes');
    }
  }, [router]);

  const handleLogin = () => {
    setIsLoading(true);
    login();
    // Note: The page will redirect or reload after OAuth, so we don't need to set loading to false
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-6 text-[#8B4513]">
          Fredericksburg READS Literacy Council Admin
        </h1>
        <p className="text-[#333333] mb-6 text-sm">
          Sign in with your Google account to access the admin dashboard.
        </p>
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            'Sign in with Google'
          )}
        </Button>
      </div>
    </div>
  );
}

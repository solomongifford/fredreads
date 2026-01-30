'use client';

import { login } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { checkAuthCallback } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

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
    login();
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
          className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

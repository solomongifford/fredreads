'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, checkAuthCallback } from '@/lib/auth-client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're returning from OAuth callback (this sets the token in localStorage)
    const hasToken = checkAuthCallback();
    
    if (hasToken) {
      // Token was just set from URL, redirect immediately
      router.push('/classes');
      return;
    }
    
    // Check for existing token
    const token = getAuthToken();
    if (token) {
      router.push('/classes');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-[#8B4513]">Loading...</div>
    </div>
  );
}

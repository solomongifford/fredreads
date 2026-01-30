// Client-side authentication for static frontend
// All auth logic is handled by the Workers backend

import { getApiBaseUrl } from './api-config';

const TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<{ email: string } | null> {
  const token = getAuthToken();
  if (!token) {
    console.log('No auth token found');
    return null;
  }

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth check failed:', response.status, errorText);
      removeAuthToken();
      return null;
    }

    const user = await response.json();
    console.log('Auth check successful:', user);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function login(): void {
  // Redirect to backend OAuth endpoint
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';
  const apiBaseUrl = getApiBaseUrl();
  window.location.href = `${apiBaseUrl}/api/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function logout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
  removeAuthToken();
  window.location.href = '/login';
}

// Check if we have a token in URL (from OAuth callback)
export function checkAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    setAuthToken(token);
    // Remove token from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    return true; // Token was found and set
  }
  return false; // No token in URL
}

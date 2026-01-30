// Client-side authentication for static frontend
// All auth logic is handled by the Workers backend

import { API_BASE_URL } from './api-config';

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
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function login(): void {
  // Redirect to backend OAuth endpoint
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';
  window.location.href = `${API_BASE_URL}/api/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function logout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
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
export function checkAuthCallback(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    setAuthToken(token);
    // Remove token from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
}

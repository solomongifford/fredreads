// API base URL configuration
// In production, this should point to your Cloudflare Workers API
// In development, you can use the local Workers dev server or Next.js API routes

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8787' // Local Workers dev server
    : 'https://fredreads-api.solomongifford.workers.dev'); // Production Workers URL

// Helper function to get full API URL
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

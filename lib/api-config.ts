// API base URL configuration
// In production, this should point to your Cloudflare Workers API
// In development, you can use the local Workers dev server

function getApiBaseUrl(): string {
  // Always use localhost in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8787';
  }
  
  // In production, always use the Workers API URL
  // The frontend is static HTML on Cloudflare Pages, so all API calls must go to Workers
  return 'https://fredreads-api.solomongifford.workers.dev';
}

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get full API URL
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

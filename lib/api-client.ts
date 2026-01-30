// API client for making authenticated requests to Workers backend

import { getAuthToken } from './auth-client';
import { getApiBaseUrl } from './api-config';

export async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers if they exist
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Get API base URL at runtime to ensure it's always correct
  const apiBaseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const response = await apiRequest(path, { method: 'GET' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost<T = any>(path: string, data?: any): Promise<T> {
  const response = await apiRequest(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPut<T = any>(path: string, data?: any): Promise<T> {
  const response = await apiRequest(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const response = await apiRequest(path, { method: 'DELETE' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }
  return response.json();
}

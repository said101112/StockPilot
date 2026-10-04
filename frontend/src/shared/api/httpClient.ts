export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = '';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sp_access_token');
}
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sp_refresh_token');
}
function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sp_access_token');
  localStorage.removeItem('sp_refresh_token');
  localStorage.removeItem('sp_user');
}
function setAccessToken(v: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sp_access_token', v);
}
function setRefreshToken(v: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sp_refresh_token', v);
}
function setUser(v: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sp_user', JSON.stringify(v));
}

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    if (data.user) setUser(data.user);
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

async function refreshTokenOnce(): Promise<string | null> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = doRefresh().finally(() => {
      isRefreshing = false;
    });
  }
  return refreshPromise;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getAccessToken();
  if (token) defaultHeaders.Authorization = `Bearer ${token}`;

  const mergedHeaders = { ...defaultHeaders, ...(options.headers as Record<string, string> | undefined) };

  let response = await fetch(url, { ...options, headers: mergedHeaders });

  if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh') && !endpoint.includes('/api/auth/register')) {
    const newToken = await refreshTokenOnce();
    if (newToken) {
      const retryHeaders = { ...mergedHeaders, Authorization: `Bearer ${newToken}` };
      response = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      clearTokens();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  if (!response.ok) {
    let data: unknown = undefined;
    const ct = response.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      try { data = await response.json(); } catch {}
    } else {
      try { data = await response.text(); } catch {}
    }
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof (data as any).message === 'string')
        ? (data as any).message
        : (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string')
        ? (data as any).error
        : response.statusText || 'Request failed';
    throw new ApiError(message, response.status, data);
  }

  if (response.status === 204) return {} as T;
  const ct = response.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await response.json()) as T;
  return (await response.text()) as unknown as T;
}

function withApiPrefix(path: string) {
  if (path.startsWith('/api')) return path;
  return `/api${path.startsWith('/') ? path : `/${path}`}`;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestInit) => apiClient<T>(withApiPrefix(path), { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiClient<T>(withApiPrefix(path), { ...options, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiClient<T>(withApiPrefix(path), { ...options, method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiClient<T>(withApiPrefix(path), { ...options, method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => apiClient<T>(withApiPrefix(path), { ...options, method: 'DELETE' }),
};

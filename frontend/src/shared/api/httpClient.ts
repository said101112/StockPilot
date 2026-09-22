/**
 * Client HTTP centralisé pour StockPilot (avec proxy vers http://localhost:8999).
 */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      // Pas de corps JSON
    }
    throw new ApiError(response.status, `Erreur ${response.status}: ${errorDetail}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const httpClient = {
  get: <T>(url: string) => apiClient<T>(url.startsWith("/api") ? url : `/api${url}`),
  post: <T>(url: string, body?: unknown) =>
    apiClient<T>(url.startsWith("/api") ? url : `/api${url}`, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: unknown) =>
    apiClient<T>(url.startsWith("/api") ? url : `/api${url}`, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) =>
    apiClient<T>(url.startsWith("/api") ? url : `/api${url}`, {
      method: "DELETE",
    }),
};


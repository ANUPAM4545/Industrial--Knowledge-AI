// NEXO Enterprise API Client

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.detail || 'API request failed', errorData);
  }
  return response.json();
}

function getHeaders(customHeaders: HeadersInit = {}) {
  const token = localStorage.getItem('nexo_token');
  const workspaceId = localStorage.getItem('nexo_workspace_id');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  if (workspaceId) {
    (headers as Record<string, string>)['X-Workspace-ID'] = workspaceId;
  }
  
  return headers;
}

export const api = {
  get: async <T = any>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async <T = any>(endpoint: string, data?: any, customHeaders?: HeadersInit): Promise<T> => {
    // If data is FormData, let browser set Content-Type to multipart/form-data with boundary
    const isFormData = data instanceof FormData;
    const headers = getHeaders(customHeaders);
    if (isFormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  getBaseUrl: () => BASE_URL,
  getHeaders
};

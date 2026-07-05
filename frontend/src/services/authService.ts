import apiClient from './apiClient';
import type { User, AuthTokens } from '@/types';

export interface RegisterPayload {
  email: string;
  username: string;
  full_name: string;
  password?: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const params = new URLSearchParams();
    params.append('username', email); // OAuth2 spec: username field carries email
    params.append('password', password);

    const response = await apiClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export default authService;

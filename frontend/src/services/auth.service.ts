import api from "./api";
import { authStore } from "@/store/auth.store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "USER" | "COMPANY";
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    avatarUrl?: string;
  };
  accessToken: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      "/auth/register",
      data
    );
    const { user, accessToken } = response.data.data;
    authStore.getState().login(user as any, accessToken);
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      "/auth/login",
      credentials
    );
    const { user, accessToken } = response.data.data;
    authStore.getState().login(user as any, accessToken);
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      authStore.getState().logout();
    }
  },

  async refreshToken(): Promise<string> {
    const response = await api.post<{ success: boolean; data: { accessToken: string } }>(
      "/auth/refresh"
    );
    const { accessToken } = response.data.data;
    authStore.getState().setAccessToken(accessToken);
    return accessToken;
  },

  getOAuthUrl(provider: "google" | "github"): string {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    return `${baseUrl}/auth/${provider}`;
  },
};


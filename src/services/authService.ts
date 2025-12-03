// src/services/authService.ts
import { apiPost, refreshToken as apiRefreshToken } from "../api/client";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private refreshTokenPromise: Promise<boolean> | null = null;
  private lastRefreshAttempt: number = 0;
  private refreshCooldown: number = 5000; // 5 seconds cooldown

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiPost("/api/v1/auth/login", credentials);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiPost("/api/v1/auth/register", data);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiPost("/api/v1/auth/logout");
    } catch (error) {
      // Ignore errors during logout
      console.warn("Logout error:", error);
    }
  }

  /**
   * Refresh the access token using the refresh token.
   * Ensures only one refresh request is made at a time.
   */
  async refreshToken(): Promise<boolean> {
    const now = Date.now();

    // Check if we're still in cooldown period
    if (now - this.lastRefreshAttempt < this.refreshCooldown) {
      console.warn("Refresh token request rate limited");
      // Return the existing promise if one is in progress
      if (this.refreshTokenPromise) {
        return this.refreshTokenPromise;
      }
      // Otherwise return false to indicate failure
      return false;
    }

    // If there's already a refresh in progress, return that promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    // Update last attempt time
    this.lastRefreshAttempt = now;

    // Create a new refresh promise
    this.refreshTokenPromise = this.performRefresh();

    try {
      const result = await this.refreshTokenPromise;
      return result;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    } finally {
      // Clean up the promise reference
      this.refreshTokenPromise = null;
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const refreshed = await apiRefreshToken();
      return refreshed;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }
}

export default AuthService.getInstance();

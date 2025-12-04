// src/api/client.ts
import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE = "http://localhost:3005";

let accessToken: string | null = null;

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors for token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if it's specifically an access token expired error
      if (error.response.data?.code === "ACCESS_TOKEN_EXPIRED") {
        originalRequest._retry = true;
        console.log("Access token expired, attempting refresh...");

        const refreshed = await refreshToken();
        if (refreshed) {
          console.log("Token refreshed, retrying original request");
          return apiClient(originalRequest);
        }
      } else {
        // Any other 401 → hard fail
        console.log("Unauthorized (not refreshable), logging out");
        setAccessToken(null);
        return Promise.reject(new Error("Unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

// Track refresh attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Export refreshToken so it can be used elsewhere
export async function refreshToken(): Promise<boolean> {
  try {
    // Prevent infinite refresh loops
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.error("Max refresh attempts reached, stopping refresh loop");
      return false;
    }

    refreshAttempts++;

    const response = await apiClient.post("/api/v1/auth/refresh");

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      refreshAttempts = 0; // Reset counter on successful refresh
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

// Generic request function
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient(config);
  return response.data;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>({ method: "GET", url: path });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>({ method: "POST", url: path, data: body });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>({ method: "PUT", url: path, data: body });
}

export function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  return request<T>({ method: "DELETE", url: path, data: body });
}

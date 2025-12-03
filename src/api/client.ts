// src/api/client.ts
const API_BASE = "http://localhost:3005";

let accessToken: string | null = null;

// Track refresh attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Export refreshToken so it can be used elsewhere
export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.log("Refresh token request failed with status:", res.status);
      return false;
    }

    const data = await res.json();

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      refreshAttempts = 0; // Reset counter on successful refresh
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

let refreshingPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // If there's already a refresh in progress, return that promise
  if (refreshingPromise) {
    return refreshingPromise;
  }

  // Prevent infinite refresh loops
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.error("Max refresh attempts reached, stopping refresh loop");
    return false;
  }

  refreshAttempts++;

  // Create a new refresh promise
  refreshingPromise = refreshToken();

  try {
    const result = await refreshingPromise;
    return result;
  } finally {
    // Clean up the promise reference
    refreshingPromise = null;
  }
}

async function request(path: string, options: RequestInit = {}, retry = true) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as Record<string, string>).Authorization = "Bearer " + accessToken;
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    credentials: "include", // so refresh cookie is sent
  });

  // Handle 401 properly (refresh ONLY if access token expired)
  if (res.status === 401 && retry) {
    let errorBody = null;

    try {
      // clone() because response body can be read only once
      errorBody = await res.clone().json();
    } catch {
      // ignore JSON parse errors
    }

    if (errorBody?.code === "ACCESS_TOKEN_EXPIRED") {
      console.log("Access token expired, attempting refresh...");

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        console.log("Token refreshed, retrying original request");
        return request(path, options, false);
      }
    }

    // Any other 401 → hard fail
    console.log("Unauthorized (not refreshable), logging out");
    setAccessToken(null);
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export function apiGet(path: string) {
  return request(path, { method: "GET" });
}

export function apiPost(path: string, body?: unknown) {
  return request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut(path: string, body?: unknown) {
  return request(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete(path: string) {
  return request(path, {
    method: "DELETE",
  });
}

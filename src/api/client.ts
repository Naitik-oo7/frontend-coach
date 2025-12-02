// src/api/client.ts
const API_BASE = "http://localhost:3005/api/v1";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Export refreshToken so it can be used elsewhere
export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function request(path: string, options: RequestInit = {}, retry = true) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as any).Authorization = "Bearer " + accessToken;
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    credentials: "include", // so refresh cookie is sent
  });

  // Auto refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request(path, options, false);
    }
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

export function apiPost(path: string, body?: any) {
  return request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut(path: string, body?: any) {
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

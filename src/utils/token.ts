// src/utils/token.ts
// Utility functions for token handling in the frontend

/**
 * Verifies if a JWT token is expired
 * @param token - JWT token string
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    // If we can't parse the token, treat it as expired
    return true;
  }
}

/**
 * Gets the expiration time of a JWT token
 * @param token - JWT token string
 * @returns expiration timestamp or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp;
  } catch {
    return null;
  }
}

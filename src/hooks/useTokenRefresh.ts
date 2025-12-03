// src/hooks/useTokenRefresh.ts
import { useCallback } from "react";
import AuthService from "../services/authService";

/**
 * Hook for handling token refresh operations
 */
export const useTokenRefresh = () => {
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      return await AuthService.refreshToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  return { refreshToken };
};

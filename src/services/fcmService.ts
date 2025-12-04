// src/services/fcmService.ts
import { apiPost, apiDelete, apiGet } from "../api/client";

interface FcmToken {
  token: string;
  createdAt: string;
}

class FcmService {
  private static instance: FcmService;
  // Simple in-memory rate limiting on the client side
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly RATE_LIMIT_MAX = 5; // Max 5 requests per window

  private constructor() {}

  static getInstance(): FcmService {
    if (!FcmService.instance) {
      FcmService.instance = new FcmService();
    }
    return FcmService.instance;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      // Reset rate limit window
      this.lastRequestTime = now;
      this.requestCount = 1;
      return true;
    }

    if (this.requestCount >= this.RATE_LIMIT_MAX) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    this.requestCount++;
    return true;
  }

  /**
   * Save FCM token for the current user
   * @param token - The FCM token to save
   */
  async saveFcmToken(token: string): Promise<void> {
    if (!this.checkRateLimit()) {
      console.warn("Rate limit exceeded for saveFcmToken");
      throw new Error("Too many requests. Please try again later.");
    }

    console.log("Calling API to save FCM token:", token);
    await apiPost("/api/v1/fcm/save", { token });
  }

  /**
   * Remove FCM token for the current user
   * @param token - The FCM token to remove
   */
  async removeFcmToken(token: string): Promise<void> {
    if (!this.checkRateLimit()) {
      console.warn("Rate limit exceeded for removeFcmToken");
      throw new Error("Too many requests. Please try again later.");
    }

    await apiDelete("/api/v1/fcm/remove", { token });
  }

  /**
   * Get all FCM tokens for the current user
   */
  async getFcmTokens(): Promise<FcmToken[]> {
    if (!this.checkRateLimit()) {
      console.warn("Rate limit exceeded for getFcmTokens");
      throw new Error("Too many requests. Please try again later.");
    }

    const response = await apiGet<{ tokens: FcmToken[] }>("/api/v1/fcm/");
    return response.tokens;
  }
}

export default FcmService.getInstance();

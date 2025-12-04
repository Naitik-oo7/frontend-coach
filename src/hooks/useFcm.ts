// src/hooks/useFcm.ts
import { useState, useEffect } from "react";
import FcmService from "../services/fcmService";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

// Firebase configuration
// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

interface UseFcmReturn {
  fcmToken: string | null;
  isSupported: boolean;
  requestPermission: () => Promise<string>;
  saveToken: (token: string) => Promise<void>;
  removeToken: (token: string) => Promise<void>;
}

export function useFcm(): UseFcmReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  useEffect(() => {
    // Initialize Firebase
    try {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      setMessaging(messaging);
      setIsSupported(true);

      // Handle incoming messages when the app is in the foreground
      onMessage(messaging, (payload) => {
        console.log("Message received in foreground: ", payload);
        // Show notification even in foreground to maintain consistency
        if (Notification.permission === "granted") {
          // Create a notification using the same data as background notifications
          const notificationTitle =
            payload.notification?.title || "New Message";
          const notificationOptions = {
            body: payload.notification?.body || "",
            icon: "/favicon.ico",
            data: payload.data,
          };

          // Use the service worker to show the notification
          if (
            "serviceWorker" in navigator &&
            navigator.serviceWorker.controller
          ) {
            navigator.serviceWorker.controller.postMessage({
              type: "SHOW_NOTIFICATION",
              title: notificationTitle,
              options: notificationOptions,
            });
          } else {
            // Fallback to direct notification if service worker is not available
            new Notification(notificationTitle, notificationOptions);
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setIsSupported(false);
    }
  }, []);

  const requestPermission = async (): Promise<string> => {
    if (!isSupported || !messaging) {
      throw new Error("FCM not supported in this browser");
    }

    try {
      // Request permission to send notifications
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Get FCM token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;
      if (!vapidKey) {
        throw new Error("VAPID key not configured");
      }

      const token = await getToken(messaging, { vapidKey });
      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      return token;
    } catch (error) {
      console.error("Failed to get FCM token:", error);
      throw error;
    }
  };

  const saveToken = async (token: string): Promise<void> => {
    try {
      console.log("Saving FCM token:", token);
      await FcmService.saveFcmToken(token);
      setFcmToken(token);
    } catch (error) {
      // Handle rate limiting
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("too many requests")
      ) {
        console.warn("Rate limit exceeded when saving FCM token, skipping...");
        // Don't throw the error to prevent cascading failures
        return;
      }
      console.error("Failed to save FCM token:", error);
      throw error;
    }
  };

  const removeToken = async (token: string): Promise<void> => {
    try {
      await FcmService.removeFcmToken(token);
      setFcmToken(null);
    } catch (error) {
      // Handle rate limiting
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("too many requests")
      ) {
        console.warn(
          "Rate limit exceeded when removing FCM token, skipping..."
        );
        // Don't throw the error to prevent cascading failures
        return;
      }
      console.error("Failed to remove FCM token:", error);
      throw error;
    }
  };

  return {
    fcmToken,
    isSupported,
    requestPermission,
    saveToken,
    removeToken,
  };
}

// src/hooks/useFcm.ts
import { useState, useEffect } from "react";
import FcmService from "../services/fcmService";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

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
    try {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      setMessaging(messaging);
      setIsSupported(true);

      // FOREGROUND HANDLER — LOG ONLY
      onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
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
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;
      if (!vapidKey) throw new Error("VAPID key not configured");

      const token = await getToken(messaging, { vapidKey });
      if (!token) throw new Error("Failed to get FCM token");

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
      if (
        error instanceof Error &&
        error.message.includes("too many requests")
      ) {
        console.warn("Rate limit exceeded saving FCM token");
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
      if (
        error instanceof Error &&
        error.message.includes("too many requests")
      ) {
        console.warn("Rate limit exceeded removing FCM token");
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

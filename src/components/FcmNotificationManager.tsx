// src/components/FcmNotificationManager.tsx
import React, { useEffect, useState, useRef } from "react";
import { useFcm } from "../hooks/useFcm";
import { useToast } from "../hooks/useToast";

const FcmNotificationManager: React.FC = () => {
  const { fcmToken, isSupported, requestPermission, saveToken, removeToken } =
    useFcm();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Request permission and get token when component mounts
    const initializeFcm = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current || !isSupported || fcmToken) {
        return;
      }

      hasInitialized.current = true;

      try {
        setIsLoading(true);
        const token = await requestPermission();
        await saveToken(token);
        toast.success("FCM notifications enabled");
      } catch (error) {
        console.error("Failed to initialize FCM:", error);
        if (
          error instanceof Error &&
          !error.message.includes("too many requests")
        ) {
          toast.error("Failed to enable notifications");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize if we don't already have a token
    if (!fcmToken) {
      initializeFcm();
    }
  }, [fcmToken, isSupported]);

  const handleDisableNotifications = async () => {
    if (!fcmToken) return;

    try {
      setIsLoading(true);
      await removeToken(fcmToken);
      toast.success("Notifications disabled");
    } catch (error) {
      console.error("Failed to disable notifications:", error);
      if (
        error instanceof Error &&
        !error.message.includes("too many requests")
      ) {
        toast.error("Failed to disable notifications");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if FCM is not supported
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
      {fcmToken ? (
        <div>
          <p className="text-green-600 mb-2">Notifications enabled</p>
          <button
            onClick={handleDisableNotifications}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Disabling..." : "Disable Notifications"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Enable push notifications to receive alerts
          </p>
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                const token = await requestPermission();
                await saveToken(token);
                toast.success("Notifications enabled");
              } catch (_error) {
                if (
                  _error instanceof Error &&
                  !_error.message.includes("too many requests")
                ) {
                  toast.error("Failed to enable notifications");
                }
                console.error(_error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FcmNotificationManager;

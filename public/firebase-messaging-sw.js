// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js"
);

// Firebase configuration
// Note: These values need to be hardcoded in the service worker as it doesn't have access to environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Listen for messages from the frontend to show notifications
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    // Prevent duplicate notifications by checking if we're already showing one
    self.registration.showNotification(event.data.title, event.data.options);
  }
});

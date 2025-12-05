// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// Firebase configuration
// Note: These values need to be hardcoded in the service worker as it doesn't have access to environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDeeNyUYjpJiwvtz_cJx2WxD2dag7lDbcM",
  authDomain: "practice-backend-60a0c.firebaseapp.com",
  projectId: "practice-backend-60a0c",
  storageBucket: "practice-backend-60a0c.firebasestorage.app",
  messagingSenderId: "351575397068",
  appId: "1:351575397068:web:3891c91fb9bf4f942ea869",
  measurementId: "G-S9EP0TH6FH",
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

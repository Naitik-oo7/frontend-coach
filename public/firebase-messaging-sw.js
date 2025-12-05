// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDeeNyUYjpJiwvtz_cJx2WxD2dag7lDbcM",
  authDomain: "practice-backend-60a0c.firebaseapp.com",
  projectId: "practice-backend-60a0c",
  storageBucket: "practice-backend-60a0c.firebasestorage.app",
  messagingSenderId: "351575397068",
  appId: "1:351575397068:web:3891c91fb9bf4f942ea869",
  measurementId: "G-S9EP0TH6FH",
});

const messaging = firebase.messaging();

// ONLY THIS HANDLER — nothing else
messaging.onBackgroundMessage(function (payload) {
  console.log("Background push received:", payload);

  const { title, body } = payload.notification;

  return self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
  });
});

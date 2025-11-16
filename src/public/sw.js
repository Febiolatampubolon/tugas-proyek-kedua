const CACHE_NAME = "story-maps-v1";
const RUNTIME_CACHE = "story-maps-runtime-v1";
const IMAGE_CACHE = "story-maps-images-v1";
const API_CACHE = "story-maps-api-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/scripts/index.js",
  "/styles/styles.css",
  "/favicon.png",
  "/images/logo.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== CACHE_NAME &&
              name !== RUNTIME_CACHE &&
              name !== IMAGE_CACHE &&
              name !== API_CACHE
            );
          })
          .map((name) => {
            console.log("Service Worker: Deleting old cache", name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/v1/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Handle image requests
  if (request.destination === "image") {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Handle static assets
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Default: network first for external resources
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

// Cache First Strategy - for static assets and images
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache First Strategy Error:", error);

    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      const cache = await caches.open(CACHE_NAME);
      return (
        cache.match("/index.html") || new Response("Offline", { status: 503 })
      );
    }

    throw error;
  }
}

// Network First Strategy - for API requests
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({ error: true, message: "Offline: Data tidak tersedia" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received", event);

  let notificationData = {
    title: "Story Maps",
    body: "Ada story baru yang ditambahkan!",
    icon: "/favicon.png",
    badge: "/favicon.png",
    tag: "story-notification",
    data: {
      url: "/#/map",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image,
        tag: data.tag || notificationData.tag,
        data: {
          url: data.url || data.data?.url || notificationData.data.url,
          storyId: data.storyId || data.data?.storyId,
        },
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
      // Use default notification data
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      actions: [
        {
          action: "view",
          title: "Lihat Story",
        },
        {
          action: "close",
          title: "Tutup",
        },
      ],
    })
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || "/#/map";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (optional, for offline sync)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "sync-stories") {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  // This will be called when device comes back online
  // The actual sync logic is handled in the main app
  console.log("Service Worker: Syncing stories...");
}

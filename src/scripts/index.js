// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import pushNotificationService from "./utils/push-notification";
import indexedDBService from "./utils/indexeddb";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker available
            console.log("New service worker available");
          }
        });
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}

// Initialize PWA features
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize IndexedDB
  try {
    await indexedDBService.init();
    console.log("IndexedDB initialized");
  } catch (error) {
    console.error("IndexedDB initialization failed:", error);
  }

  // Initialize Push Notification Service
  try {
    await pushNotificationService.init();

    // Check if already subscribed
    const isSubscribed = await pushNotificationService.isSubscribed();
    if (isSubscribed) {
      console.log("Push notification already subscribed");
    }
  } catch (error) {
    console.error("Push notification initialization failed:", error);
  }

  // Initialize App
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Listen for online/offline events for sync
  window.addEventListener("online", async () => {
    console.log("Device is online, syncing data...");
    await syncOfflineData();
  });
});

// Sync offline data when coming back online
async function syncOfflineData() {
  try {
    const pendingItems = await indexedDBService.getPendingSyncItems();

    if (pendingItems.length === 0) {
      return;
    }

    console.log(`Syncing ${pendingItems.length} pending items...`);

    for (const item of pendingItems) {
      try {
        if (item.type === "add") {
          // Import addStory function
          const { addStory } = await import("./data/api.js");

          // Note: Photo file might not be available for sync
          // In a real app, you'd store the file in IndexedDB as Blob
          // For now, we'll try to sync with available data
          const syncData = { ...item.data };

          // Check if photo is a File object
          if (!(syncData.photo instanceof File)) {
            console.warn("Photo file not available for sync");
            // Try to get photo from stored story in IndexedDB
            const storedStory = await indexedDBService.getStoryById(
              `offline-${item.id}`
            );
            if (storedStory && storedStory.photoUrl) {
              // Convert base64 back to File
              const response = await fetch(storedStory.photoUrl);
              const blob = await response.blob();
              syncData.photo = new File([blob], "photo.jpg", {
                type: blob.type,
              });
            } else {
              await indexedDBService.updateSyncItemStatus(
                item.id,
                "needs_manual_sync"
              );
              continue;
            }
          }

          const result = await addStory(syncData);

          if (!result.error && result.story) {
            // Save to IndexedDB as synced
            await indexedDBService.saveStory(result.story);
            // Remove from sync queue
            await indexedDBService.removeSyncItem(item.id);
            console.log("Story synced successfully:", result.story.id);
          } else {
            console.error("Sync failed:", result.message);
            await indexedDBService.updateSyncItemStatus(item.id, "failed");
          }
        }
      } catch (error) {
        console.error("Error syncing item:", error);
        await indexedDBService.updateSyncItemStatus(item.id, "failed");
      }
    }
  } catch (error) {
    console.error("Error during sync:", error);
  }
}

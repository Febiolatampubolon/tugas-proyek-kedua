import CONFIG from "../config";

const VAPID_PUBLIC_KEY_ENDPOINT = `${CONFIG.BASE_URL}/notifications/vapid-public-key`;

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  async init() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported");
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  }

  async getVAPIDPublicKey() {
    try {
      const response = await fetch(VAPID_PUBLIC_KEY_ENDPOINT);
      const data = await response.json();
      return data.publicKey || data.vapidPublicKey;
    } catch (error) {
      console.error("Error fetching VAPID public key:", error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async subscribe() {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      throw new Error("Service Worker not available");
    }

    try {
      const publicKey = await this.getVAPIDPublicKey();
      const applicationServerKey = this.urlBase64ToUint8Array(publicKey);

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      // Save subscription status
      localStorage.setItem("pushSubscription", "subscribed");
      localStorage.setItem(
        "pushSubscriptionData",
        JSON.stringify({
          endpoint: this.subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(
                ...new Uint8Array(this.subscription.getKey("p256dh"))
              )
            ),
            auth: btoa(
              String.fromCharCode(
                ...new Uint8Array(this.subscription.getKey("auth"))
              )
            ),
          },
        })
      );

      return this.subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      // Try to get existing subscription
      if (this.registration) {
        this.subscription =
          await this.registration.pushManager.getSubscription();
      }
    }

    if (this.subscription) {
      const success = await this.subscription.unsubscribe();
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscription);

        // Clear local storage
        localStorage.removeItem("pushSubscription");
        localStorage.removeItem("pushSubscriptionData");
        this.subscription = null;
      }
      return success;
    }

    return false;
  }

  async isSubscribed() {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      return false;
    }

    this.subscription = await this.registration.pushManager.getSubscription();
    return !!this.subscription;
  }

  async sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: btoa(
                  String.fromCharCode(
                    ...new Uint8Array(subscription.getKey("p256dh"))
                  )
                ),
                auth: btoa(
                  String.fromCharCode(
                    ...new Uint8Array(subscription.getKey("auth"))
                  )
                ),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send subscription to server");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error removing subscription from server:", error);
      // Don't throw, just log
    }
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
}

export default new PushNotificationService();

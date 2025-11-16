import pushNotificationService from "../../utils/push-notification";

export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>About Stories Map</h1>
        <p>Stories Map is an interactive web application that allows users to share their experiences and stories from around the world. The application combines the power of storytelling with geographic visualization to create a unique platform for cultural exchange.</p>
        
        <div class="notification-settings">
          <h2>Push Notification Settings</h2>
          <div class="notification-toggle">
            <label for="notification-toggle">
              <input type="checkbox" id="notification-toggle" aria-label="Enable push notifications">
              <span>Aktifkan Notifikasi</span>
            </label>
            <p class="notification-status" id="notification-status">Memeriksa status...</p>
          </div>
        </div>
        
        <div class="features">
          <div class="feature-card">
            <h3>🗺️ Interactive Map</h3>
            <p>Explore stories from different locations around the globe using our interactive map interface powered by Leaflet.js.</p>
          </div>
          
          <div class="feature-card">
            <h3>📸 Photo Sharing</h3>
            <p>Share your experiences with high-quality photos that are displayed both in the story list and on the map.</p>
          </div>
          
          <div class="feature-card">
            <h3>🔒 Secure Authentication</h3>
            <p>Protect your account with our secure authentication system that keeps your data safe.</p>
          </div>
          
          <div class="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Enjoy a seamless experience across all devices, from mobile phones to desktop computers.</p>
          </div>
          
          <div class="feature-card">
            <h3>📴 Offline Support</h3>
            <p>Access your stories even when offline. Data is cached and synced automatically when you're back online.</p>
          </div>
          
          <div class="feature-card">
            <h3>🔔 Push Notifications</h3>
            <p>Get notified when new stories are added. Enable notifications in the settings above.</p>
          </div>
        </div>
        
        <h2>How It Works</h2>
        <ol>
          <li>Create an account or login to access all features</li>
          <li>Click on the map to select a location for your story</li>
          <li>Upload a photo and write a description of your experience</li>
          <li>Share your story with the world!</li>
        </ol>
        
        <div class="cta-section">
          <a href="#/register" class="btn btn-primary">Get Started</a>
          <a href="#/map" class="btn btn-secondary">Explore Stories</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Initialize notification toggle
    await this.setupNotificationToggle();
  }

  async setupNotificationToggle() {
    const toggle = document.getElementById("notification-toggle");
    const statusEl = document.getElementById("notification-status");

    if (!toggle || !statusEl) return;

    try {
      // Check current subscription status
      const isSubscribed = await pushNotificationService.isSubscribed();
      toggle.checked = isSubscribed;
      statusEl.textContent = isSubscribed
        ? "Notifikasi aktif"
        : "Notifikasi tidak aktif";

      // Handle toggle change
      toggle.addEventListener("change", async (e) => {
        const checked = e.target.checked;
        statusEl.textContent = "Memproses...";

        try {
          if (checked) {
            // Request permission first
            const hasPermission =
              await pushNotificationService.requestPermission();

            if (!hasPermission) {
              toggle.checked = false;
              statusEl.textContent = "Izin notifikasi ditolak";
              return;
            }

            // Subscribe
            await pushNotificationService.subscribe();
            statusEl.textContent = "Notifikasi berhasil diaktifkan";
          } else {
            // Unsubscribe
            await pushNotificationService.unsubscribe();
            statusEl.textContent = "Notifikasi berhasil dinonaktifkan";
          }
        } catch (error) {
          console.error("Error toggling notification:", error);
          toggle.checked = !checked;
          statusEl.textContent = `Error: ${error.message}`;
        }
      });
    } catch (error) {
      console.error("Error setting up notification toggle:", error);
      statusEl.textContent = "Notifikasi tidak didukung di browser ini";
      toggle.disabled = true;
    }
  }
}

import { getStories } from "../../data/api.js";
import indexedDBService from "../../utils/indexeddb";

export default class MapPage {
  async render() {
    return `
      <section class="map-container">
        <h1>Stories Map</h1>
        <div class="map-toolbar" aria-label="Map controls">
          <label for="filter-input">Filter deskripsi:</label>
          <input id="filter-input" type="text" placeholder="Ketik untuk filter" aria-describedby="filter-help" />
          <small id="filter-help">Filter daftar dan marker berdasarkan deskripsi.</small>
        </div>
        <div id="map" class="map-view"></div>
        <div id="stories-list" class="stories-list"></div>
      </section>
    `;
  }

  async afterRender() {
    // Load map library
    await this.loadLeaflet();

    // Initialize map
    this.initMap();

    // Load stories
    await this.loadStories();
  }

  loadLeaflet() {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (window.L) {
        resolve();
        return;
      }

      // Create link element for Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Create script element for Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  initMap() {
    // Wait for Leaflet to be loaded
    const checkLeaflet = setInterval(() => {
      if (window.L) {
        clearInterval(checkLeaflet);

        // Initialize the map
        const map = L.map("map").setView([0, 0], 2);

        // Base tile layers
        const osm = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          }
        );
        const hot = L.tileLayer(
          "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors, HOT",
          }
        );

        // Add default layer and layer control
        osm.addTo(map);
        const baseLayers = {
          OpenStreetMap: osm,
          "OSM HOT": hot,
        };
        L.control.layers(baseLayers, {}).addTo(map);

        // Store map instance
        this.map = map;

        // Add click event to get coordinates
        map.on("click", (e) => {
          // If we're in add story mode, update the form
          const latInput = document.getElementById("lat");
          const lonInput = document.getElementById("lon");

          if (latInput && lonInput) {
            latInput.value = e.latlng.lat;
            lonInput.value = e.latlng.lng;
          }
        });
      }
    }, 100);
  }

  async loadStories() {
    try {
      let stories = [];
      const isOnline = navigator.onLine;

      if (isOnline) {
        // Try to fetch from API
        try {
          const result = await getStories({ withLocation: true });

          if (!result.error && result.listStory) {
            stories = result.listStory;

            // Cache stories to IndexedDB
            for (const story of stories) {
              await indexedDBService.saveStory(story);
            }
          }
        } catch (error) {
          console.error("Error fetching from API:", error);
        }
      }

      // Load from IndexedDB (for offline or as fallback)
      const dbStories = await indexedDBService.getAllStories();

      // Merge: prefer API data, but include DB data if API failed
      if (stories.length === 0 && dbStories.length > 0) {
        stories = dbStories;
      } else if (stories.length > 0 && dbStories.length > 0) {
        // Merge and deduplicate
        const storyMap = new Map();
        [...dbStories, ...stories].forEach((story) => {
          storyMap.set(story.id, story);
        });
        stories = Array.from(storyMap.values());
      }

      // Filter stories with location
      stories = stories.filter((s) => s.lat && s.lon);

      this.stories = stories;
      this.displayStoriesList(stories);

      // Add markers to map
      this.addMarkersToMap(stories);

      // Hook up filter
      const filterInput = document.getElementById("filter-input");
      if (filterInput) {
        filterInput.addEventListener("input", async () => {
          const q = filterInput.value.toLowerCase();

          if (q.trim() === "") {
            this.displayStoriesList(this.stories);
            this.addMarkersToMap(this.stories);
          } else {
            // Use IndexedDB search for better performance
            const filtered = await indexedDBService.searchStories(q);
            const filteredWithLocation = filtered.filter((s) => s.lat && s.lon);
            this.displayStoriesList(filteredWithLocation);
            this.addMarkersToMap(filteredWithLocation);
          }
        });
      }

      // Add sort functionality
      this.setupSortControls();
    } catch (error) {
      console.error("Error loading stories:", error);
    }
  }

  setupSortControls() {
    const storiesList = document.getElementById("stories-list");
    if (!storiesList) return;

    // Add sort controls
    const sortControls = document.createElement("div");
    sortControls.className = "sort-controls";
    sortControls.innerHTML = `
      <label for="sort-select">Urutkan berdasarkan:</label>
      <select id="sort-select" aria-label="Sort stories">
        <option value="createdAt-desc">Terbaru</option>
        <option value="createdAt-asc">Terlama</option>
        <option value="name-asc">Nama A-Z</option>
        <option value="name-desc">Nama Z-A</option>
      </select>
    `;
    storiesList.insertBefore(sortControls, storiesList.firstChild);

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", async () => {
        const [sortBy, order] = sortSelect.value.split("-");
        const sorted = await indexedDBService.getStoriesSorted(sortBy, order);
        const sortedWithLocation = sorted.filter((s) => s.lat && s.lon);
        this.displayStoriesList(sortedWithLocation);
        this.addMarkersToMap(sortedWithLocation);
      });
    }
  }

  displayStoriesList(stories) {
    const storiesList = document.getElementById("stories-list");
    if (!storiesList) return;

    // Get sort controls if they exist
    const sortControls = storiesList.querySelector(".sort-controls");

    if (stories.length === 0) {
      storiesList.innerHTML = "<p>No stories found.</p>";
      if (sortControls) {
        storiesList.insertBefore(sortControls, storiesList.firstChild);
      }
      return;
    }

    storiesList.innerHTML = "";
    if (sortControls) {
      storiesList.appendChild(sortControls);
    }

    storiesList.innerHTML += `
      <h2>Stories List</h2>
      <div class="stories-grid">
        ${stories
          .map(
            (story) => `
          <article class="story-card" data-id="${
            story.id
          }" tabindex="0" aria-label="Story ${story.name}">
            <img src="${story.photoUrl}" alt="${
              story.description || "Story photo"
            }" loading="lazy">
            <div class="story-content">
              <p>${story.description || "No description"}</p>
              <small>By: ${story.name || "Unknown"}</small>
              <small>Created: ${new Date(
                story.createdAt
              ).toLocaleDateString()}</small>
              <small>Location: ${story.lat}, ${story.lon}</small>
              <button class="btn-delete-story" data-id="${
                story.id
              }" aria-label="Delete story ${story.id}">Hapus</button>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    // Sync list -> map: click or Enter focuses marker and opens popup
    storiesList.querySelectorAll(".story-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Don't trigger if clicking delete button
        if (!e.target.classList.contains("btn-delete-story")) {
          this.focusMarker(card.dataset.id);
        }
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.focusMarker(card.dataset.id);
        }
      });
    });

    // Add delete functionality
    storiesList.querySelectorAll(".btn-delete-story").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.id;

        if (confirm("Apakah Anda yakin ingin menghapus story ini?")) {
          try {
            await indexedDBService.deleteStory(storyId);

            // Remove from map
            if (this.markersById && this.markersById.has(storyId)) {
              this.markersLayer.removeLayer(this.markersById.get(storyId));
              this.markersById.delete(storyId);
            }

            // Reload stories list
            await this.loadStories();
          } catch (error) {
            console.error("Error deleting story:", error);
            alert("Gagal menghapus story");
          }
        }
      });
    });
  }

  addMarkersToMap(stories) {
    if (!this.map) return;

    // Clear existing markers
    if (this.markersLayer) {
      this.markersLayer.clearLayers();
    } else {
      this.markersLayer = L.layerGroup().addTo(this.map);
    }
    this.markersById = new Map();

    // Add markers for each story
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(
          this.markersLayer
        );
        marker.bindPopup(`
          <div class="map-popup">
            <img src="${story.photoUrl}" alt="${
          story.description || "Story photo"
        }" width="150">
            <p>${story.description || "No description"}</p>
            <small>Created: ${new Date(
              story.createdAt
            ).toLocaleDateString()}</small>
          </div>
        `);

        // Add click event to show story details
        marker.on("click", () => {
          // Highlight the corresponding story card
          document.querySelectorAll(".story-card").forEach((card) => {
            card.classList.remove("highlight");
            if (card.dataset.id === story.id) {
              card.classList.add("highlight");
              card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          });
        });

        this.markersById.set(story.id, marker);
      }
    });

    // Fit map to bounds if we have markers
    if (stories.some((s) => s.lat && s.lon)) {
      const bounds = stories
        .filter((s) => s.lat && s.lon)
        .map((s) => [s.lat, s.lon]);

      if (bounds.length > 0) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  focusMarker(id) {
    if (!this.markersById || !this.markersById.has(id)) return;
    const marker = this.markersById.get(id);
    marker.openPopup();
    const latLng = marker.getLatLng();
    this.map.setView(latLng, Math.max(this.map.getZoom(), 8), {
      animate: true,
    });
    document.querySelectorAll(".story-card").forEach((card) => {
      card.classList.toggle("highlight", card.dataset.id === id);
    });
  }
}

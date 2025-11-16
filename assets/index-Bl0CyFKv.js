var D=i=>{throw TypeError(i)};var T=(i,e,t)=>e.has(i)||D("Cannot "+t);var h=(i,e,t)=>(T(i,e,"read from private field"),t?t.call(i):e.get(i)),P=(i,e,t)=>e.has(i)?D("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t),C=(i,e,t,o)=>(T(i,e,"write to private field"),o?o.call(i,t):e.set(i,t),t),w=(i,e,t)=>(T(i,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const F="modulepreload",z=function(i){return"/tugas-proyek-kedua/"+i},M={},V=function(e,t,o){let r=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),a=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));r=Promise.allSettled(t.map(c=>{if(c=z(c),c in M)return;M[c]=!0;const l=c.endsWith(".css"),y=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${y}`))return;const b=document.createElement("link");if(b.rel=l?"stylesheet":F,l||(b.as="script"),b.crossOrigin="",b.href=c,a&&b.setAttribute("nonce",a),document.head.appendChild(b),l)return new Promise((k,u)=>{b.addEventListener("load",k),b.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(n){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=n,window.dispatchEvent(a),!a.defaultPrevented)throw n}return r.then(n=>{for(const a of n||[])a.status==="rejected"&&s(a.reason);return e().catch(s)})};class W{async render(){return`
      <section class="container">
        <h1>Welcome to Stories Map</h1>
        <p>Share your experiences and explore stories from around the world!</p>
        
        <div class="home-actions">
          <a href="#/map" class="btn btn-primary">View Stories Map</a>
          <a href="#/add-story" class="btn btn-secondary">Add Your Story</a>
        </div>
        
        <h2>Features</h2>
        <div class="features">
          <div class="feature-card">
            <h3>🌍 Explore Stories</h3>
            <p>Discover amazing stories from people around the globe on our interactive map.</p>
          </div>
          
          <div class="feature-card">
            <h3>📝 Share Your Experience</h3>
            <p>Contribute to our community by sharing your own stories with photos and locations.</p>
          </div>
          
          <div class="feature-card">
            <h3>🔒 Secure & Private</h3>
            <p>Your data is protected with secure authentication and privacy controls.</p>
          </div>
        </div>
      </section>
    `}async afterRender(){localStorage.getItem("token")||console.log("User not logged in")}}const S={BASE_URL:"https://story-api.dicoding.dev/v1"},H=`${S.BASE_URL}/notifications/vapid-public-key`;class K{constructor(){this.registration=null,this.subscription=null}async init(){if(!("serviceWorker"in navigator)||!("PushManager"in window))return console.warn("Push notifications are not supported"),!1;try{return this.registration=await navigator.serviceWorker.ready,!0}catch(e){return console.error("Service Worker registration failed:",e),!1}}async getVAPIDPublicKey(){try{const t=await(await fetch(H)).json();return t.publicKey||t.vapidPublicKey}catch(e){throw console.error("Error fetching VAPID public key:",e),e}}urlBase64ToUint8Array(e){const t="=".repeat((4-e.length%4)%4),o=(e+t).replace(/\-/g,"+").replace(/_/g,"/"),r=window.atob(o),s=new Uint8Array(r.length);for(let n=0;n<r.length;++n)s[n]=r.charCodeAt(n);return s}async subscribe(){if(this.registration||await this.init(),!this.registration)throw new Error("Service Worker not available");try{const e=await this.getVAPIDPublicKey(),t=this.urlBase64ToUint8Array(e);return this.subscription=await this.registration.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:t}),await this.sendSubscriptionToServer(this.subscription),localStorage.setItem("pushSubscription","subscribed"),localStorage.setItem("pushSubscriptionData",JSON.stringify({endpoint:this.subscription.endpoint,keys:{p256dh:btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey("p256dh")))),auth:btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey("auth"))))}})),this.subscription}catch(e){throw console.error("Error subscribing to push notifications:",e),e}}async unsubscribe(){if(this.subscription||this.registration&&(this.subscription=await this.registration.pushManager.getSubscription()),this.subscription){const e=await this.subscription.unsubscribe();return e&&(await this.removeSubscriptionFromServer(this.subscription),localStorage.removeItem("pushSubscription"),localStorage.removeItem("pushSubscriptionData"),this.subscription=null),e}return!1}async isSubscribed(){return this.registration||await this.init(),this.registration?(this.subscription=await this.registration.pushManager.getSubscription(),!!this.subscription):!1}async sendSubscriptionToServer(e){const t=localStorage.getItem("token");try{const o=await fetch(`${S.BASE_URL}/notifications/subscribe`,{method:"POST",headers:{"Content-Type":"application/json",...t?{Authorization:`Bearer ${t}`}:{}},body:JSON.stringify({subscription:{endpoint:e.endpoint,keys:{p256dh:btoa(String.fromCharCode(...new Uint8Array(e.getKey("p256dh")))),auth:btoa(String.fromCharCode(...new Uint8Array(e.getKey("auth"))))}}})});if(!o.ok)throw new Error("Failed to send subscription to server");return await o.json()}catch(o){throw console.error("Error sending subscription to server:",o),o}}async removeSubscriptionFromServer(e){const t=localStorage.getItem("token");try{return(await fetch(`${S.BASE_URL}/notifications/unsubscribe`,{method:"POST",headers:{"Content-Type":"application/json",...t?{Authorization:`Bearer ${t}`}:{}},body:JSON.stringify({endpoint:e.endpoint})})).ok}catch(o){console.error("Error removing subscription from server:",o)}}async requestPermission(){if(!("Notification"in window))throw new Error("This browser does not support notifications");return await Notification.requestPermission()==="granted"}}const A=new K;class G{async render(){return`
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
    `}async afterRender(){await this.setupNotificationToggle()}async setupNotificationToggle(){const e=document.getElementById("notification-toggle"),t=document.getElementById("notification-status");if(!(!e||!t))try{const o=await A.isSubscribed();e.checked=o,t.textContent=o?"Notifikasi aktif":"Notifikasi tidak aktif",e.addEventListener("change",async r=>{const s=r.target.checked;t.textContent="Memproses...";try{if(s){if(!await A.requestPermission()){e.checked=!1,t.textContent="Izin notifikasi ditolak";return}await A.subscribe(),t.textContent="Notifikasi berhasil diaktifkan"}else await A.unsubscribe(),t.textContent="Notifikasi berhasil dinonaktifkan"}catch(n){console.error("Error toggling notification:",n),e.checked=!s,t.textContent=`Error: ${n.message}`}})}catch(o){console.error("Error setting up notification toggle:",o),t.textContent="Notifikasi tidak didukung di browser ini",e.disabled=!0}}}const x={LIST:`${S.BASE_URL}/stories`,ADD:`${S.BASE_URL}/stories`,ADD_GUEST:`${S.BASE_URL}/stories/guest`,REGISTER:`${S.BASE_URL}/register`,LOGIN:`${S.BASE_URL}/login`};async function O({page:i=1,size:e=30,withLocation:t=!0}={}){const o=localStorage.getItem("token"),r=new URLSearchParams;return r.set("page",i),r.set("size",e),t&&r.set("location",1),await(await fetch(`${x.LIST}?${r.toString()}`,{headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{}}})).json()}async function N({description:i,photo:e,lat:t,lon:o}){const r=new FormData;r.append("description",i),r.append("photo",e),r.append("lat",t),r.append("lon",o);const s=localStorage.getItem("token"),n=s?x.ADD:x.ADD_GUEST;return await(await fetch(n,{method:"POST",headers:{...s?{Authorization:`Bearer ${s}`}:{}},body:r})).json()}async function R({name:i,email:e,password:t}){return await(await fetch(x.REGISTER,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:i,email:e,password:t})})).json()}async function q({email:i,password:e}){return await(await fetch(x.LOGIN,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:i,password:e})})).json()}const J=Object.freeze(Object.defineProperty({__proto__:null,addStory:N,getStories:O,loginUser:q,registerUser:R},Symbol.toStringTag,{value:"Module"}));class Q{async render(){return`
      <section class="auth-container">
        <div class="auth-card">
          <h1>Login</h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required aria-describedby="email-error">
              <span id="email-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required aria-describedby="password-error">
              <span id="password-error" class="error-message" role="alert"></span>
            </div>
            
            <button type="submit" class="btn btn-primary">Login</button>
          </form>
          <p>Don't have an account? <a href="#/register">Register here</a></p>
        </div>
      </section>
    `}async afterRender(){const e=document.getElementById("login-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();const o=document.getElementById("email").value,r=document.getElementById("password").value;try{const s=await q({email:o,password:r});if(s.error){s.message.includes("email")?document.getElementById("email-error").textContent=s.message:s.message.includes("password")?document.getElementById("password-error").textContent=s.message:alert(s.message);return}localStorage.setItem("token",s.loginResult.token),window.location.hash="#/"}catch(s){console.error("Login error:",s),alert("An error occurred during login. Please try again.")}})}}class Y{async render(){return`
      <section class="auth-container">
        <div class="auth-card">
          <h1>Register</h1>
          <form id="register-form">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required aria-describedby="name-error">
              <span id="name-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required aria-describedby="email-error">
              <span id="email-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required aria-describedby="password-error">
              <span id="password-error" class="error-message" role="alert"></span>
            </div>
            
            <button type="submit" class="btn btn-primary">Register</button>
          </form>
          <p>Already have an account? <a href="#/login">Login here</a></p>
        </div>
      </section>
    `}async afterRender(){const e=document.getElementById("register-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();const o=document.getElementById("name").value,r=document.getElementById("email").value,s=document.getElementById("password").value;try{const n=await R({name:o,email:r,password:s});if(n.error){n.message.includes("name")?document.getElementById("name-error").textContent=n.message:n.message.includes("email")?document.getElementById("email-error").textContent=n.message:n.message.includes("password")?document.getElementById("password-error").textContent=n.message:alert(n.message);return}alert("Registration successful! Please login."),window.location.hash="#/login"}catch(n){console.error("Registration error:",n),alert("An error occurred during registration. Please try again.")}})}}const Z="StoryMapsDB",X=1,m="stories",f="syncQueue";class ee{constructor(){this.db=null}async init(){return new Promise((e,t)=>{const o=indexedDB.open(Z,X);o.onerror=()=>t(o.error),o.onsuccess=()=>{this.db=o.result,e(this.db)},o.onupgradeneeded=r=>{const s=r.target.result;if(!s.objectStoreNames.contains(m)){const n=s.createObjectStore(m,{keyPath:"id"});n.createIndex("createdAt","createdAt",{unique:!1}),n.createIndex("name","name",{unique:!1})}if(!s.objectStoreNames.contains(f)){const n=s.createObjectStore(f,{keyPath:"id",autoIncrement:!0});n.createIndex("type","type",{unique:!1}),n.createIndex("status","status",{unique:!1})}}})}async saveStory(e){return this.db||await this.init(),new Promise((t,o)=>{const n=this.db.transaction([m],"readwrite").objectStore(m).put({...e,synced:!0,savedAt:new Date().toISOString()});n.onsuccess=()=>t(n.result),n.onerror=()=>o(n.error)})}async getAllStories(){return this.db||await this.init(),new Promise((e,t)=>{const s=this.db.transaction([m],"readonly").objectStore(m).getAll();s.onsuccess=()=>e(s.result||[]),s.onerror=()=>t(s.error)})}async getStoryById(e){return this.db||await this.init(),new Promise((t,o)=>{const n=this.db.transaction([m],"readonly").objectStore(m).get(e);n.onsuccess=()=>t(n.result),n.onerror=()=>o(n.error)})}async searchStories(e){this.db||await this.init();const t=await this.getAllStories(),o=e.toLowerCase();return t.filter(r=>(r.description||"").toLowerCase().includes(o)||(r.name||"").toLowerCase().includes(o))}async getStoriesSorted(e="createdAt",t="desc"){return this.db||await this.init(),(await this.getAllStories()).sort((r,s)=>{const n=r[e]||"",a=s[e]||"";return t==="desc"?a>n?1:-1:n>a?1:-1})}async deleteStory(e){return this.db||await this.init(),new Promise((t,o)=>{const n=this.db.transaction([m],"readwrite").objectStore(m).delete(e);n.onsuccess=()=>t(),n.onerror=()=>o(n.error)})}async addToSyncQueue(e,t="add"){return this.db||await this.init(),new Promise((o,r)=>{const a=this.db.transaction([f],"readwrite").objectStore(f).add({type:t,data:e,status:"pending",createdAt:new Date().toISOString()});a.onsuccess=()=>o(a.result),a.onerror=()=>r(a.error)})}async getPendingSyncItems(){return this.db||await this.init(),new Promise((e,t)=>{const n=this.db.transaction([f],"readonly").objectStore(f).index("status").getAll("pending");n.onsuccess=()=>e(n.result||[]),n.onerror=()=>t(n.error)})}async updateSyncItemStatus(e,t){return this.db||await this.init(),new Promise((o,r)=>{const n=this.db.transaction([f],"readwrite").objectStore(f),a=n.get(e);a.onsuccess=()=>{const c=a.result;if(c){c.status=t;const l=n.put(c);l.onsuccess=()=>o(),l.onerror=()=>r(l.error)}else o()},a.onerror=()=>r(a.error)})}async removeSyncItem(e){return this.db||await this.init(),new Promise((t,o)=>{const n=this.db.transaction([f],"readwrite").objectStore(f).delete(e);n.onsuccess=()=>t(),n.onerror=()=>o(n.error)})}async clearAllStories(){return this.db||await this.init(),new Promise((e,t)=>{const s=this.db.transaction([m],"readwrite").objectStore(m).clear();s.onsuccess=()=>e(),s.onerror=()=>t(s.error)})}}const d=new ee;class te{async render(){return`
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
    `}async afterRender(){await this.loadLeaflet(),this.initMap(),await this.loadStories()}loadLeaflet(){return new Promise((e,t)=>{if(window.L){e();return}const o=document.createElement("link");o.rel="stylesheet",o.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",document.head.appendChild(o);const r=document.createElement("script");r.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",r.onload=e,r.onerror=t,document.body.appendChild(r)})}initMap(){const e=setInterval(()=>{if(window.L){clearInterval(e);const t=L.map("map").setView([0,0],2),o=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}),r=L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors, HOT"});o.addTo(t);const s={OpenStreetMap:o,"OSM HOT":r};L.control.layers(s,{}).addTo(t),this.map=t,t.on("click",n=>{const a=document.getElementById("lat"),c=document.getElementById("lon");a&&c&&(a.value=n.latlng.lat,c.value=n.latlng.lng)})}},100)}async loadStories(){try{let e=[];if(navigator.onLine)try{const s=await O({withLocation:!0});if(!s.error&&s.listStory){e=s.listStory;for(const n of e)await d.saveStory(n)}}catch(s){console.error("Error fetching from API:",s)}const o=await d.getAllStories();if(e.length===0&&o.length>0)e=o;else if(e.length>0&&o.length>0){const s=new Map;[...o,...e].forEach(n=>{s.set(n.id,n)}),e=Array.from(s.values())}e=e.filter(s=>s.lat&&s.lon),this.stories=e,this.displayStoriesList(e),this.addMarkersToMap(e);const r=document.getElementById("filter-input");r&&r.addEventListener("input",async()=>{const s=r.value.toLowerCase();if(s.trim()==="")this.displayStoriesList(this.stories),this.addMarkersToMap(this.stories);else{const a=(await d.searchStories(s)).filter(c=>c.lat&&c.lon);this.displayStoriesList(a),this.addMarkersToMap(a)}}),this.setupSortControls()}catch(e){console.error("Error loading stories:",e)}}setupSortControls(){const e=document.getElementById("stories-list");if(!e)return;const t=document.createElement("div");t.className="sort-controls",t.innerHTML=`
      <label for="sort-select">Urutkan berdasarkan:</label>
      <select id="sort-select" aria-label="Sort stories">
        <option value="createdAt-desc">Terbaru</option>
        <option value="createdAt-asc">Terlama</option>
        <option value="name-asc">Nama A-Z</option>
        <option value="name-desc">Nama Z-A</option>
      </select>
    `,e.insertBefore(t,e.firstChild);const o=document.getElementById("sort-select");o&&o.addEventListener("change",async()=>{const[r,s]=o.value.split("-"),a=(await d.getStoriesSorted(r,s)).filter(c=>c.lat&&c.lon);this.displayStoriesList(a),this.addMarkersToMap(a)})}displayStoriesList(e){const t=document.getElementById("stories-list");if(!t)return;const o=t.querySelector(".sort-controls");if(e.length===0){t.innerHTML="<p>No stories found.</p>",o&&t.insertBefore(o,t.firstChild);return}t.innerHTML="",o&&t.appendChild(o),t.innerHTML+=`
      <h2>Stories List</h2>
      <div class="stories-grid">
        ${e.map(r=>`
          <article class="story-card" data-id="${r.id}" tabindex="0" aria-label="Story ${r.name}">
            <img src="${r.photoUrl}" alt="${r.description||"Story photo"}" loading="lazy">
            <div class="story-content">
              <p>${r.description||"No description"}</p>
              <small>By: ${r.name||"Unknown"}</small>
              <small>Created: ${new Date(r.createdAt).toLocaleDateString()}</small>
              <small>Location: ${r.lat}, ${r.lon}</small>
              <button class="btn-delete-story" data-id="${r.id}" aria-label="Delete story ${r.id}">Hapus</button>
            </div>
          </article>
        `).join("")}
      </div>
    `,t.querySelectorAll(".story-card").forEach(r=>{r.addEventListener("click",s=>{s.target.classList.contains("btn-delete-story")||this.focusMarker(r.dataset.id)}),r.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),this.focusMarker(r.dataset.id))})}),t.querySelectorAll(".btn-delete-story").forEach(r=>{r.addEventListener("click",async s=>{s.stopPropagation();const n=r.dataset.id;if(confirm("Apakah Anda yakin ingin menghapus story ini?"))try{await d.deleteStory(n),this.markersById&&this.markersById.has(n)&&(this.markersLayer.removeLayer(this.markersById.get(n)),this.markersById.delete(n)),await this.loadStories()}catch(a){console.error("Error deleting story:",a),alert("Gagal menghapus story")}})})}addMarkersToMap(e){if(this.map&&(this.markersLayer?this.markersLayer.clearLayers():this.markersLayer=L.layerGroup().addTo(this.map),this.markersById=new Map,e.forEach(t=>{if(t.lat&&t.lon){const o=L.marker([t.lat,t.lon]).addTo(this.markersLayer);o.bindPopup(`
          <div class="map-popup">
            <img src="${t.photoUrl}" alt="${t.description||"Story photo"}" width="150">
            <p>${t.description||"No description"}</p>
            <small>Created: ${new Date(t.createdAt).toLocaleDateString()}</small>
          </div>
        `),o.on("click",()=>{document.querySelectorAll(".story-card").forEach(r=>{r.classList.remove("highlight"),r.dataset.id===t.id&&(r.classList.add("highlight"),r.scrollIntoView({behavior:"smooth",block:"nearest"}))})}),this.markersById.set(t.id,o)}}),e.some(t=>t.lat&&t.lon))){const t=e.filter(o=>o.lat&&o.lon).map(o=>[o.lat,o.lon]);t.length>0&&this.map.fitBounds(t,{padding:[50,50]})}}focusMarker(e){if(!this.markersById||!this.markersById.has(e))return;const t=this.markersById.get(e);t.openPopup();const o=t.getLatLng();this.map.setView(o,Math.max(this.map.getZoom(),8),{animate:!0}),document.querySelectorAll(".story-card").forEach(r=>{r.classList.toggle("highlight",r.dataset.id===e)})}}class re{async render(){return`
      <section class="add-story-container">
        <div class="add-story-card">
          <h1>Add New Story</h1>
          <form id="add-story-form">
            <div class="form-group">
              <label for="description">Description:</label>
              <textarea id="description" name="description" required aria-describedby="description-error"></textarea>
              <span id="description-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="photo">Photo:</label>
              <input type="file" id="photo" name="photo" accept="image/*" required aria-describedby="photo-error">
              <span id="photo-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="lat">Latitude:</label>
              <input type="number" id="lat" name="lat" step="any" required aria-describedby="lat-error">
              <span id="lat-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="lon">Longitude:</label>
              <input type="number" id="lon" name="lon" step="any" required aria-describedby="lon-error">
              <span id="lon-error" class="error-message" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label>Select Location on Map:</label>
              <div id="map" class="map-view" style="height: 300px;"></div>
              <p>Click on the map to select location coordinates</p>
            </div>
            
            <button type="submit" class="btn btn-primary">Add Story</button>
            <div id="submit-status" class="error-message" aria-live="polite"></div>
          </form>
        </div>
      </section>
    `}async afterRender(){await this.loadLeaflet(),this.initMap();const e=document.getElementById("add-story-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();const o=document.getElementById("description"),r=document.getElementById("photo");document.getElementById("lat"),document.getElementById("lon");const s=document.getElementById("submit-status");["description","photo","lat","lon"].forEach(k=>{const u=document.getElementById(`${k}-error`);u&&(u.textContent="")}),s.textContent="";const n=o.value.trim(),a=r.files[0],c=parseFloat(document.getElementById("lat").value),l=parseFloat(document.getElementById("lon").value);let y=!1;if(n||(document.getElementById("description-error").textContent="Deskripsi wajib diisi",y=!0),a?(a.type.startsWith("image/")||(document.getElementById("photo-error").textContent="File harus berupa gambar",y=!0),a.size>1024*1024&&(document.getElementById("photo-error").textContent="Ukuran gambar maksimal 1MB",y=!0)):(document.getElementById("photo-error").textContent="Foto wajib diunggah",y=!0),isNaN(c)&&(document.getElementById("lat-error").textContent="Pilih lokasi pada peta",y=!0),isNaN(l)&&(document.getElementById("lon-error").textContent="Pilih lokasi pada peta",y=!0),y)return;localStorage.getItem("token")||(s.textContent="Mengirim sebagai tamu (tanpa autentikasi).");try{const k=navigator.onLine;let u;if(k)try{if(u=await N({description:n,photo:a,lat:c,lon:l}),u.error)throw new Error(u.message);u.story&&await d.saveStory(u.story),s.textContent="Story berhasil ditambahkan!",window.location.hash="#/map"}catch(E){throw console.error("API error:",E),E}else{const E=await this.fileToBase64(a),_={id:`offline-${Date.now()}`,description:n,photoUrl:E,lat:c,lon:l,name:localStorage.getItem("userName")||"Guest",createdAt:new Date().toISOString(),synced:!1};await d.saveStory(_),await d.addToSyncQueue({description:n,photo:a,lat:c,lon:l},"add"),s.textContent="Story disimpan secara offline. Akan disinkronkan saat online.",window.location.hash="#/map"}}catch(k){console.error("Error adding story:",k);try{const u=await this.fileToBase64(a),E={id:`offline-${Date.now()}`,description:n,photoUrl:u,lat:c,lon:l,name:localStorage.getItem("userName")||"Guest",createdAt:new Date().toISOString(),synced:!1};await d.saveStory(E),await d.addToSyncQueue({description:n,photo:a,lat:c,lon:l},"add"),s.textContent="Story disimpan secara offline. Akan disinkronkan saat online.",window.location.hash="#/map"}catch(u){console.error("Offline save error:",u),s.textContent="Terjadi kesalahan saat menambah story. Coba lagi."}}})}loadLeaflet(){return new Promise((e,t)=>{if(window.L){e();return}const o=document.createElement("link");o.rel="stylesheet",o.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",document.head.appendChild(o);const r=document.createElement("script");r.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",r.onload=e,r.onerror=t,document.body.appendChild(r)})}initMap(){const e=setInterval(()=>{if(window.L){clearInterval(e);const t=L.map("map").setView([0,0],2),o=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}),r=L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors, HOT"});o.addTo(t),L.control.layers({OpenStreetMap:o,"OSM HOT":r},{}).addTo(t),this.map=t,t.on("click",s=>{const n=document.getElementById("lat"),a=document.getElementById("lon");n&&a&&(n.value=s.latlng.lat.toFixed(6),a.value=s.latlng.lng.toFixed(6),this.marker?this.marker.setLatLng(s.latlng):(this.marker=L.marker(s.latlng,{draggable:!0}).addTo(t),this.marker.on("dragend",c=>{const l=c.target.getLatLng();n.value=l.lat.toFixed(6),a.value=l.lng.toFixed(6)})))})}},100)}fileToBase64(e){return new Promise((t,o)=>{const r=new FileReader;r.onload=()=>t(r.result),r.onerror=o,r.readAsDataURL(e)})}}const oe={"/":new W,"/about":new G,"/login":new Q,"/register":new Y,"/map":new te,"/add-story":new re};function se(i){const e=i.split("/");return{resource:e[1]||null,id:e[2]||null}}function ne(i){let e="";return i.resource&&(e=e.concat(`/${i.resource}`)),i.id&&(e=e.concat("/:id")),e||"/"}function ie(){return location.hash.replace("#","")||"/"}function ae(){const i=ie(),e=se(i);return ne(e)}var B,v,g,p,$,U,I,j;class ce{constructor({navigationDrawer:e,drawerButton:t,content:o}){P(this,p);P(this,B,null);P(this,v,null);P(this,g,null);C(this,B,o),C(this,v,t),C(this,g,e),w(this,p,$).call(this),w(this,p,U).call(this)}async renderPage(){const e=ae(),t=oe[e];if(w(this,p,j).call(this,e)&&!localStorage.getItem("token")){window.location.hash="#/login";return}document.startViewTransition?await document.startViewTransition(async()=>{h(this,B).innerHTML=await t.render(),await t.afterRender(),w(this,p,I).call(this)}).ready:(h(this,B).innerHTML=await t.render(),await t.afterRender(),w(this,p,I).call(this))}}B=new WeakMap,v=new WeakMap,g=new WeakMap,p=new WeakSet,$=function(){h(this,v).addEventListener("click",()=>{h(this,g).classList.toggle("open");const e=h(this,g).classList.contains("open");h(this,v).setAttribute("aria-expanded",e?"true":"false")}),document.body.addEventListener("click",e=>{!h(this,g).contains(e.target)&&!h(this,v).contains(e.target)&&h(this,g).classList.remove("open"),h(this,g).querySelectorAll("a").forEach(t=>{t.contains(e.target)&&(h(this,g).classList.remove("open"),h(this,v).setAttribute("aria-expanded","false"))})})},U=function(){w(this,p,I).call(this),window.addEventListener("storage",e=>{e.key==="token"&&w(this,p,I).call(this)})},I=function(){const e=document.getElementById("auth-links"),t=localStorage.getItem("token");if(e)if(t){e.innerHTML='<a href="#/" id="logout-link">Logout</a>';const o=document.getElementById("logout-link");o&&o.addEventListener("click",r=>{r.preventDefault(),localStorage.removeItem("token"),w(this,p,I).call(this),window.location.hash="#/"})}else e.innerHTML=`
          <a href="#/login">Login</a>
          <a href="#/register">Register</a>
        `},j=function(e){return["/add-story","/map"].includes(e)};"serviceWorker"in navigator&&window.addEventListener("load",async()=>{try{const i=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",i),i.addEventListener("updatefound",()=>{const e=i.installing;e.addEventListener("statechange",()=>{e.state==="installed"&&navigator.serviceWorker.controller&&console.log("New service worker available")})})}catch(i){console.error("Service Worker registration failed:",i)}});document.addEventListener("DOMContentLoaded",async()=>{try{await d.init(),console.log("IndexedDB initialized")}catch(e){console.error("IndexedDB initialization failed:",e)}try{await A.init(),await A.isSubscribed()&&console.log("Push notification already subscribed")}catch(e){console.error("Push notification initialization failed:",e)}const i=new ce({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")});await i.renderPage(),window.addEventListener("hashchange",async()=>{await i.renderPage()}),window.addEventListener("online",async()=>{console.log("Device is online, syncing data..."),await le()})});async function le(){try{const i=await d.getPendingSyncItems();if(i.length===0)return;console.log(`Syncing ${i.length} pending items...`);for(const e of i)try{if(e.type==="add"){const{addStory:t}=await V(async()=>{const{addStory:s}=await Promise.resolve().then(()=>J);return{addStory:s}},void 0),o={...e.data};if(!(o.photo instanceof File)){console.warn("Photo file not available for sync");const s=await d.getStoryById(`offline-${e.id}`);if(s&&s.photoUrl){const a=await(await fetch(s.photoUrl)).blob();o.photo=new File([a],"photo.jpg",{type:a.type})}else{await d.updateSyncItemStatus(e.id,"needs_manual_sync");continue}}const r=await t(o);!r.error&&r.story?(await d.saveStory(r.story),await d.removeSyncItem(e.id),console.log("Story synced successfully:",r.story.id)):(console.error("Sync failed:",r.message),await d.updateSyncItemStatus(e.id,"failed"))}}catch(t){console.error("Error syncing item:",t),await d.updateSyncItemStatus(e.id,"failed")}}catch(i){console.error("Error during sync:",i)}}

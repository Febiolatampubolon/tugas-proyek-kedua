export default class HomePage {
  async render() {
    return `
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
    `;
  }

  async afterRender() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Optionally redirect to login or show a message
      console.log('User not logged in');
    }
  }
}

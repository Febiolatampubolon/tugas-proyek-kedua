import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuthNavigation();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
      const expanded = this.#navigationDrawer.classList.contains('open');
      this.#drawerButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  #setupAuthNavigation() {
    // Update navigation based on auth status
    this.#updateAuthLinks();
    
    // Listen for storage changes to update auth status
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        this.#updateAuthLinks();
      }
    });
  }

  #updateAuthLinks() {
    const authLinks = document.getElementById('auth-links');
    const token = localStorage.getItem('token');
    
    if (authLinks) {
      if (token) {
        // User is logged in, show logout option
        authLinks.innerHTML = `<a href="#/" id="logout-link">Logout</a>`;
        
        // Add logout event listener
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            this.#updateAuthLinks();
            window.location.hash = '#/';
          });
        }
      } else {
        // User is not logged in, show login/register options
        authLinks.innerHTML = `
          <a href="#/login">Login</a>
          <a href="#/register">Register</a>
        `;
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Check if page requires authentication
    if (this.#requiresAuth(url) && !localStorage.getItem('token')) {
      // Redirect to login page
      window.location.hash = '#/login';
      return;
    }

    // Use View Transition API if available
    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        
        // Update auth links after page render
        this.#updateAuthLinks();
      });
      
      await transition.ready;
    } else {
      // Fallback for browsers that don't support View Transition API
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      
      // Update auth links after page render
      this.#updateAuthLinks();
    }
  }

  #requiresAuth(url) {
    const protectedRoutes = ['/add-story', '/map'];
    return protectedRoutes.includes(url);
  }
}

export default App;
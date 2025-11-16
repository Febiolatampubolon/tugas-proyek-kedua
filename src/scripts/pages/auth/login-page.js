import { loginUser } from '../../data/api.js';

export default class LoginPage {
  async render() {
    return `
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
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const result = await loginUser({ email, password });
          
          if (result.error) {
            // Display error messages
            if (result.message.includes('email')) {
              document.getElementById('email-error').textContent = result.message;
            } else if (result.message.includes('password')) {
              document.getElementById('password-error').textContent = result.message;
            } else {
              alert(result.message);
            }
            return;
          }
          
          // Store token in localStorage
          localStorage.setItem('token', result.loginResult.token);
          
          // Redirect to home page
          window.location.hash = '#/';
        } catch (error) {
          console.error('Login error:', error);
          alert('An error occurred during login. Please try again.');
        }
      });
    }
  }
}
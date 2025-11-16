import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
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
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const result = await registerUser({ name, email, password });
          
          if (result.error) {
            // Display error messages
            if (result.message.includes('name')) {
              document.getElementById('name-error').textContent = result.message;
            } else if (result.message.includes('email')) {
              document.getElementById('email-error').textContent = result.message;
            } else if (result.message.includes('password')) {
              document.getElementById('password-error').textContent = result.message;
            } else {
              alert(result.message);
            }
            return;
          }
          
          // Show success message and redirect to login
          alert('Registration successful! Please login.');
          window.location.hash = '#/login';
        } catch (error) {
          console.error('Registration error:', error);
          alert('An error occurred during registration. Please try again.');
        }
      });
    }
  }
}
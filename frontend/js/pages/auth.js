// API Base URL
const API_BASE_URL = 'https://rcvj-company.onrender.com/api';/* 'http://localhost:3000/api'; 
 */
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkRedirectParams();
    }

    setupEventListeners() {
        // Login form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Password toggle
        document.getElementById('password-toggle').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Enter key in form fields
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Input validation on blur
        document.getElementById('username').addEventListener('blur', () => {
            this.validateUsername();
        });

        document.getElementById('password').addEventListener('blur', () => {
            this.validatePassword();
        });
    }

    checkRedirectParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const jobId = urlParams.get('jobId');

        if (redirect === 'apply' && jobId) {
            this.showMessage('Please login to apply for this job.', 'info');
        }
    }

    async handleLogin() {
        if (!this.validateForm()) {
            return;
        }

        const formData = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };

        this.setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Login successful
            this.handleLoginSuccess(data);

        } catch (error) {
            this.handleLoginError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    handleLoginSuccess(data) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        // Show success message
        this.showSuccessModal();

        // Redirect to admin dashboard after delay
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
    }

    handleLoginError(errorMessage) {
        this.showMessage(errorMessage, 'error');
        
        // Shake animation for error
        const form = document.getElementById('login-form');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }

    validateForm() {
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();

        return isUsernameValid && isPasswordValid;
    }

    validateUsername() {
        const username = document.getElementById('username').value.trim();
        const errorElement = document.getElementById('username-error');
        const inputGroup = document.getElementById('username').closest('.input-group');

        if (!username) {
            this.showFieldError(errorElement, inputGroup, 'Username is required');
            return false;
        }

        if (username.length < 3) {
            this.showFieldError(errorElement, inputGroup, 'Username must be at least 3 characters');
            return false;
        }

        this.clearFieldError(errorElement, inputGroup);
        return true;
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('password-error');
        const inputGroup = document.getElementById('password').closest('.input-group');

        if (!password) {
            this.showFieldError(errorElement, inputGroup, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showFieldError(errorElement, inputGroup, 'Password must be at least 6 characters');
            return false;
        }

        this.clearFieldError(errorElement, inputGroup);
        return true;
    }

    showFieldError(errorElement, inputGroup, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputGroup.classList.add('error');
    }

    clearFieldError(errorElement, inputGroup) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        inputGroup.classList.remove('error');
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('password-toggle');
        const icon = toggleButton.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    setLoading(loading) {
        const button = document.getElementById('login-btn');
        const buttonText = button.querySelector('.btn-text');
        const buttonLoading = button.querySelector('.btn-loading');

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'block';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            buttonText.style.display = 'block';
            buttonLoading.style.display = 'none';
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.add('show');

        // Add some celebratory effects
        this.createConfetti();
    }

    createConfetti() {
        // Simple confetti effect - using direct color values instead of CSS variables
        const colors = ['#e67415', '#291571', '#27ae60', '#e74c3c'];
        const container = document.querySelector('.auth-card');
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                top: 50%;
                left: 50%;
                opacity: 0.8;
                pointer-events: none;
            `;
            
            container.appendChild(confetti);
            
            // Animate confetti
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;
            
            confetti.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            }).onfinish = () => confetti.remove();
        }
    }

    showMessage(message, type = 'error') {
        // Remove existing message
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        const backgroundColor = type === 'error' ? '#e74c3c' : '#3498db';
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// CSS for shake animation and messages
const additionalStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize auth manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
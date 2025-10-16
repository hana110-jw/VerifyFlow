// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnSpinner = document.getElementById('loginBtnSpinner');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Please enter username and password');
            return;
        }

        await login(username, password);
    });

    async function login(username, password) {
        // Show loading state
        loginBtn.disabled = true;
        loginBtnText.style.display = 'none';
        loginBtnSpinner.style.display = 'block';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save auth data
            Auth.saveAuth(data.token, data.user);

            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please try again.');
            
            // Reset button state
            loginBtn.disabled = false;
            loginBtnText.style.display = 'block';
            loginBtnSpinner.style.display = 'none';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

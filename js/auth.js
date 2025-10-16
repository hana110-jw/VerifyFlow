// Authentication utilities
const Auth = {
    // Get token from localStorage
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    // Get user from localStorage
    getUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save auth data
    saveAuth(token, user) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    // Clear auth data
    clearAuth() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    // Logout
    logout() {
        this.clearAuth();
        window.location.href = 'index.html';
    },

    // Make authenticated API request
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle unauthorized
        if (response.status === 401 || response.status === 403) {
            this.clearAuth();
            window.location.href = 'login.html';
            throw new Error('Unauthorized');
        }

        return response;
    }
};

// Update navigation based on auth state
function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLink = document.getElementById('adminLink');

    if (Auth.isLoggedIn()) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        if (Auth.isAdmin() && adminLink) {
            adminLink.style.display = 'block';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Setup logout button
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupLogout();
});

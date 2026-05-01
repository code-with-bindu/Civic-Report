import axios from 'axios';

/**
 * Axios instance pre-configured with base URL.
 * Automatically attaches JWT token from localStorage if available.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor — inject Authorization header
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401s globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            // Only redirect if not already on auth pages
            if (
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')
            ) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

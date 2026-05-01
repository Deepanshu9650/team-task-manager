import axios from 'axios';

const api = axios.create({
    // It will look for the live URL first, and fall back to localhost if it's not found
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
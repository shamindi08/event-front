import axios from 'axios';

const API_URL = "http://localhost:5000/api/";

const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

const api = axios.create({
    baseURL: API_URL,
    
});

// Function to get current token
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
};

//Request interceptor 
api.interceptors.request.use((config) => {
    const newToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

//Response interceptor
api.interceptors.response.use((response) => {
    // Return the full response object so components can access response.data
    return response;
}, (error) => {
    if (error.response) {
        // Attach the user-friendly message to the error for easy access
        const userMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
        error.userMessage = userMessage;
    } else {
        error.userMessage = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
});

export default {
    get: (endpoint) => api.get(endpoint),
    post: (endpoint, data) => api.post(endpoint, data),
    put: (endpoint, data) => api.put(endpoint, data),
    delete: (endpoint) => api.delete(endpoint),
};
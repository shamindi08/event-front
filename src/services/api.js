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
    // If we have a response from server, try to normalize 404s into a friendly message
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Prefer explicit server message when available
        const userMessage = data?.message || data?.error || 'An error occurred';
        error.userMessage = userMessage;

        // For GET requests, treat 404 as "no data" and resolve with a normalized response
        // so callers can handle "no data" without an exception.
        const method = error.config?.method?.toLowerCase();
        if (status === 404 && method === 'get') {
            // Provide a minimal response object similar to axios response
            const normalized = {
                data: null,
                status: 404,
                statusText: error.response.statusText || 'Not Found',
                // include original response for advanced callers if needed
                originalResponse: error.response
            };
            return Promise.resolve(normalized);
        }
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
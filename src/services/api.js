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
    return response;
}, (error) => {
    if (error.response) {
        console.error('API error:', error.response.data);
        throw new Error(error.response.data.message || 'Something went wrong');
    } else {
        console.error('API error:', error.message);
        throw new Error(error.message || 'Something went wrong');
    }
});

export default {
    get: (endpoint) => api.get(endpoint),
    post: (endpoint, data) => api.post(endpoint, data),
    put: (endpoint, data) => api.put(endpoint, data),
    delete: (endpoint) => api.delete(endpoint),
};
import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            toast.error("Session expired. Please login again.");
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
        return Promise.reject(error);
    }
);

export default API;
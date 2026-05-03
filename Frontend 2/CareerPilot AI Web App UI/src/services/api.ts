import axios from 'axios';

// In production on Vercel, use the VITE_API_URL env var.
// In local development, fall back to the Django local server.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Use Bearer prefix if it looks like a JWT (contains two dots)
      const prefix = token.split('.').length === 3 ? 'Bearer' : 'Token';
      config.headers.Authorization = `${prefix} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token and optionally redirect/trigger logout event
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('auth-unauthorized'));
      } else if (error.response.status >= 500) {
        // You can import toast from sonner here, or dispatch an event
        window.dispatchEvent(new CustomEvent('api-error', { detail: 'Internal Server Error. Please try again later.' }));
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials: { username?: string; email?: string; password?: string }) => 
    api.post('/login/', credentials),
  signup: (userData: { username?: string; email?: string; password?: string }) => 
    api.post('/signup/', userData),
  getMe: () => api.get('/me/'),
};

export const chatService = {
  generate: (prompt: string, context?: any) => api.post('/generate/', { prompt, context }),
  generateResume: (data: any) => api.post('/generate-resume/', data),
  getInterviewFeedback: (data: { question: string, answer: string, role?: string }) => api.post('/interview-feedback/', data),
  getCareerSuggestions: (data: any) => api.post('/career-suggestions/', data),
  generateRoadmap: (data: { goal: string, timeframe: string, level: string }) => api.post('/generate-roadmap/', data),
  getHistory: () => api.get('/history/'),
};

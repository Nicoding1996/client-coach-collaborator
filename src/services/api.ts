import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const authAPI = {
  register: async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      console.log('Sending registration request:', { ...userData, password: '[REDACTED]' });
      const response = await api.post('/users/register', userData);
      // Store the token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/users/login', credentials);
      // Store the token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error.response?.data || error);
      throw error;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error);
      throw error;
    }
  },

  updateAvatar: async (formData: FormData) => {
    try {
      const response = await api.put('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update avatar error:', error.response?.data || error);
      throw error;
    }
  },
};

export default api; 
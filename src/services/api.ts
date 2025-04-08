import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeouts to prevent hanging requests
  timeout: 10000,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
    } else if (!error.response) {
      console.error('Network error - server may be down:', error.message);
    } else {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export const authAPI = {
  register: async (userData: { email: string; password: string; name: string; role: string; inviteToken?: string }) => { // Added inviteToken?
    try {
      // Ensure inviteToken is included if provided
      const payload = { ...userData };
      console.log('Sending registration request:', { ...payload, password: '[REDACTED]' });
      const response = await api.post('/users/register', payload); // Send the payload
      // Store the token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Registration error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected registration error:', error);
      }
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected login error:', error);
      }
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get profile error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected get profile error:', error);
      }
      throw error;
    }
  },

  updateProfile: async (profileData: Record<string, unknown>) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update user data in localStorage to keep it in sync
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = { ...userData, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Update profile error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected update profile error:', error);
      }
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
      
      // Update avatar in localStorage
      if (response.data.avatar) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.avatar = response.data.avatar;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Update avatar error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected update avatar error:', error);
      }
      throw error;
    }
  },
  validateInvite: async (inviteToken: string) => {
    try {
      // Make GET request to the validation endpoint
      const response = await api.get(`/invites/validate/${inviteToken}`);
      return response.data; // Expecting a success response if valid
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Invite validation error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected invite validation error:', error);
      }
      throw error; // Re-throw to be handled by the component
    }
  },


  getClients: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get clients error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  getSessions: async () => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get sessions error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  createSession: async (sessionData: { clientId: string; sessionDate: Date | undefined; startTime: string; endTime: string; location: string; notes: string }) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Create session error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  getSessionById: async (sessionId: string) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get session by ID error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  updateSession: async (sessionId: string, updatedSessionData: Partial<Record<string, unknown>>) => {
    try {
      const response = await api.put(`/sessions/${sessionId}`, updatedSessionData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Update session error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Delete session error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  getInvoices: async () => {
    try {
      const response = await api.get('/invoices');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get invoices error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  createInvoice: async (invoiceData: { clientId: string; issueDate: Date; dueDate: Date; amount?: number; lineItems?: { description: string; quantity: number; price: number }[]; notes: string; status: string }) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Create invoice error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  updateInvoice: async (invoiceId: string, updateData: Partial<{ status: string }>) => {
    try {
      const response = await api.put(`/invoices/${invoiceId}`, updateData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Update invoice error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  getInvoiceById: async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get invoice by ID error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  getCoachDashboardSummary: async () => {
    try {
      const response = await api.get('/dashboard/coach-summary');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Get coach dashboard summary error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },

  generateInviteLink: async () => {
    try {
      const response = await api.post('/invites/link');
      // Assuming the API returns { inviteToken: '...' }
      return response.data.inviteToken;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Generate invite link error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },
};

export default api; 
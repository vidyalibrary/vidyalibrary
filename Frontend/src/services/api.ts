import axios from 'axios';

// Determine the API URL based on the environment
const API_URL = window.cordova
  ? 'https://librarymanage-sm1b.onrender.com/api' // Production server for mobile
  : process.env.NODE_ENV === 'production'
    ? 'https://librarymanage-sm1b.onrender.com/api' // Production server for web
    : 'http://localhost:3000/api';
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure session cookies are sent
});

// Add response interceptor to transform snake_case to camelCase and handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = transformKeysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Redirecting to login:', error.response?.data?.message);
      window.location.href = '/login';
    } else if (!error.response) {
      console.error('Network error - please check your connection:', error.message);
      alert('Unable to connect to the server. Please check your internet connection.');
    }
    const errorData = error.response?.data || { message: error.message };
    return Promise.reject(new Error(errorData.message || 'An unexpected error occurred'));
  }
);

// Utility function to convert snake_case to camelCase
const transformKeysToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamelCase(item));
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = transformKeysToCamelCase(value);
    }
    return newObj;
  }
  return obj;
};

const api = {
  // Auth methods
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { message, user } = response.data;
      if (message === 'Login successful' && user) {
        console.log('Login successful, user:', user);
        return user; // Return the user object
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw error instanceof Error ? error : new Error('Login failed due to server error');
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.get('/auth/logout');
      console.log('Logout response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  },

  checkAuthStatus: async () => {
    try {
      const response = await apiClient.get('/auth/status');
      console.log('Auth status check:', response.data);
      return response.data; // Expecting { isAuthenticated: boolean, user?: { id: string, username: string, role: string } }
    } catch (error) {
      console.error('Auth status check failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Student methods (unchanged)
  getStudents: async () => {
    try {
      const response = await apiClient.get('/students');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStudent: async (id: string) => {
    try {
      const response = await apiClient.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveStudents: async () => {
    try {
      const response = await apiClient.get('/students/active');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getExpiredMemberships: async () => {
    try {
      const response = await apiClient.get('/students/expired');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getExpiringSoon: async () => {
    try {
      const response = await apiClient.get('/students/expiring-soon');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addStudent: async (studentData: any) => {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateStudent: async (id: string, studentData: any) => {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteStudent: async (id: string) => {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  renewMembership: async (id: string, membershipData: any) => {
    try {
      const response = await apiClient.put(`/students/${id}`, {
        ...membershipData,
        status: 'active',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/students/stats/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Schedule methods (unchanged)
  getSchedules: async () => {
    try {
      const response = await apiClient.get('/schedules');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addSchedule: async (scheduleData: any) => {
    try {
      const response = await apiClient.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSchedule: async (id: string, scheduleData: any) => {
    try {
      const response = await apiClient.put(`/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSchedule: async (id: string) => {
    try {
      const response = await apiClient.delete(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User profile methods (unchanged)
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (profileData: any) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEmailSettings: async () => {
    const response = await apiClient.get('/settings/email');
    return response.data;
  },

  updateEmailSettings: async (data: { templateId: string; daysBefore: string }) => {
    const response = await apiClient.put('/settings/email', data);
    return response.data;
  },
};

export default api;
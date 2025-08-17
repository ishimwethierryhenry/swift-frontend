// =================== API SERVICE ===================
// src/services/waterQualityService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://swift-backend-88o8.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const waterQualityService = {
  // Get historical data with filters
  getHistoricalData: async (params = {}) => {
    const response = await api.get('/water-quality/historical', { params });
    return response.data;
  },

  // Get statistics
  getStatistics: async (params = {}) => {
    const response = await api.get('/water-quality/statistics', { params });
    return response.data;
  },

  // Get monthly data for charts
  getMonthlyData: async (params = {}) => {
    const response = await api.get('/water-quality/monthly', { params });
    return response.data;
  },

  // Create new record
  createRecord: async (data) => {
    const response = await api.post('/water-quality/record', data);
    return response.data;
  },

  // Update record
  updateRecord: async (recordId, data) => {
    const response = await api.put(`/water-quality/record/${recordId}`, data);
    return response.data;
  },

  // Delete record
  deleteRecord: async (recordId) => {
    const response = await api.delete(`/water-quality/record/${recordId}`);
    return response.data;
  },
};

export default waterQualityService;

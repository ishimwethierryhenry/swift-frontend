// =================== API SERVICE ===================
// src/services/waterQualityService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_cdAPI_URL || 'http://localhost:3000';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://swift-backend-88o8.onrender.com';


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
  // =================== WATER QUALITY METHODS ===================
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

  // =================== DEVICE METHODS ===================
  // Start device recording
  startRecording: async (data) => {
    const response = await api.post('/device/start-recording', data);
    return response.data;
  },

  // Stop device recording
  stopRecording: async (data) => {
    const response = await api.post('/device/stop-recording', data);
    return response.data;
  },

  // Get device status
  getDeviceStatus: async (poolId) => {
    const response = await api.get(`/device/status/${poolId}`);
    return response.data;
  },

  // =================== POOL DATA METHODS ===================
  // Save test data
  saveTestData: async (data) => {
    const response = await api.post('/pool-data/save-test-data', data);
    return response.data;
  },

  // Get recent test data
  getRecentTestData: async (poolId, limit = 10) => {
    const response = await api.get(`/pool-data/recent/${poolId}`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Get pool testing statistics
  getPoolTestingStats: async (poolId, timeRange = 'week') => {
    const response = await api.get(`/pool-data/stats/${poolId}`, { 
      params: { timeRange } 
    });
    return response.data;
  },

  // Simulate device data (for testing)
  simulateDeviceData: async (poolId) => {
    const response = await api.post(`/pool-data/simulate/${poolId}`);
    return response.data;
  },
};

export default waterQualityService;
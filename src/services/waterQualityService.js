// FRONTEND: src/services/waterQualityService.js - UPDATED ROUTES
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://swift-backend-88o8.onrender.com';

class WaterQualityService {
  // Start recording for pool testing - CORRECTED ROUTE
  static async startRecording(data) {
    try {
      // Use /test/start-recording instead of /device/start-recording
      const response = await axios.post(`${API_BASE_URL}/test/start-recording`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error.response?.data || error;
    }
  }

  // Stop recording - CORRECTED ROUTE
  static async stopRecording(data) {
    try {
      // Use /test/stop-recording instead of /device/stop-recording
      const response = await axios.post(`${API_BASE_URL}/test/stop-recording`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error.response?.data || error;
    }
  }

  // Save test data - CORRECTED ROUTE
  static async saveTestData(data) {
    try {
      // Use /test/save-data instead of /pool-data/save-test-data
      const response = await axios.post(`${API_BASE_URL}/test/save-data`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving test data:', error);
      throw error.response?.data || error;
    }
  }

  // Get device status - KEEP DEVICE ROUTE
  static async getDeviceStatus(poolId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/device/status/${poolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error.response?.data || error;
    }
  }

  // Save water quality data to database using proper water quality endpoint
  static async saveWaterQualityData(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/water-quality/record`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving water quality data:', error);
      throw error.response?.data || error;
    }
  }

  // Get historical water quality data
  static async getHistoricalData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_BASE_URL}/water-quality/historical?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error.response?.data || error;
    }
  }

  // Get recent test data for a pool
  static async getRecentTestData(poolId, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pool-data/recent/${poolId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recent test data:', error);
      throw error.response?.data || error;
    }
  }

  // Get pool testing statistics
  static async getPoolTestingStats(poolId, timeRange = 'week') {
    try {
      const response = await axios.get(`${API_BASE_URL}/pool-data/stats/${poolId}?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting pool testing stats:', error);
      throw error.response?.data || error;
    }
  }

  // Simulate device data (for testing)
  static async simulateDeviceData(poolId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/pool-data/simulate/${poolId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error simulating device data:', error);
      throw error.response?.data || error;
    }
  }
}

export default WaterQualityService;
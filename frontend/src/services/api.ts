import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (message: string, responseType: string, userId: string = 'anonymous') => {
    try {
      const response = await api.post('/chat', {
        message,
        response_type: responseType,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  safetyCheck: async (text: string) => {
    try {
      const response = await api.post('/safety-check', { text });
      return response.data;
    } catch (error) {
      console.error('Safety check error:', error);
      return { is_safe: true, message: 'Safety check unavailable', risk_level: 'low' };
    }
  },

  ping: async () => {
    try {
      const response = await api.get('/ping');
      return response.data;
    } catch (error) {
      console.error('Ping error:', error);
      throw new Error('Backend server is not available');
    }
  },
};

export default api;
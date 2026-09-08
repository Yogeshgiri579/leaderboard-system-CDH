import axios from 'axios';

const getBaseURL = () => {
  let url = (import.meta.env.VITE_API_URL || '/api').trim();
  if (url.startsWith('http')) {
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchLeaderboard = async (params = {}) => {
  const response = await api.get('/leaderboard', { params });
  return response.data;
};

export const fetchCommunityStats = async () => {
  const response = await api.get('/leaderboard/stats');
  return response.data;
};

export const submitUserProfile = async (userData) => {
  const response = await api.post('/users/submit', userData);
  return response.data;
};

export const fetchUserPosts = async (userId) => {
  const response = await api.get(`/users/${userId}/posts`);
  return response.data;
};

export const checkJobStatus = async (jobId) => {
  const response = await api.get(`/users/job-status/${jobId}`);
  return response.data;
};

export const fetchBadgesCatalog = async () => {
  const response = await api.get('/users/badges/catalog');
  return response.data;
};

export default api;


import axios from 'axios';

const API_URL = 'YOUR_BACKEND_API_URL'; // Replace with your backend URL

type User = {
  id: string;
  email: string;
  role: 'athlete' | 'instructor' | 'coach';
  token: string;
};

// Login API
export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

// Register API
export const registerUser = async (
  email: string,
  password: string,
  role: string,
): Promise<User> => {
  const response = await axios.post(`${API_URL}/register`, { email, password, role });
  return response.data;
};

// Fetch role-specific data (example for athlete matches)
export const fetchAthleteMatches = async (token: string) => {
  const response = await axios.get(`${API_URL}/athlete/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add more API calls as needed
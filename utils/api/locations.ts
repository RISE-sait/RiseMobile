import axios from "axios";
import { API_URL } from './core/constants';

// 🔹 **Location API Functions**

// Get all locations
export const getLocations = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/locations`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch locations:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Get location details by ID
export const getLocationById = async (locationId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/locations/${locationId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch location ${locationId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new location
export const createLocation = async (token: string, data: { name: string; address: string }): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/locations`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create location:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Update a location
export const updateLocation = async (token: string, locationId: string, data: { name: string; address: string }): Promise<any> => {
  try {
    const response = await axios.put(`${API_URL}/locations/${locationId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update location ${locationId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Delete a location
export const deleteLocation = async (token: string, locationId: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/locations/${locationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to delete location ${locationId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Get all courts
export const getCourts = async (token: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/courts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch courts:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new court
export const createCourt = async (token: string, data: { name: string; location_id: string }): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/courts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create court:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Update a court
export const updateCourt = async (token: string, courtId: string, data: { name: string; location_id: string }): Promise<any> => {
  try {
    const response = await axios.put(`${API_URL}/courts/${courtId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update court ${courtId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Delete a court
export const deleteCourt = async (token: string, courtId: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/courts/${courtId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to delete court ${courtId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

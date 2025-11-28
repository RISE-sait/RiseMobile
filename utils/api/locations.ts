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

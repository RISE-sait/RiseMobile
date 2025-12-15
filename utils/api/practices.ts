import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from './core/constants';
import { refreshBackendJwt } from './core/client';

/**
 * Practice API Functions
 *
 * Functions for managing practice events and programs
 */

/**
 * Create a one-time practice event
 */
export const createPractice = async (data: any, jwt: string) => {
  const response = await fetch(`${API_URL}/events/one-time`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Failed to create practice");
  }
};

/**
 * Create a recurring practice event
 */
export const createRecurringPractice = async (data: any, jwt: string) => {
  const response = await fetch(`${API_URL}/events/recurring`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Failed to create recurring practice");
  }
};

/**
 * Get all practice programs
 */
export const getPracticePrograms = async () => {
  // Get stored JWT token for backend authentication
  let jwtToken = await AsyncStorage.getItem("authToken");

  if (!jwtToken) {
    try {
      jwtToken = await refreshBackendJwt();
    } catch (refreshError) {
      console.error("❌ Failed to refresh JWT token:", refreshError);
      throw new Error("User not logged in");
    }
  }

  const res = await fetch(`${API_URL}/programs?program_type=practice`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to load programs");
  }

  return res.json(); // should return array of { id, name, ... }
};

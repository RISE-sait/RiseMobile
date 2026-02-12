/**
 * Barber and Haircut Booking API Functions
 *
 * This module handles all barber-related API endpoints including:
 * - Haircut services and barber listings
 * - Booking creation and management
 * - Barber availability checking
 */

import axios from "axios";
import { API_URL } from './core/constants';

// 🔹 **Haircut Booking API Functions**

/**
 * Get all haircut services and barbers
 *
 * @returns Promise resolving to haircut services data
 * @throws Error if the request fails
 */
export const getHaircutAndBarberServices = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/haircuts/services`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch haircut services:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

/**
 * Create a new haircut booking
 *
 * @param bookingDetails - The booking details object
 * @param token - JWT authentication token
 * @returns Promise resolving to the created booking data
 * @throws Error if the request fails
 */
export const createHaircutBooking = async (bookingDetails: any, token: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/haircuts/events`, bookingDetails, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create haircut booking:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

/**
 * Get upcoming bookings for the authenticated user
 *
 * @param token - JWT authentication token
 * @returns Promise resolving to upcoming bookings data
 * @throws Error if the request fails
 */
export const getUpcomingBookings = async (token: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/bookings/upcoming`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch upcoming bookings:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

/**
 * Get available time slots for a specific barber on a given date and for a given service duration
 *
 * @param barberId - The barber's ID
 * @param date - The date to check availability for (ISO format)
 * @param serviceDuration - Duration of the service in minutes
 * @param token - JWT authentication token
 * @returns Promise resolving to array of available time slots
 * @throws Error if the request fails
 */
export const getBarberAvailability = async (barberId: string, date: string, serviceDuration: number, token: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/haircuts/barbers/${barberId}/availability`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      params: {
        date,
        service_duration: serviceDuration,
      },
    });
    // Ensure we return the array from the 'available_slots' key, or an empty array as a fallback.
    return response.data.available_slots || [];
  } catch (error) {
    console.error("❌ Failed to fetch barber availability:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

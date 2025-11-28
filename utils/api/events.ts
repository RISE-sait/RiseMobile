import axios from "axios";
import { auth } from "@/firebase/firebaseConfig";
import { API_URL } from "./core/constants";

// 🔹 **Event Enrollment API Functions**

// Get event enrollment options including credit cost
export const getEventEnrollmentOptions = async (eventId: string, token: string): Promise<any> => {
  try {
    const firebaseUser = auth.currentUser;

    let firebaseToken = null;
    if (firebaseUser) {
      try {
        firebaseToken = await firebaseUser.getIdToken(true);
      } catch (firebaseError) {
        console.error("Failed to get Firebase token:", firebaseError);
      }
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (firebaseToken) {
      headers["firebase_token"] = firebaseToken;
    }

    const response = await axios.get(`${API_URL}/checkout/events/${eventId}/options`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch enrollment options for event ${eventId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Enroll in event using credits
export const enrollEventWithCredits = async (eventId: string, token: string): Promise<any> => {
  try {
    const firebaseUser = auth.currentUser;

    let firebaseToken = null;
    if (firebaseUser) {
      try {
        firebaseToken = await firebaseUser.getIdToken(true);
      } catch (firebaseError) {
        console.error("Failed to get Firebase token:", firebaseError);
      }
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (firebaseToken) {
      headers["firebase_token"] = firebaseToken;
    }

    const response = await axios.post(
      `${API_URL}/checkout/events/${eventId}/enhanced`,
      { payment_method: "credits" },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to enroll in event ${eventId} with credits:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

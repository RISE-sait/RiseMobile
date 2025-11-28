import axios from "axios";
import { auth } from "@/firebase/firebaseConfig";
import { API_URL } from './core/constants';

// 🔹 **Game API Functions**

// Get all games for the authenticated coach
export const getGames = async (token: string): Promise<any> => {
  try {
    const firebaseUser = auth.currentUser;

    // Try to get Firebase token if user is available
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

    // Add Firebase token if available
    if (firebaseToken) {
      headers["firebase_token"] = firebaseToken;
    }

    const response = await axios.get(`${API_URL}/secure/games`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch games:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Get game details by ID
export const getGameById = async (gameId: string, token: string): Promise<any> => {
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

    const response = await axios.get(`${API_URL}/games/${gameId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch game ${gameId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new game
export const createGame = async (
  gameData: {
    home_team_id: string;
    away_team_id: string;
    location_id: string;
    start_time: string;
    court_id?: string;
    end_time?: string;
    status?: string;
    home_score?: number;
    away_score?: number;
  },
  token: string
): Promise<any> => {
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

    const response = await axios.post(`${API_URL}/games`, gameData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to create game:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Update an existing game
export const updateGame = async (
  gameId: string,
  gameData: {
    home_team_id?: string;
    away_team_id?: string;
    location_id?: string;
    start_time?: string;
    court_id?: string;
    end_time?: string;
    status?: string;
    home_score?: number;
    away_score?: number;
  },
  token: string
): Promise<any> => {
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

    const response = await axios.put(`${API_URL}/games/${gameId}`, gameData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update game ${gameId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Delete a game
export const deleteGame = async (gameId: string, token: string): Promise<any> => {
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

    const response = await axios.delete(`${API_URL}/games/${gameId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to delete game ${gameId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

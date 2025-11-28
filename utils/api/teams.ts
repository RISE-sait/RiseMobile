import axios from "axios";
import { auth } from "@/firebase/firebaseConfig";
import { API_URL } from './core/constants';

// 🔹 **Team API Functions**

// Get all teams for the authenticated coach
export const getTeams = async (token: string): Promise<any> => {
  try {
    const firebaseUser = auth.currentUser;

    // Try to get Firebase token if user is available, but don't require it
    // Since testing shows this endpoint works with just JWT token
    let firebaseToken = null;
    if (firebaseUser) {
      try {
        firebaseToken = await firebaseUser.getIdToken(true);
      } catch (firebaseError) {
      }
    } else {
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Add Firebase token if available
    if (firebaseToken) {
      headers["firebase_token"] = firebaseToken;
    }

    const response = await axios.get(`${API_URL}/secure/teams`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch teams:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Get team details by ID including roster
export const getTeamById = async (teamId: string, token: string): Promise<any> => {
  try {
    const firebaseUser = auth.currentUser;

    // Try to get Firebase token if user is available, but don't require it
    // Since testing shows this endpoint works with just JWT token
    let firebaseToken = null;
    if (firebaseUser) {
      try {
        firebaseToken = await firebaseUser.getIdToken(true);
      } catch (firebaseError) {
      }
    } else {
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Add Firebase token if available
    if (firebaseToken) {
      headers["firebase_token"] = firebaseToken;
    }

    const response = await axios.get(`${API_URL}/teams/${teamId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch team ${teamId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new team
export const createTeam = async (teamData: { name: string; capacity: number; logo?: string; coach_id?: string }, token: string): Promise<any> => {
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

    const response = await axios.post(`${API_URL}/teams`, teamData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to create team:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Update an existing team
export const updateTeam = async (teamId: string, teamData: { name: string; capacity: number; coach_id: string; logo?: string }, token: string): Promise<any> => {
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

    const response = await axios.put(`${API_URL}/teams/${teamId}`, teamData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update team ${teamId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Delete a team
export const deleteTeam = async (teamId: string, token: string): Promise<any> => {
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

    const response = await axios.delete(`${API_URL}/teams/${teamId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to delete team ${teamId}:`, (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// 🔹 **External Team API Functions**

// Get all external teams (opponent teams)
export const getExternalTeams = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/teams/external`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch external teams:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new external team
export const createExternalTeam = async (
  teamData: { name: string; capacity: number; logo_url?: string },
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

    const response = await axios.post(`${API_URL}/teams/external`, teamData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to create external team:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

import axios from "axios";
import { API_URL } from "./core/constants";
import type { Child, Parent, Sibling, LinkRequest } from "@/types/family";

// Get all children linked to the authenticated parent
export const getChildren = async (token: string): Promise<Child[]> => {
  try {
    const response = await axios.get(`${API_URL}/family/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get children:", error.response?.data || error.message);
    throw error;
  }
};

// Get parent information for the authenticated child user
export const getParent = async (token: string): Promise<Parent | null> => {
  try {
    const response = await axios.get(`${API_URL}/family/parent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    // 404 means no parent link - return null instead of throwing
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Failed to get parent:", error.response?.data || error.message);
    throw error;
  }
};

// Get siblings for the authenticated child user
export const getSiblings = async (token: string): Promise<Sibling[]> => {
  try {
    const response = await axios.get(`${API_URL}/family/siblings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get siblings:", error.response?.data || error.message);
    throw error;
  }
};

// Initiate a link request between parent and child
export const requestLink = async (
  token: string,
  body: Record<string, any>
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/family/link/request`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to request link:", error.response?.data || error.message);
    throw error;
  }
};

// Confirm a link request using the verification code sent via email
export const confirmLink = async (
  token: string,
  body: { code: string }
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/family/link/confirm`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to confirm link:", error.response?.data || error.message);
    throw error;
  }
};

// Cancel the caller's pending link request
export const cancelLinkRequest = async (token: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/family/link/request`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to cancel link request:", error.response?.data || error.message);
    throw error;
  }
};

// Get all pending link requests where the user is child, new parent, or old parent
export const getLinkRequests = async (token: string): Promise<LinkRequest[]> => {
  try {
    const response = await axios.get(`${API_URL}/family/link/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get link requests:", error.response?.data || error.message);
    throw error;
  }
};

// Get schedule for a specific child
export const getChildSchedule = async (token: string, childId: string) => {
  try {
    const response = await axios.get(`${API_URL}/secure/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { child_id: childId },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Admin only: removes the parent-child link for a user
export const adminRemoveLink = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/family/admin/link/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to remove link:", error.response?.data || error.message);
    throw error;
  }
};

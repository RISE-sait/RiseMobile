import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from './core/constants';
import { type APIResponse, type APIErrorType } from './core/types';
import { refreshBackendJwt } from './core/client';

// 🔹 **Waiver Types**

export interface Waiver {
  id: string;
  user_id?: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  notes?: string;
  uploaded_at?: {
    Time: string;
    Valid: boolean;
  };
  uploaded_by?: string;
}

// 🔹 **Account Deletion API Function**

/**
 * Delete user account
 * @param userToken - JWT authentication token
 * @returns Response with deletion status
 */
export const deleteUserAccount = async (userToken: string) => {
  try {
    const response = await axios.delete(`${API_URL}/secure/customers/delete-account`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        confirm_deletion: true
      }
    });

    if (response.status === 200) {
      return { data: true, error: null };
    } else {
      return {
        data: null,
        error: {
          message: `Account deletion failed with status: ${response.status}`,
          status: response.status
        }
      };
    }
  } catch (error) {
    console.error("❌ Account deletion API error:", error);
    return {
      data: null,
      error: {
        message: (error as any).response?.data?.error?.message || "Failed to delete account",
        status: (error as any).response?.status || 500
      }
    };
  }
};

// 🔹 **Waiver API Functions**

/**
 * Upload a waiver document
 * @param file - File object with uri, name, and type
 * @param userId - User ID to associate the waiver with
 * @param notes - Optional notes about the waiver
 * @returns Response with uploaded waiver data
 */
export const uploadWaiver = async (
  file: { uri: string; name: string; type: string },
  userId: string,
  notes?: string
): Promise<APIResponse<Waiver>> => {
  try {
    let jwtToken = await AsyncStorage.getItem("authToken");

    if (!jwtToken) {
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
        console.error("❌ Failed to refresh JWT token:", refreshError);
        return {
          data: null,
          error: {
            message: "Unable to authenticate with backend",
            status: 401,
            type: 'auth',
            userMessage: "Session expired. Please log in again."
          }
        };
      }
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    formData.append('user_id', userId);

    // Build URL with query parameters (notes only)
    const params = new URLSearchParams();
    if (notes) {
      params.append('notes', notes);
    }

    // Build the URL with optional query string
    const queryString = params.toString();
    const uploadUrl = queryString ? `${API_URL}/waivers/upload?${queryString}` : `${API_URL}/waivers/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
            body: formData,
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            return {
              data: null,
              error: {
                message: `Failed to upload waiver after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryResponse.status === 401 ? 'auth' : 'unknown',
                userMessage: retryResponse.status === 401
                  ? "Session expired. Please log in again."
                  : "Failed to upload waiver. Please try again."
              }
            };
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (refreshError) {
          return {
            data: null,
            error: {
              message: "Token refresh failed",
              status: 401,
              type: 'auth',
              userMessage: "Session expired. Please log in again."
            }
          };
        }
      }

      const errorText = await response.text();
      const errorType: APIErrorType =
        response.status === 413 ? 'payload_too_large' :
        response.status === 400 ? 'validation' :
        response.status >= 500 ? 'server' :
        'unknown';

      const userMessage =
        response.status === 413 ? "File size too large. Maximum 10MB allowed." :
        response.status === 400 ? "Invalid file format. Please upload a valid document." :
        response.status >= 500 ? "Server error. Please try again later." :
        "Failed to upload waiver. Please try again.";

      return {
        data: null,
        error: {
          message: `Failed to upload waiver: ${response.status} ${errorText}`,
          status: response.status,
          type: errorType,
          userMessage: userMessage
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to upload waiver:", error);
    const isNetworkError =
      error instanceof TypeError &&
      (error.message.includes('Network request failed') ||
       error.message.includes('Failed to fetch'));

    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to upload waiver",
        status: 500,
        type: isNetworkError ? 'network' : 'unknown',
        userMessage: isNetworkError
          ? "Please check your internet connection and try again."
          : "An unexpected error occurred. Please try again."
      }
    };
  }
};

/**
 * Get waivers for a specific user
 * @param userId - User ID to fetch waivers for
 * @returns Response with array of waivers
 */
export const getUserWaivers = async (userId: string): Promise<APIResponse<Waiver[]>> => {
  try {
    let jwtToken = await AsyncStorage.getItem("authToken");

    if (!jwtToken) {
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
        console.error("❌ Failed to refresh JWT token:", refreshError);
        return {
          data: null,
          error: {
            message: "Unable to authenticate with backend",
            status: 401,
            type: 'auth',
            userMessage: "Session expired. Please log in again."
          }
        };
      }
    }

    const response = await fetch(`${API_URL}/waivers/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/waivers/user/${userId}`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            return {
              data: null,
              error: {
                message: `Failed to fetch waivers after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryResponse.status === 401 ? 'auth' : 'unknown',
                userMessage: retryResponse.status === 401
                  ? "Session expired. Please log in again."
                  : "Unable to load waivers. Please try again."
              }
            };
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (refreshError) {
          return {
            data: null,
            error: {
              message: "Token refresh failed",
              status: 401,
              type: 'auth',
              userMessage: "Session expired. Please log in again."
            }
          };
        }
      }

      const errorText = await response.text();
      return {
        data: null,
        error: {
          message: `Failed to fetch waivers: ${response.status} ${errorText}`,
          status: response.status,
          type: response.status === 404 ? 'not_found' : 'unknown',
          userMessage: response.status === 404
            ? "No waivers found."
            : "Unable to load waivers. Please try again."
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch waivers:", error);
    const isNetworkError =
      error instanceof TypeError &&
      (error.message.includes('Network request failed') ||
       error.message.includes('Failed to fetch'));

    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch waivers",
        status: 500,
        type: isNetworkError ? 'network' : 'unknown',
        userMessage: isNetworkError
          ? "Please check your internet connection and try again."
          : "An unexpected error occurred. Please try again."
      }
    };
  }
};

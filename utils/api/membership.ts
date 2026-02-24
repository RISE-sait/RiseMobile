import AsyncStorage from "@react-native-async-storage/async-storage";
import { USE_MEMBERSHIP_TEST_MODE, MEMBERSHIP_TEST_PLAN_ID } from "../constants";
import { API_URL } from './core/constants';
import { type APIErrorType, type APIResponse } from './core/types';
import { refreshBackendJwt } from './core/client';

// 🔹 **Membership API Functions**

// Get all available credit packages (no authentication required)
export const getCreditPackages = async () => {
  try {
    const response = await fetch(`${API_URL}/credit_packages`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: {
          message: `Failed to fetch credit packages: ${response.status} ${errorText}`,
          status: response.status
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch credit packages:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch credit packages",
        status: 500
      }
    };
  }
};

// Get all available membership plans (no authentication required)
export const getAllMembershipPlans = async () => {
  try {
    const response = await fetch(`${API_URL}/memberships`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: {
          message: `Failed to fetch membership plans: ${response.status} ${errorText}`,
          status: response.status
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch membership plans:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch membership plans",
        status: 500
      }
    };
  }
};

// Get current user's membership details (requires authentication)
export const getUserMemberships = async (): Promise<APIResponse<any>> => {
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
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


    // Use the correct endpoint for current logged-in user: /secure/customers/memberships
    const response = await fetch(`${API_URL}/secure/customers/memberships`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();

          // Retry the request with new token
          const retryResponse = await fetch(`${API_URL}/secure/customers/memberships`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();

            // Classify retry error (aligned with backend)
            const retryErrorType: APIErrorType =
              retryResponse.status === 401 ? 'auth' :
              retryResponse.status === 403 ? 'permission' :
              retryResponse.status === 404 ? 'not_found' :
              retryResponse.status === 408 ? 'timeout' :
              retryResponse.status === 409 ? 'conflict' :
              retryResponse.status === 410 ? 'gone' :
              retryResponse.status === 413 ? 'payload_too_large' :
              retryResponse.status === 429 ? 'rate_limit' :
              retryResponse.status === 503 ? 'service_unavailable' :
              retryResponse.status >= 500 ? 'server' :
              retryResponse.status === 400 ? 'validation' :
              'unknown';

            const retryUserMessage =
              retryResponse.status === 401 ? "Session expired. Please log in again." :
              retryResponse.status === 403 ? "You don't have permission to view membership information." :
              retryResponse.status === 404 ? "Membership information not found." :
              retryResponse.status === 408 ? "Request timeout. Please try again." :
              retryResponse.status === 409 ? "This action conflicts with existing data. Please refresh and try again." :
              retryResponse.status === 410 ? "This resource is no longer available. Please contact support." :
              retryResponse.status === 413 ? "File size too large. Maximum 10MB allowed." :
              retryResponse.status === 429 ? "Too many requests. Please wait a moment and try again." :
              retryResponse.status === 503 ? "Service is temporarily unavailable. Please try again later." :
              retryResponse.status >= 500 ? "Server error. Please try again later." :
              retryResponse.status === 400 ? "Invalid request. Please contact support." :
              "Unable to load membership information. Please try again.";

            return {
              data: null,
              error: {
                message: `Failed to fetch user memberships after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryErrorType,
                userMessage: retryUserMessage
              }
            };
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (refreshError) {
          console.error("❌ Failed to refresh token on retry:", refreshError);
          return {
            data: null,
            error: {
              message: `Authentication failed: ${response.status} ${errorText}`,
              status: response.status,
              type: 'auth',
              userMessage: "Session expired. Please log in again."
            }
          };
        }
      }

      // Classify error based on status code (aligned with backend)
      const errorType: APIErrorType =
        response.status === 401 ? 'auth' :
        response.status === 403 ? 'permission' :
        response.status === 404 ? 'not_found' :
        response.status === 408 ? 'timeout' :
        response.status === 409 ? 'conflict' :
        response.status === 410 ? 'gone' :
        response.status === 413 ? 'payload_too_large' :
        response.status === 429 ? 'rate_limit' :
        response.status === 503 ? 'service_unavailable' :
        response.status >= 500 ? 'server' :
        response.status === 400 ? 'validation' :
        'unknown';

      const userMessage =
        response.status === 401 ? "Session expired. Please log in again." :
        response.status === 403 ? "You don't have permission to view membership information." :
        response.status === 404 ? "Membership information not found." :
        response.status === 408 ? "Request timeout. Please try again." :
        response.status === 409 ? "This action conflicts with existing data. Please refresh and try again." :
        response.status === 410 ? "This resource is no longer available. Please contact support." :
        response.status === 413 ? "File size too large. Maximum 10MB allowed." :
        response.status === 429 ? "Too many requests. Please wait a moment and try again." :
        response.status === 503 ? "Service is temporarily unavailable. Please try again later." :
        response.status >= 500 ? "Server error. Please try again later." :
        response.status === 400 ? "Invalid request. Please contact support." :
        "Unable to load membership information. Please try again.";

      return {
        data: null,
        error: {
          message: `Failed to fetch user memberships: ${response.status} ${errorText}`,
          status: response.status,
          type: errorType,
          userMessage: userMessage
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch user memberships:", error);

    // Check if it's a network error
    const isNetworkError =
      error instanceof TypeError &&
      (error.message.includes('Network request failed') ||
       error.message.includes('Failed to fetch') ||
       error.message.includes('timeout'));

    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch user memberships",
        status: 500,
        type: isNetworkError ? 'network' : 'unknown',
        userMessage: isNetworkError
          ? "Please check your internet connection and try again."
          : "An unexpected error occurred. Please try again."
      }
    };
  }
};

// Get all available membership plans (requires authentication)
export const getMembershipPlans = async () => {
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
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
            type: 'auth'
          }
        };
      }
    }

    // Use the correct endpoint: /memberships (as confirmed by test results)
    const response = await fetch(`${API_URL}/memberships`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();

          // Retry the request with new token
          const retryResponse = await fetch(`${API_URL}/memberships`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            return {
              data: null,
              error: {
                message: `Failed to fetch membership plans: ${retryResponse.status} ${errorText}`,
                status: retryResponse.status
              }
            };
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (retryError) {
          console.error("❌ Failed to refresh JWT token on retry:", retryError);
          return {
            data: null,
            error: {
              message: "Unable to authenticate with backend",
              status: 401
            }
          };
        }
      }

      return {
        data: null,
        error: {
          message: `Failed to fetch membership plans: ${response.status} ${errorText}`,
          status: response.status
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch membership plans:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch membership plans",
        status: 500
      }
    };
  }
};


// Get specific pricing plans for a membership type (requires authentication)
export const getPlansForMembership = async (membershipId: string, jwtOverride?: string) => {
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = jwtOverride || (await AsyncStorage.getItem("authToken"));

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      if (jwtOverride) {
        return {
          data: null,
          error: {
            message: "Missing authentication token",
            status: 401,
            type: 'auth'
          }
        }
      }
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
        console.error("❌ Failed to refresh JWT token:", refreshError);
        return {
          data: null,
          error: {
            message: "Unable to authenticate with backend",
            status: 401,
            type: 'auth'
          }
        };
      }
    }

    // Use the endpoint: /memberships/{membershipId}/plans
    const requestUrl = `${API_URL}/memberships/${membershipId}/plans`;
    const headers = {
      "Authorization": `Bearer ${jwtToken}`,
    };

    const response = await fetch(requestUrl, {
      headers,
    });

    const handleErrorResponse = async (resp: Response) => {
      const errorText = await resp.text();
      const baseError = {
        message: `Failed to fetch plans for membership ${membershipId}: ${resp.status} ${errorText}`,
        status: resp.status,
        type: resp.status === 401 || resp.status === 403 ? 'auth' : 'api'
      } as const

      // Don't log 503 errors (known issue with incomplete membership configurations)
      if (resp.status !== 503) {
        console.error(`❌ Request failed for membership ${membershipId}:`, {
          url: requestUrl,
          status: resp.status,
          statusText: resp.statusText,
          errorBody: errorText
        });
      }

      return baseError
    }

    if (!response.ok) {
      const errorText = await response.text();

      // Don't log 503 errors (known issue with incomplete membership configurations)
      if (response.status !== 503) {
        console.error(`❌ Request failed for membership ${membershipId}:`, {
          url: requestUrl,
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
      }

      // If 401/403, try refreshing the JWT token once
      if ((response.status === 401 || response.status === 403) && !jwtOverride) {
        try {
          jwtToken = await refreshBackendJwt();

          const retryResponse = await fetch(`${API_URL}/memberships/${membershipId}/plans`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryError = await handleErrorResponse(retryResponse)
            return { data: null, error: retryError }
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (retryError) {
          console.error("❌ Failed to refresh JWT token on retry:", retryError);
          return {
            data: null,
            error: {
              message: "Unable to authenticate with backend after retry",
              status: 401,
              type: 'auth'
            }
          };
        }
      }

      return {
        data: null,
        error: await handleErrorResponse(response)
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Unexpected error while fetching plans for membership ${membershipId}:`, error);
    return {
      data: null,
      error: {
        message: (error as Error).message || `Failed to fetch plans for membership ${membershipId}`,
        status: 500,
        type: 'network'
      }
    };
  }
};

// Initiate membership plan purchase (requires authentication)
export const purchaseMembershipPlan = async (planId: string) => {
  console.log("🔵 purchaseMembershipPlan called with planId:", planId);
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");
    console.log("🔵 JWT token retrieved:", jwtToken ? "✅ exists" : "❌ missing");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      console.log("🔵 No JWT token found, attempting to refresh...");
      try {
        jwtToken = await refreshBackendJwt();
        console.log("🔵 JWT token refreshed successfully");
      } catch (refreshError) {
        console.warn("⚠️ Failed to refresh JWT token:", refreshError);
        return { data: null, error: { status: 401, message: "Unable to authenticate with backend" } } as any;
      }
    }

    // Use test mode flag to determine effective plan id
    const effectivePlanId = USE_MEMBERSHIP_TEST_MODE ? MEMBERSHIP_TEST_PLAN_ID : planId;
    console.log("🔵 Test mode:", USE_MEMBERSHIP_TEST_MODE, "| Effective plan ID:", effectivePlanId);

    const url = `${API_URL}/checkout/membership_plans/${effectivePlanId}`;
    console.log("🔵 Making POST request to:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🔵 Response status:", response.status, response.statusText);

    if (!response.ok) {
      // Try to read structured error from backend
      let errorText = await response.text();
      console.log("🔵 Error response body:", errorText);
      let errorMessage = "Failed to initiate membership purchase";
      try {
        const parsed = JSON.parse(errorText || "{}");
        errorMessage = parsed?.error?.message || errorMessage;
      } catch {}

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();

          // Retry the request with new token
          const retryResponse = await fetch(`${API_URL}/checkout/membership_plans/${effectivePlanId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            let retryMessage = errorMessage;
            try {
              const parsed = JSON.parse(retryErrorText || "{}");
              retryMessage = parsed?.error?.message || retryMessage;
            } catch {}
            // Localize 409 handling on retry path
            if (retryResponse.status === 409) {
              return { data: null, error: { status: 409, message: retryMessage } } as any;
            }

            // Return structured error instead of throwing
            return { data: null, error: { status: retryResponse.status, message: retryMessage } } as any;
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null } as any;
        } catch (refreshError) {
          console.warn("⚠️ Failed to refresh token on retry:", refreshError);
          return { data: null, error: { status: response.status, message: `Authentication failed: ${errorMessage}` } } as any;
        }
      }

      // Localize 409 handling: return structured error object instead of throwing
      if (response.status === 409) {
        return { data: null, error: { status: 409, message: errorMessage } } as any;
      }

      // Return structured error instead of throwing
      return { data: null, error: { status: response.status, message: errorMessage } } as any;
    }

    const okData = await response.json();
    console.log("✅ Purchase successful! Response data:", okData);
    return { data: okData, error: null } as any;
  } catch (error) {
    console.error("❌ Failed to purchase membership plan - Exception caught:", error);
    const anyErr: any = error;
    if (anyErr?.status === 409) {
      return { data: null, error: { status: 409, message: (error as Error).message } } as any;
    }
    return { data: null, error: { status: anyErr?.status || 500, message: (error as Error).message } } as any;
  }
};

// Initiate credit package purchase (requires authentication)
export const purchaseCreditPackage = async (packageId: string) => {
  try {
    // Get stored JWT token for backend authentication
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
        console.warn("⚠️ Failed to refresh JWT token:", refreshError);
        return {
          data: null,
          error: {
            message: "Unable to authenticate with backend",
            status: 401
          }
        };
      }
    }

    const response = await fetch(`${API_URL}/checkout/credit_packages/${packageId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to read structured error from backend
      let errorText = await response.text();
      let errorMessage = "Failed to initiate credit package purchase";
      try {
        const parsed = JSON.parse(errorText || "{}");
        errorMessage = parsed?.error?.message || errorMessage;
      } catch {}

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();

          // Retry the request with new token
          const retryResponse = await fetch(`${API_URL}/checkout/credit_packages/${packageId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            let retryMessage = errorMessage;
            try {
              const parsed = JSON.parse(retryErrorText || "{}");
              retryMessage = parsed?.error?.message || retryMessage;
            } catch {}

            return {
              data: null,
              error: {
                status: retryResponse.status,
                message: retryMessage
              }
            };
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null };
        } catch (refreshError) {
          console.warn("⚠️ Failed to refresh token on retry:", refreshError);
          return {
            data: null,
            error: {
              message: `Authentication failed: ${response.status} ${errorText}`,
              status: response.status
            }
          };
        }
      }

      return {
        data: null,
        error: {
          status: response.status,
          message: errorMessage
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.warn("⚠️ Failed to purchase credit package:", error);
    return {
      data: null,
      error: {
        status: 500,
        message: (error as Error).message || "Failed to purchase credit package"
      }
    };
  }
};

export const getMembershipByCustomerId = async (customerId: string) => {
  // Get stored JWT token for backend authentication
  let jwtToken = await AsyncStorage.getItem("authToken");

  if (!jwtToken) {
    try {
      jwtToken = await refreshBackendJwt();
    } catch (refreshError) {
      console.error("❌ Failed to refresh JWT token:", refreshError);
      return [];
    }
  }
  const response = await fetch(`${API_URL}/customers/${customerId}/memberships`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch customer membership");
  return response.json();
};

// 🔹 **Credit API Functions**

// Get current user's credit balance
export const getUserCredits = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/secure/credits`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user credits: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch user credits:", error);
    throw error;
  }
};

// 🔹 **Subsidy API Functions**

// Get user subsidy information
export const getUserSubsidies = async (): Promise<APIResponse<any>> => {
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

    const response = await fetch(`${API_URL}/subsidies/me`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/subsidies/me`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            const retryErrorType: APIErrorType = retryResponse.status === 401 ? 'auth' : 'unknown';
            const retryUserMessage = retryResponse.status === 401
              ? "Session expired. Please log in again."
              : "Unable to load subsidy information. Please try again.";

            return {
              data: null,
              error: {
                message: `Failed to fetch subsidies after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryErrorType,
                userMessage: retryUserMessage
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
          message: `Failed to fetch subsidies: ${response.status} ${errorText}`,
          status: response.status,
          type: 'unknown',
          userMessage: "Unable to load subsidy information. Please try again."
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch subsidies:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch subsidies",
        status: 500,
        type: 'network',
        userMessage: "Network error. Please check your connection and try again."
      }
    };
  }
};

// Get user subsidy balance
export const getUserSubsidyBalance = async (): Promise<APIResponse<any>> => {
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

    const response = await fetch(`${API_URL}/subsidies/me/balance`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/subsidies/me/balance`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            const retryErrorType: APIErrorType = retryResponse.status === 401 ? 'auth' : 'unknown';
            const retryUserMessage = retryResponse.status === 401
              ? "Session expired. Please log in again."
              : "Unable to load subsidy balance. Please try again.";

            return {
              data: null,
              error: {
                message: `Failed to fetch subsidy balance after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryErrorType,
                userMessage: retryUserMessage
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
          message: `Failed to fetch subsidy balance: ${response.status} ${errorText}`,
          status: response.status,
          type: 'unknown',
          userMessage: "Unable to load subsidy balance. Please try again."
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch subsidy balance:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch subsidy balance",
        status: 500,
        type: 'network',
        userMessage: "Network error. Please check your connection and try again."
      }
    };
  }
};

// Get user subsidy usage history
export const getUserSubsidyUsage = async (): Promise<APIResponse<any>> => {
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

    const response = await fetch(`${API_URL}/subsidies/me/usage`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/subsidies/me/usage`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            const retryErrorType: APIErrorType = retryResponse.status === 401 ? 'auth' : 'unknown';
            const retryUserMessage = retryResponse.status === 401
              ? "Session expired. Please log in again."
              : "Unable to load subsidy usage history. Please try again.";

            return {
              data: null,
              error: {
                message: `Failed to fetch subsidy usage after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryErrorType,
                userMessage: retryUserMessage
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
          message: `Failed to fetch subsidy usage: ${response.status} ${errorText}`,
          status: response.status,
          type: 'unknown',
          userMessage: "Unable to load subsidy usage history. Please try again."
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch subsidy usage:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch subsidy usage",
        status: 500,
        type: 'network',
        userMessage: "Network error. Please check your connection and try again."
      }
    };
  }
}

// Get all subscriptions for the authenticated customer
export const getSubscriptions = async (): Promise<APIResponse<any>> => {
  try {
    let jwtToken = await AsyncStorage.getItem("authToken");

    if (!jwtToken) {
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
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

    const response = await fetch(`${API_URL}/subscriptions`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/subscriptions`, {
            headers: { "Authorization": `Bearer ${jwtToken}` },
          });

          if (!retryResponse.ok) {
            return {
              data: null,
              error: {
                message: `Failed to fetch subscriptions: ${retryResponse.status}`,
                status: retryResponse.status,
                type: retryResponse.status === 401 ? 'auth' : 'unknown',
                userMessage: "Unable to load subscription information."
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

      return {
        data: null,
        error: {
          message: `Failed to fetch subscriptions: ${response.status} ${errorText}`,
          status: response.status,
          type: response.status >= 500 ? 'server' : 'unknown',
          userMessage: "Unable to load subscription information. Please try again."
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch subscriptions",
        status: 500,
        type: 'network',
        userMessage: "Network error. Please check your connection and try again."
      }
    };
  }
}

// Upgrade a subscription to a more expensive plan
export const upgradeSubscription = async (subscriptionId: string, newPlanId: string): Promise<APIResponse<any>> => {
  try {
    let jwtToken = await AsyncStorage.getItem("authToken");

    if (!jwtToken) {
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
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

    const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}/upgrade`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_plan_id: newPlanId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch { /* keep raw text */ }

      if (response.status === 401 || response.status === 403) {
        try {
          jwtToken = await refreshBackendJwt();
          const retryResponse = await fetch(`${API_URL}/subscriptions/${subscriptionId}/upgrade`, {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ new_plan_id: newPlanId }),
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            let retryMsg = retryErrorText;
            try {
              const retryJson = JSON.parse(retryErrorText);
              retryMsg = retryJson.message || retryJson.error || retryErrorText;
            } catch { /* keep raw text */ }

            return {
              data: null,
              error: {
                message: retryMsg,
                status: retryResponse.status,
                type: retryResponse.status === 400 ? 'validation' : retryResponse.status === 409 ? 'conflict' : 'unknown',
                userMessage: retryResponse.status === 400
                  ? "You can only upgrade to a more expensive plan."
                  : retryResponse.status === 404
                  ? "Plan not found. Please try again."
                  : retryResponse.status === 409
                  ? "Your subscription is not active."
                  : "Unable to upgrade subscription."
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

      const errorType: APIErrorType =
        response.status === 400 ? 'validation' :
        response.status === 404 ? 'not_found' :
        response.status === 409 ? 'conflict' :
        response.status >= 500 ? 'server' : 'unknown';

      const userMessage =
        response.status === 400 ? "You can only upgrade to a more expensive plan."
        : response.status === 404 ? "Plan not found. Please try again."
        : response.status === 409 ? "Your subscription is not active."
        : response.status >= 500 ? "Server error. Please try again later."
        : errorMessage;

      return {
        data: null,
        error: {
          message: errorMessage,
          status: response.status,
          type: errorType,
          userMessage
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to upgrade subscription",
        status: 500,
        type: 'network',
        userMessage: "Network error. Please check your connection and try again."
      }
    };
  }
}

import axios from "axios";
import { USE_MEMBERSHIP_TEST_MODE, MEMBERSHIP_TEST_PLAN_ID } from "./constants";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "https://api-461776259687.us-west2.run.app";


type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  countryCode: string;
  token: string;
  firebaseId: string;
  profileImage?: string;
};

export const refreshBackendJwt = async (): Promise<string> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("No user currently logged in.");

  // 🔄 Refresh Firebase token
  const firebaseToken = await firebaseUser.getIdToken(true); // true forces refresh

  // 🌐 Exchange Firebase token for new backend JWT
  const response = await axios.post(`${API_URL}/auth`, { email: firebaseUser.email }, {
    headers: { Authorization: `Bearer ${firebaseToken}` }
  });

  const jwtToken = response.headers["authorization"]?.replace("Bearer ", "") || "";
  if (!jwtToken) throw new Error("JWT not returned from backend.");

  // 🧠 Store the new JWT
  await AsyncStorage.setItem("authToken", jwtToken);
  return jwtToken;
};

// (Removed global axios interceptor to avoid global side-effects)





// 🔹 **Login User with Firebase and API**
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email.trim() || !password.trim()) {
    throw new Error("Email and password cannot be empty.");
  }

  try {
    // ✅ Firebase Login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    if (!firebaseUser) throw new Error("Failed to authenticate with Firebase.");

    // ✅ Get Firebase Token
    const token = await firebaseUser.getIdToken();

    // ✅ Call Go backend with Firebase token
    const response = await axios.post(`${API_URL}/auth`, { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ✅ Extract JWT from the *response headers*
    const authHeader = response.headers["authorization"];
    const jwtToken = authHeader?.replace("Bearer ", "") || "";


    // ✅ Return UUID from backend response as `id`
    return {
      id: (response.data as any).id,
      email: firebaseUser.email || email,
      firstName: (response.data as any).first_name || "",
      lastName: (response.data as any).last_name || "",
      role: (response.data as any).role,
      countryCode: (response.data as any).country_code || "US",
      token: jwtToken, // ✅ Now this is set correctly!
      firebaseId: firebaseUser.uid,
      profileImage: (response.data as any).photo_url || "", // ✅ Include profile image from backend
    };

  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};



//To register a child linked to a prent, you need to send the parent's token as a header in the request.
//  **Register Child with API**
export const registerChild = async (
  parentToken: string, // Parent's authentication token
  firstName: string,
  lastName: string,
  dob: string,
  countryCode: string
): Promise<any> => {
  try {
    const requestBody = {
      dob,
      first_name: firstName,
      last_name: lastName,
      country_code: countryCode,
      waivers: [
        {
          is_waiver_signed: true,
          waiver_url: `${API_URL}/swagger/index.html`,
        },
      ],
    };


    // ✅ Send request to API
    const response = await axios.post(`${API_URL}/register/child`, requestBody, {
      headers: {
        "firebase_token": parentToken,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Child registration failed:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};



// 🔹 **Register User with Firebase and API**
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: string,
  dob: string,
  phoneNumber: string,
  countryCode: string
): Promise<any> => {
  try {

    // ✅ Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
      throw new Error("Failed to create user in Firebase.");
    }

    // ✅ Retrieve Firebase Token
    const token = await firebaseUser.getIdToken(true);
    if (!token) {
      throw new Error("Failed to retrieve Firebase token.");
    }

    // ✅ Determine correct endpoint
    let endpoint = "";
    let requestBody: Record<string, any> = {};

    if (role === "athlete") {
      endpoint = "register/athlete";
      requestBody = {
        dob,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country_code: countryCode,
        has_consent_to_email_marketing: true,
        has_consent_to_sms: true,
        waivers: [
          {
            is_waiver_signed: true,
            waiver_url: `https://storage.googleapis.com/rise-sports/waivers/code.pdf`,
          },
          {
            is_waiver_signed: true,
            waiver_url: `https://storage.googleapis.com/rise-sports/waivers/tetris.pdf`, // example second waiver
          },
        ],
      };
    } else if (role === "parent") {
      endpoint = "register/parent";
      requestBody = {
        dob,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country_code: countryCode,
        has_consent_to_email_marketing: true,
        has_consent_to_sms: true,
      };
    } else if (role === "coach" || role === "instructor" || role === "barber") {
      endpoint = "register/staff";
      requestBody = {
        dob,
        first_name: firstName,
        last_name: lastName,
        role,
        phone_number: phoneNumber,
        country_code: countryCode,
        is_active_staff: true,
      };
    } else {
      throw new Error(`Unsupported role: ${role}`);
    }


    // ✅ Send request to API
    const response = await axios.post(`${API_URL}/${endpoint}`, requestBody, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      firstName,
      lastName,
      role,
      phoneNumber,
      countryCode,
      token,
    };
  } catch (error) {
    console.error("❌ Registration failed in api.ts:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

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

// 🔹 **Membership API Functions**

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
export const getUserMemberships = async () => {
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      console.log("🔄 No JWT token found, refreshing from backend...");
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
        console.log("🔄 Token expired, refreshing JWT...");
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
            return {
              data: null,
              error: {
                message: `Failed to fetch user memberships after token refresh: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status
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
              status: response.status
            }
          };
        }
      }

      return {
        data: null,
        error: {
          message: `Failed to fetch user memberships: ${response.status} ${errorText}`,
          status: response.status
        }
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Failed to fetch user memberships:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to fetch user memberships",
        status: 500
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
      console.log("🔄 No JWT token found, refreshing from backend...");
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
        console.log("🔄 Token expired, refreshing JWT...");
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
    console.log("✅ Successfully fetched membership plans:", data);
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
export const getPlansForMembership = async (membershipId: string) => {
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      console.log("🔄 No JWT token found, refreshing from backend...");
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
    console.log(`🔄 Requesting plans for membership ${membershipId} from: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Request failed for membership ${membershipId}:`, {
        url: requestUrl,
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        console.log("🔄 Token expired, refreshing JWT...");
        try {
          jwtToken = await refreshBackendJwt();

          // Retry the request with new token
          const retryResponse = await fetch(`${API_URL}/memberships/${membershipId}/plans`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            console.error(`❌ Retry request also failed for membership ${membershipId}:`, {
              status: retryResponse.status,
              statusText: retryResponse.statusText,
              errorBody: retryErrorText
            });
            return {
              data: null,
              error: {
                message: `Failed to fetch plans for membership ${membershipId}: ${retryResponse.status} ${retryErrorText}`,
                status: retryResponse.status,
                type: retryResponse.status === 401 || retryResponse.status === 403 ? 'auth' : 'api'
              }
            };
          }

          const retryData = await retryResponse.json();
          console.log(`✅ Successfully fetched ${retryData.length} plans for membership ${membershipId} on retry`);
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
        error: {
          message: `Failed to fetch plans for membership ${membershipId}: ${response.status} ${errorText}`,
          status: response.status,
          type: response.status === 401 || response.status === 403 ? 'auth' : 'api'
        }
      };
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.length} plans for membership ${membershipId}`);
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
  try {
    // Get stored JWT token for backend authentication
    // The project uses "Firebase for identity, JWT for business authorization"
    let jwtToken = await AsyncStorage.getItem("authToken");

    // If no JWT token, we need to get one from /auth endpoint using Firebase token
    if (!jwtToken) {
      console.log("🔄 No JWT token found, refreshing from backend...");
      try {
        jwtToken = await refreshBackendJwt();
      } catch (refreshError) {
        console.error("❌ Failed to refresh JWT token:", refreshError);
        throw new Error("Unable to authenticate with backend");
      }
    }

    // Use test mode flag to determine effective plan id
    const effectivePlanId = USE_MEMBERSHIP_TEST_MODE ? MEMBERSHIP_TEST_PLAN_ID : planId;

    console.log(
      `🛒 Purchasing membership plan: ${planId} (using ${USE_MEMBERSHIP_TEST_MODE ? "test" : "real"} ID: ${effectivePlanId})`
    );

    const response = await fetch(`${API_URL}/checkout/membership_plans/${effectivePlanId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to read structured error from backend
      let errorText = await response.text();
      let errorMessage = "Failed to initiate membership purchase";
      try {
        const parsed = JSON.parse(errorText || "{}");
        errorMessage = parsed?.error?.message || errorMessage;
      } catch {}

      // If 401/403, try refreshing the JWT token once
      if (response.status === 401 || response.status === 403) {
        console.log("🔄 Token expired, refreshing JWT...");
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
              console.log("Subscription already exists (409), handling locally (retry path).");
              return { data: null, error: { status: 409, message: retryMessage } } as any;
            }

            const err: any = new Error(retryMessage);
            err.status = retryResponse.status;
            throw err;
          }

          const retryData = await retryResponse.json();
          return { data: retryData, error: null } as any;
        } catch (refreshError) {
          console.error("❌ Failed to refresh token on retry:", refreshError);
          throw new Error(`Authentication failed: ${response.status} ${errorText}`);
        }
      }

      // Localize 409 handling: return structured error object instead of throwing
      if (response.status === 409) {
        console.log("Subscription already exists (409), handling locally.");
        return { data: null, error: { status: 409, message: errorMessage } } as any;
      }

      const err: any = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    const okData = await response.json();
    return { data: okData, error: null } as any;
  } catch (error) {
    console.error("❌ Failed to purchase membership plan:", error);
    const anyErr: any = error;
    if (anyErr?.status === 409) {
      return { data: null, error: { status: 409, message: (error as Error).message } } as any;
    }
    return { data: null, error: { status: anyErr?.status || 500, message: (error as Error).message } } as any;
  }
};

export const getMembershipByCustomerId = async (customerId: string) => {
  // Get stored JWT token for backend authentication
  let jwtToken = await AsyncStorage.getItem("authToken");
  
  if (!jwtToken) {
    console.log("🔄 No JWT token found, refreshing from backend...");
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

export const getPracticePrograms = async () => {
  // Get stored JWT token for backend authentication
  let jwtToken = await AsyncStorage.getItem("authToken");
  
  if (!jwtToken) {
    console.log("🔄 No JWT token found, refreshing from backend...");
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

// 🔹 **Haircut Booking API Functions**

// Get all haircut services and barbers
export const getHaircutAndBarberServices = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/haircuts/services`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch haircut services:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new haircut booking
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

// Get upcoming bookings for the authenticated user
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

// Get available time slots for a specific barber on a given date and for a given service duration
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

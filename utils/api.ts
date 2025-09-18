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
      throw new Error(`Failed to fetch membership plans: ${response.status} ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Failed to fetch membership plans:", error);
    throw error;
  }
};

// Get current user's membership details (requires authentication)
export const getUserMemberships = async () => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.warn("⚠️ Firebase user not ready. Skipping membership fetch.");
      return [];
    }

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

    // First, get customer profile to get customer_id
    const customerResponse = await fetch(`${API_URL}/customers/email/${firebaseUser.email}`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!customerResponse.ok) {
      throw new Error(`Failed to get customer profile: ${customerResponse.status}`);
    }

    const customerData = await customerResponse.json();
    const customerId = customerData.id || customerData.user_id;

    if (!customerId) {
      throw new Error("Customer ID not found in profile");
    }

    // Use the correct endpoint: /customers/{id}/memberships
    const response = await fetch(`${API_URL}/customers/${customerId}/memberships`, {
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
          const retryResponse = await fetch(`${API_URL}/customers/${customerId}/memberships`, {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            throw new Error(`Failed to fetch user memberships after token refresh: ${retryResponse.status} ${retryErrorText}`);
          }

          return retryResponse.json();
        } catch (refreshError) {
          console.error("❌ Failed to refresh token on retry:", refreshError);
          throw new Error(`Authentication failed: ${response.status} ${errorText}`);
        }
      }

      throw new Error(`Failed to fetch user memberships: ${response.status} ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Failed to fetch user memberships:", error);
    throw error;
  }
};

// Get all available membership plans (requires authentication)
export const getMembershipPlans = async () => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.warn("⚠️ Firebase user not ready. Skipping membership plans fetch.");
      return [];
    }

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
            throw new Error(`Failed to fetch membership plans: ${retryResponse.status} ${errorText}`);
          }

          return await retryResponse.json();
        } catch (retryError) {
          console.error("❌ Failed to refresh JWT token on retry:", retryError);
          throw new Error("Unable to authenticate with backend");
        }
      }

      throw new Error(`Failed to fetch membership plans: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Successfully fetched membership plans:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch membership plans:", error);
    throw error;
  }
};

// Initiate membership plan purchase (requires authentication)
export const purchaseMembershipPlan = async (planId: string) => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error("User not authenticated");
    }

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
      const errorText = await response.text();

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
            throw new Error(`Failed to initiate membership purchase after token refresh: ${retryResponse.status} ${retryErrorText}`);
          }

          return retryResponse.json();
        } catch (refreshError) {
          console.error("❌ Failed to refresh token on retry:", refreshError);
          throw new Error(`Authentication failed: ${response.status} ${errorText}`);
        }
      }

      throw new Error(`Failed to initiate membership purchase: ${response.status} ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Failed to purchase membership plan:", error);
    throw error;
  }
};

export const getMembershipByCustomerId = async (customerId: string) => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return [];
  }

  const token = await firebaseUser.getIdToken(true);
  const response = await fetch(`${API_URL}/customers/${customerId}/memberships`, {
    headers: {
      Authorization: `Bearer ${token}`,
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
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("User not logged in");

  const token = await firebaseUser.getIdToken(true);

  const res = await fetch(`${API_URL}/programs?program_type=practice`, {
    headers: {
      Authorization: `Bearer ${token}`,
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

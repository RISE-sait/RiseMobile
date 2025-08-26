import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

export const API_URL = "https://api-461776259687.us-west2.run.app";

// Helper function to ensure we have a valid JWT token
const ensureValidJWT = async (token: string, userEmail?: string): Promise<string> => {
  console.log("🔍 Token check:", {
    tokenLength: token.length,
    firstChars: token.substring(0, 30) + "...",
    hasEmail: !!userEmail
  });
  
  // If token is very long (>900 chars), it's likely a Firebase token, not JWT
  // Try to exchange it for JWT directly without relying on Firebase auth state
  if (token.length > 900 && userEmail) {
    console.log("🔄 Token seems to be Firebase token (length > 900), attempting direct exchange for JWT...");
    
    try {
      const response = await axios.post(`${API_URL}/auth`, { email: userEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 🔧 JWT token is returned in response headers, not body!
      const authHeader = response.headers['authorization'] || response.headers['Authorization'];
      const jwtToken = authHeader?.replace(/^Bearer\s+/i, '');
      
      if (jwtToken && jwtToken !== authHeader) {
        console.log("✅ Successfully exchanged Firebase token for JWT from response headers");
        console.log("🔍 JWT length:", jwtToken.length);
        return jwtToken;
      } else {
        // Fallback: try to get from response body (old method, likely to fail)
        const bodyJwtToken = response.data.token || 
                             response.data.jwt || 
                             response.data.access_token ||
                             response.data.jwt_token ||
                             response.data.authToken ||
                             response.data.accessToken;
        
        if (bodyJwtToken) {
          console.log("✅ Found JWT in response body (unexpected but working)");
          return bodyJwtToken;
        }
        
        console.warn("⚠️ Auth endpoint didn't return JWT in headers or body, using original token");
        console.warn("🔍 Auth response headers:", Object.keys(response.headers || {}));
        console.warn("🔍 Auth response body fields:", Object.keys(response.data || {}));
      }
    } catch (error) {
      console.error("❌ Failed to exchange Firebase token for JWT:", error);
      console.warn("⚠️ Will use original token and let the API call handle the error");
    }
  }
  
  return token;
};

type User = {
  id: string;
  email: string;
  firstName: string;  // ✅ Add firstName
  lastName: string;   // ✅ Add lastName
  role: string;
  countryCode: string; //
  token: string;
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

    // ✅ Retrieve Firebase Token
    const token = await firebaseUser.getIdToken();
    console.log("🔥 Firebase Token:", token);

    // ✅ Send Firebase Token to API
    const response = await axios.post(`${API_URL}/auth`, { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("API Response:", response.data); // Debug log ✅
    console.log("🔍 Full API Response keys:", Object.keys(response.data || {})); // Show all fields
    console.log("🔍 Full API Response values preview:", Object.entries(response.data || {}).map(([k,v]) => [k, typeof v === 'string' ? v.substring(0,50) + '...' : v])); // Preview values

    // 🔧 JWT token is returned in response headers, not body!
    const authHeader = response.headers['authorization'] || response.headers['Authorization']
    const jwtToken = authHeader?.replace(/^Bearer\s+/i, '')
    
    // Fallback: try to get from response body (old method, likely to fail)
    const bodyJwtToken = !jwtToken ? (
      response.data.token || 
      response.data.jwt || 
      response.data.access_token ||
      response.data.jwt_token ||
      response.data.authToken ||
      response.data.accessToken
    ) : null;
    
    const finalJwtToken = jwtToken || bodyJwtToken;
    
    console.log("🔍 Token analysis:", {
      hasHeaderToken: !!jwtToken,
      hasBodyToken: !!bodyJwtToken,
      firebaseTokenLength: token.length,
      jwtTokenLength: finalJwtToken?.length || 0,
      allResponseKeys: Object.keys(response.data || {}),
      allHeaderKeys: Object.keys(response.headers || {})
    });

    // 🔧 Check if we got JWT token from headers or body
    if (!finalJwtToken) {
      console.error("🚨 Critical: No JWT token returned from /auth endpoint in headers or body!");
      console.error("🚨 Available response fields:", Object.keys(response.data || {}));
      console.error("🚨 Available response headers:", Object.keys(response.headers || {}));
      console.error("🚨 Backend issue: /auth endpoint should return JWT in Authorization header");
      
      // Use Firebase token as fallback until backend is fixed
      console.warn("⚠️ Using Firebase token as fallback - some features may not work");
    } else {
      console.log("✅ Successfully got JWT token from backend");
    }

    return { 
      id: firebaseUser.uid, 
      email: firebaseUser.email || email, 
      firstName: response.data.first_name || "",  
      lastName: response.data.last_name || "",    
      role: response.data.role, 
      countryCode: response.data.country_code || "US", // ✅ Now it will be saved correctly!
      token: finalJwtToken || token // Must use JWT for business APIs, Firebase token as fallback only
    };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};


//To register a child linked to a prent, you need to send the parent's token as a header in the request.
// 🔹 **Register Child with API**
export const registerChild = async (
  parentToken: string, // Parent's authentication token
  firstName: string,
  lastName: string,
  age: number,
  countryCode: string
): Promise<any> => {
  try {
    const requestBody = {
      age,
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

    console.log("📤 Sending child registration request:", requestBody);

    // ✅ Send request to API
    const response = await axios.post(`${API_URL}/register/child`, requestBody, {
      headers: {
        "firebase_token": parentToken,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Child Registration Successful:", response.data);
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
  age: number,
  phoneNumber: string,
  countryCode: string
): Promise<any> => {
  try {
    const auth = getAuth();

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
    console.log("🔥 Firebase Token Retrieved:", token);

    // ✅ Determine correct endpoint
    let endpoint = "";
    let requestBody: Record<string, any> = {};

    if (role === "athlete") {
      endpoint = "register/athlete";
      requestBody = {
        age,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country_code: countryCode,
        has_consent_to_email_marketing: true,
        has_consent_to_sms: true,
        waivers: [
          {
            is_waiver_signed: true,
            waiver_url: `${API_URL}/swagger/index.html`,
          },
        ],
      };
    } else if (role === "parent") {
      endpoint = "register/parent";
      requestBody = {
        age,
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
        age,
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

    console.log(`📤 Sending API request to ${endpoint}:`, requestBody);

    // ✅ Send request to API
    const response = await axios.post(`${API_URL}/${endpoint}`, requestBody, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Registration Successful:", response.data);
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

// 🔹 **Haircut Booking API Functions**

// Get all haircut services and barbers
export const getHaircutAndBarberServices = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/haircuts/services`);
    console.log("✅ Haircut services fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch haircut services:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Create a new haircut booking
export const createHaircutBooking = async (bookingDetails: any, token: string, userEmail?: string): Promise<any> => {
  try {
    console.log("📤 Creating haircut booking:", bookingDetails);
    console.log("🔍 Using token (first 50 chars):", token.substring(0, 50) + "...");
    console.log("🔍 Token length:", token.length);
    
    // Try with Authorization Bearer header (Firebase token should work)
    const response = await axios.post(`${API_URL}/haircuts/events`, bookingDetails, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Haircut booking created:", response.data);
    return response.data;
  } catch (error) {
    // If 401 error and we have email, try to refresh with Firebase token
    if ((error as any).response?.status === 401 && userEmail) {
      console.log("🔄 JWT expired, trying to refresh via Firebase auth...");
      
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        let activeUser = currentUser;
        if (!currentUser) {
          console.warn("⚠️ Firebase auth not ready yet, waiting a moment...");
          // Wait a short moment for Firebase to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try again after waiting
          const authRetry = getAuth();
          const currentUserRetry = authRetry.currentUser;
          
          if (!currentUserRetry) {
            console.error("❌ Firebase auth still not ready after waiting");
            throw new Error("Authentication failed. Please login again.");
          } else {
            console.log("✅ Firebase auth ready after waiting");
            activeUser = currentUserRetry;
          }
        }
        
        // Get fresh Firebase token
        const firebaseToken = await activeUser.getIdToken(true);
        console.log("🔥 Got fresh Firebase token");
        console.log("🔍 Fresh token (first 50 chars):", firebaseToken.substring(0, 50) + "...");
        console.log("🔍 Fresh token length:", firebaseToken.length);
        console.log("✅ Using fresh Firebase token directly, retrying booking creation");
        
        // Retry with fresh Firebase token (no JWT exchange needed)
        const response = await axios.post(`${API_URL}/haircuts/events`, bookingDetails, {
          headers: {
            "Authorization": `Bearer ${firebaseToken}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("✅ Haircut booking created with fresh Firebase token:", response.data);
        return response.data;
      } catch (refreshError) {
        console.error("❌ Failed to refresh token and create booking:", refreshError);
        console.error("❌ Refresh error details:", (refreshError as any).response?.data || refreshError);
        throw new Error("Authentication failed. Please login again.");
      }
    }
    
    console.error("❌ Failed to create haircut booking:", (error as any).response?.data || (error as any).message);
    console.error("❌ Initial request error details:", {
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      data: (error as any).response?.data,
      headers: (error as any).response?.headers,
    });
    throw error;
  }
};

// Get upcoming bookings for the authenticated user  
export const getUpcomingBookings = async (token: string, userEmail?: string): Promise<any> => {
  try {
    console.log("🔄 Fetching upcoming bookings");
    
    // Try with Authorization Bearer header (Firebase token should work)
    const response = await axios.get(`${API_URL}/bookings/upcoming`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    console.log("✅ Upcoming bookings fetched:", response.data);
    return response.data;
  } catch (error) {
    // If 401 error and we have email, try to refresh with Firebase token
    if ((error as any).response?.status === 401 && userEmail) {
      console.log("🔄 JWT expired, trying to refresh via Firebase auth...");
      
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.warn("⚠️ Firebase auth not ready yet (app startup timing issue)");
          console.warn("⚠️ Skipping token refresh - this is likely a timing issue on app load");
          // Re-throw the original 401 error, don't force re-login
          throw error;
        }
        
        // Get fresh Firebase token
        const firebaseToken = await currentUser.getIdToken(true);
        console.log("🔥 Got fresh Firebase token");
        console.log("✅ Using fresh Firebase token directly, retrying bookings request");
        
        // Retry with fresh Firebase token (no JWT exchange needed)
        const response = await axios.get(`${API_URL}/bookings/upcoming`, {
          headers: {
            "Authorization": `Bearer ${firebaseToken}`,
          },
        });
        
        console.log("✅ Upcoming bookings fetched with fresh Firebase token:", response.data);
        return response.data;
      } catch (refreshError) {
        console.error("❌ Failed to refresh JWT and fetch bookings:", refreshError);
        throw new Error("Authentication failed. Please login again.");
      }
    }
    
    console.error("❌ Failed to fetch upcoming bookings:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

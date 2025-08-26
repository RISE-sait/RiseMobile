import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

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

    // ✅ Extract JWT from the *response headers*
    const authHeader = response.headers["authorization"];
    const jwtToken = authHeader?.replace("Bearer ", "") || "";

    console.log("✅ Extracted JWT from headers:", jwtToken);

    // ✅ Return UUID from backend response as `id`
    return {
      id: response.data.id,
      email: firebaseUser.email || email,
      firstName: response.data.first_name || "",
      lastName: response.data.last_name || "",
      role: response.data.role,
      countryCode: response.data.country_code || "US",
      token: jwtToken, // ✅ Now this is set correctly!
      firebaseId: firebaseUser.uid,
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

export const getMembershipByCustomerId = async (customerId: string) => {
  const firebaseUser = getAuth().currentUser;

  if (!firebaseUser) {
    console.warn("⚠️ Firebase user not ready. Skipping membership fetch.");
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
  const firebaseUser = getAuth().currentUser;
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
    
    const response = await axios.post(`${API_URL}/haircuts/events`, bookingDetails, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Haircut booking created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create haircut booking:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

// Get upcoming bookings for the authenticated user  
export const getUpcomingBookings = async (token: string): Promise<any> => {
  try {
    console.log("🔄 Fetching upcoming bookings");
    
    const response = await axios.get(`${API_URL}/bookings/upcoming`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    console.log("✅ Upcoming bookings fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch upcoming bookings:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

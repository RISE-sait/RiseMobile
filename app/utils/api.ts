import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export const API_URL = "https://api-461776259687.us-west2.run.app";

type User = {
  id: string;
  email: string;
  firstName: string;  // ✅ Add firstName
  lastName: string;   // ✅ Add lastName
  role: "athlete" | "instructor" | "coach";
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
      headers: { firebase_token: token }
    });

    console.log("API Response:", response.data); // Debug log ✅

    // ✅ Fix: Ensure countryCode is included!
    return { 
      id: firebaseUser.uid, 
      email: firebaseUser.email || email, 
      firstName: response.data.first_name || "",  
      lastName: response.data.last_name || "",    
      role: response.data.role, 
      countryCode: response.data.country_code || "US", // ✅ Now it will be saved correctly!
      token 
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
        "firebase_token": parentToken, // ✅ Use parent's token for authentication
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
    } else if (role === "coach" || role === "instructor") {
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
        "firebase_token": token,
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

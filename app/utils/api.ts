import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

const API_URL = "https://api-461776259687.us-west2.run.app";

type User = {
  id: string;
  email: string;
  role: "athlete" | "instructor" | "coach";
  token: string;
};

// ✅ Decode JWT Token
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    throw new Error("Invalid JWT");
  }
};

// ✅ Extract Role from Token
const getRoleFromToken = (token: string): "athlete" | "instructor" | "coach" => {
  const decoded = decodeJWT(token);
  if (decoded.role) {
    switch (decoded.role.toLowerCase()) {
      case "athlete":
        return "athlete";
      case "instructor":
        return "instructor";
      case "coach":
        return "coach";
      default:
        throw new Error(`Invalid role in token: ${decoded.role}`);
    }
  }
  throw new Error("Role missing in token payload");
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
      headers: {firebase_token: token}
    });

    console.log("API Response:", response.data);
    
    // ✅ Return API response (including the role)
    return { 
      id: firebaseUser.uid, 
      email: firebaseUser.email || email, 
      role: response.data.role, 
      token 
    };
  } catch (error) {
    console.error("Error logging in:", error);
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
  age: number
): Promise<any> => {
  try {
    const auth = getAuth();

    // ✅ Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
      throw new Error("Failed to create user in Firebase.");
    }

    // ✅ Retrieve a fresh Firebase Authentication Token
    const token = await firebaseUser.getIdToken(true); // <-- `true` forces refresh
    if (!token) {
      throw new Error("Failed to retrieve Firebase token.");
    }
    console.log("🔥 Firebase Token Retrieved:", token);

    // ✅ Prepare API request body
    const requestBody = {
      age,
      first_name: firstName,
      last_name: lastName,
      waivers: [
        {
          is_waiver_signed: true,
          waiver_url: `${API_URL}/swagger/index.html`,
        },
      ],
    };

    console.log("📤 Sending API request:", requestBody);

    // ✅ Ensure correct header key and format
    const response = await axios.post(`${API_URL}/register/customer`, requestBody, {
      headers: { 
        "firebase_token": token,  // 🔹 If API expects token under a different key
        "Content-Type": "application/json",
      },      
    });

    console.log("✅ Registration Successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Registration failed in api.ts:", (error as any).response?.data || (error as any).message);
    throw error;
  }
};

import axios from "axios";

const API_URL = "http://10.0.2.2:8080/api/auth/traditional/login"; // Replace with your backend URL

type User = {
  id: string;
  email: string;
  role: "athlete" | "instructor" | "coach";
  token: string;
};

// Function to decode JWT and determine role
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
    const decoded = JSON.parse(jsonPayload);
    console.log("Decoded JWT Payload:", decoded); // Log the decoded payload
    return decoded;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    throw new Error("Invalid JWT");
  }
};


// Function to extract role from decoded JWT
const decodeRoleFromToken = (token: string): User["role"] => {
  const decoded = decodeJWT(token);
  if (decoded.role !== undefined) {
    switch (decoded.role) {
      case 0:
        return "athlete";
      case 4:
        return "instructor";
      case 3:
        return "coach";
      default:
        throw new Error("Invalid role value in token");
    }
  }
  throw new Error("Role is missing in the token payload");
};

// Login API
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email.trim() || !password.trim()) {
    throw new Error("Email and password cannot be empty.");
  }

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const responseBody = await response.text();
      console.log("Response body:", responseBody);
      throw new Error(`Failed to login. Server responded with status: ${response.status}`);
    }

    // Extract token from headers
    const token = response.headers.get("Authorization") || response.headers.get("x-auth-token");
    if (!token) {
      throw new Error("Token is missing in response headers");
    }

    console.log("Token:", token);

    // Decode the role and other details from the JWT
    const role = decodeRoleFromToken(token);
    const decoded = decodeJWT(token);

    return { id: decoded.id || "", email: decoded.email || email, role, token };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};




// Register API
export const registerUser = async (
  email: string,
  password: string,
  role: string
): Promise<User> => {
  const response = await axios.post(`${API_URL}/register`, { email, password, role });
  return response.data;
};

// Fetch role-specific data (example for athlete matches)
export const fetchAthleteMatches = async (token: string) => {
  const response = await axios.get(`${API_URL}/athlete/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add more API calls as needed

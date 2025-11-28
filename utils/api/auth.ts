import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { API_URL } from "./core/constants";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  countryCode: string;
  phoneNumber?: string;
  token: string;
  firebaseId: string;
  profileImage?: string;
  team?: {
    id?: string;
    logo?: string;
    name?: string;
  };
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


    // ✅ Map team data from athlete_info if available
    const athleteInfo = (response.data as any).athlete_info;
    const teamData = athleteInfo?.team_logo_url ? {
      id: athleteInfo.team_id,
      logo: athleteInfo.team_logo_url,
      // Note: Backend does not provide team_name, so name will be undefined
    } : undefined;

    // ✅ Return UUID from backend response as `id`
    return {
      id: (response.data as any).id,
      email: firebaseUser.email || email,
      firstName: (response.data as any).first_name || "",
      lastName: (response.data as any).last_name || "",
      role: (response.data as any).role,
      countryCode: (response.data as any).country_code || "US",
      phoneNumber: (response.data as any).phone || (response.data as any).phone_number || "", // ✅ Include phone number from backend
      token: jwtToken, // ✅ Now this is set correctly!
      tokenIssuedAt: Date.now(),
      firebaseId: firebaseUser.uid,
      profileImage: (response.data as any).photo_url || "", // ✅ Include profile image from backend
      team: teamData, // ✅ Include team data from athlete_info if available
    } as User;

  } catch (error: any) {
    console.error("Error logging in:", error);
    if (__DEV__) {
      console.log("🔍 Error response data:", error.response?.data);
      console.log("🔍 Error response status:", error.response?.status);
    }

    // ✅ Handle 403 Forbidden errors with detailed error messages
    if (error.response?.status === 403) {
      // Extract error message from various possible formats
      const errorData = error.response?.data;

      // Handle nested error formats: {error: {message: "..."}} or {message: "..."}
      let errorMessage = "";
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (errorData?.msg) {
        errorMessage = errorData.msg;
      }

      if (__DEV__) {
        console.log("🔍 Extracted error message:", errorMessage);
      }

      // Safe toLowerCase check
      const errorMessageLower = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : "";

      // Check for specific account status errors
      if (errorMessageLower.includes("suspended") || errorMessageLower.includes("suspend")) {
        const customError: any = new Error("ACCOUNT_SUSPENDED");
        customError.code = "ACCOUNT_SUSPENDED";
        customError.message = "Your account has been suspended. Please contact support for assistance.";
        throw customError;
      }

      if (errorMessageLower.includes("banned") || errorMessageLower.includes("ban")) {
        const customError: any = new Error("ACCOUNT_BANNED");
        customError.code = "ACCOUNT_BANNED";
        customError.message = "Your account has been banned. Please contact support for assistance.";
        throw customError;
      }

      if (errorMessageLower.includes("verify") || errorMessageLower.includes("verification")) {
        const customError: any = new Error("EMAIL_NOT_VERIFIED");
        customError.code = "EMAIL_NOT_VERIFIED";
        customError.email = email;
        throw customError;
      }

      // Generic 403 error with fallback message
      const customError: any = new Error("PERMISSION_DENIED");
      customError.code = "PERMISSION_DENIED";
      customError.message = typeof errorMessage === 'string' && errorMessage
        ? errorMessage
        : "Access denied. Please check your account status.";
      throw customError;
    }

    throw error;
  }
};

// 🔹 **Verify Email with Token**
export const verifyEmail = async (token: string): Promise<{ message: string; verified: boolean }> => {
  try {
    console.log("🔍 Verifying email with token:", token?.substring(0, 20) + "...");
    const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
    console.log("✅ Verification response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Email verification failed:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// 🔹 **Resend Verification Email**
export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  try {
    console.log("📧 Resending verification email to:", email);
    const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
    console.log("✅ Resend response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Resend verification failed:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
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
  countryCode: string,
  athleteFields?: {
    gender: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelationship: string
  }
): Promise<any> => {
  try {
    // 🔹 Validate and clean inputs
    const cleanEmail = email?.trim() || "";
    const cleanPassword = password?.trim() || "";

    console.log("📧 Registration attempt:", {
      email: cleanEmail,
      emailLength: cleanEmail.length,
      hasEmail: !!cleanEmail,
      role,
    });

    if (!cleanEmail || !cleanPassword) {
      throw new Error("Email and password are required");
    }

    // ✅ Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
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
        gender: athleteFields?.gender || "M",
        emergency_contact_name: athleteFields?.emergencyContactName || "",
        emergency_contact_phone: athleteFields?.emergencyContactPhone || "",
        emergency_contact_relationship: athleteFields?.emergencyContactRelationship || "",
        has_consent_to_email_marketing: true,
        has_consent_to_sms: true,
        waivers: [
          {
            is_waiver_signed: true,
            waiver_url: `https://storage.googleapis.com/rise-sports/waivers/terms.pdf`,
          },
          {
            is_waiver_signed: true,
            waiver_url: `https://storage.googleapis.com/rise-sports/waivers/waiver.pdf`,
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
      email: firebaseUser.email || cleanEmail,
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

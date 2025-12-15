import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebase/firebaseConfig";
import { API_URL } from "./constants";

/**
 * Refresh backend JWT token using Firebase token
 * @returns New JWT token
 */
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

// Note: Global axios interceptor removed to avoid global side-effects

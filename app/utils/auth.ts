import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "./api"; // Import API functions
import { auth } from "../../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential, OAuthProvider } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";

type User = {
  id: string;
  email: string;
  role: "athlete" | "instructor" | "coach";
  token: string;
};

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "238537761671-vf9tu3vu85hnpm6r56bael9pm5b3k63b.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({ 
      native: "myapp://redirect",
    }),
    scopes: ["profile", "email"],
  });

  // 🔹 Load user from AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Ensure role is lowercase for consistency
        const userRole = parsedUser.role.toLowerCase();

        switch (userRole) {
          case "athlete":
            router.replace("/(athlete)/(tabs)/home");
            break;
          case "instructor":
            router.replace("/(instructor)/instructorHome");
            break;
          case "coach":
            router.replace("/(coach)/coachHome");
            break;
          default:
            console.error("❌ Unknown role:", userRole);
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsAuthLoaded(true);
    }
  };

  // 🔹 Save user data to AsyncStorage
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("authToken", userData.token);
      console.log("User and Token saved successfully.");
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  // 🔹 Login Function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("📢 Logging in...");
      const userData = await loginUser(email, password);
      setUser(userData);
      await saveUserToStorage(userData);

      console.log("✅ Login successful:", userData);

      const userRole = userData.role.toLowerCase();

      switch (userRole) {
        case "athlete":
          console.log("🏀 Navigating to Athlete Home...");
          router.replace("/(athlete)/(tabs)/home");
          break;
        case "instructor":
          console.log("📚 Navigating to Instructor Home...");
          router.replace("/(instructor)/instructorHome");
          break;
        case "coach":
          console.log("🏆 Navigating to Coach Home...");
          router.replace("/(coach)/coachHome");
          break;
        default:
          console.error("❌ Unknown role:", userRole);
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Register Function
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    age: number
  ) => {
    setIsLoading(true);

    try {
      console.log("📢 Calling register function from useAuth.ts...");

      // ✅ Ensure correct parameters are passed
      const userData = await registerUser(email, password, firstName, lastName, role, age);

      // ✅ Store user data locally
      setUser(userData);
      await saveUserToStorage(userData);

      console.log("✅ User Registered Successfully:", userData);

      // ✅ Redirect to login after successful registration
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("❌ Registration failed in useAuth.ts:", (error as any).response?.data || (error as any).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseUser = userCredential.user;

        if (!firebaseUser) {
          throw new Error("Failed to authenticate with Firebase.");
        }

        // ✅ Get Firebase Authentication Token
        const token = await firebaseUser.getIdToken();
        console.log("🔥 Firebase Token:", token);

        // ✅ Store User in AsyncStorage
        const userData: User = { id: firebaseUser.uid, email: firebaseUser.email || "", role: "athlete", token };
        setUser(userData);
        await saveUserToStorage(userData);

        router.replace("/(athlete)/(tabs)/home"); // Redirect
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  // 🔹 Apple Login
  const loginWithApple = async () => {
    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        throw new Error("Apple Authentication is not available on this device");
      }

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const credential = new OAuthProvider("apple.com").credential({
        idToken: appleCredential.identityToken!,
      });

      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      const token = await firebaseUser.getIdToken();
      console.log("🔥 Apple Firebase Token:", token);

      const userData: User = { id: firebaseUser.uid, email: firebaseUser.email || "", role: "athlete", token };
      setUser(userData);
      await saveUserToStorage(userData);

      router.replace("/(athlete)/(tabs)/home");
    } catch (error) {
      console.error("Apple Login Error:", error);
      throw error;
    }
  };

  // 🔹 Logout Function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  return {
    user,
    isLoading,
    isAuthLoaded,
    login,
    register, // ✅ Ensure `register` is inside return statement
    loginWithGoogle,
    loginWithApple,
    logout,
  };
};

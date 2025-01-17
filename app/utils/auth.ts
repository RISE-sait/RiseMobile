import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "./api"; // Import API functions

type User = {
  id: string;
  email: string;
  role: "athlete" | "instructor" | "coach";
  token: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // For initial auth check

  // Persist user data in AsyncStorage
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  // Load user data from AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Redirect based on role
        if (parsedUser.role === "athlete") {
          router.replace("/(athlete)/home");
        } else if (parsedUser.role === "instructor") {
          router.replace("/(instructor)/instructorHome");
        } else if (parsedUser.role === "coach") {
          router.replace("/(coach)/coachHome");
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsAuthLoaded(true); // Ensure app knows auth check is complete
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true); // Start loading
    try {
      const userData = await loginUser(email, password); // Call API
      setUser(userData);
      await saveUserToStorage(userData); // Persist login data

      // Redirect based on role
      if (userData.role === "athlete") {
        router.replace("/(athlete)/home");
      } else if (userData.role === "instructor") {
        router.replace("/(instructor)/instructorHome");
      } else if (userData.role === "coach") {
        router.replace("/(coach)/coachHome");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Register function
  const register = async (email: string, password: string, role: string) => {
    setIsLoading(true); // Start loading
    try {
      const userData = await registerUser(email, password, role); // Call API
      setUser(userData);
      router.replace("/(auth)/login"); // Redirect to login after registration
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Clear stored user data
      setUser(null);
      router.replace("/(auth)/login"); // Redirect to login
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Load auth state on app load
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  return { user, isLoading, isAuthLoaded, login, register, logout };
};

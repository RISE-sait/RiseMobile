import { useState } from "react";
import { router } from "expo-router";
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

  const login = async (email: string, password: string) => {
    setIsLoading(true); // Start loading
    try {
      const userData = await loginUser(email, password); // Call API
      setUser(userData);

      // Redirect based on role
      if (userData.role === "athlete") {
        router.replace("/(athlete)/home");
      } else if (userData.role === "instructor") {
        router.replace("/(instructor)/home");
      } else if (userData.role === "coach") {
        router.replace("/(coach)/home");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false); // End loading
    }
  };

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

  const logout = () => {
    setUser(null);
    router.replace("/(auth)/login"); // Redirect to login after logout
  };

  return { user, isLoading, login, register, logout }; // Expose `isLoading`
};

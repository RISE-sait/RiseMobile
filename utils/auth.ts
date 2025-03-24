import { useState, useEffect } from "react"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { loginUser, registerUser } from "./api" // Import API functions
import { auth } from "@/firebase/firebaseConfig"
import { GoogleAuthProvider, signInWithCredential, OAuthProvider } from "firebase/auth"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as AppleAuthentication from "expo-apple-authentication"
import { makeRedirectUri } from "expo-auth-session"
import axios from "axios"
import { API_URL } from "./api"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  countryCode: string
  token: string
  isAuthenticated?: boolean // Make this optional for Redux compatibility
}

WebBrowser.maybeCompleteAuthSession()

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "238537761671-vf9tu3vu85hnpm6r56bael9pm5b3k63b.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "myapp://redirect",
    }),
    scopes: ["profile", "email"],
  })

  // 🔹 Load user from AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)

        console.log("📢 Loaded stored user:", parsedUser)

        setUser({
          ...parsedUser,
          firstName: parsedUser.firstName || (parsedUser.displayName?.split(" ")[0] ?? ""),
          lastName: parsedUser.lastName || (parsedUser.displayName?.split(" ")[1] ?? ""),
        })

        // DO NOT navigate here - this causes the error
        // Instead, the index.tsx file will handle navigation based on user state
      }
    } catch (error) {
      console.error("❌ Failed to load user data:", error)
    } finally {
      setIsAuthLoaded(true)
    }
  }

  // 🔹 Save user data to AsyncStorage
  const saveUserToStorage = async (userData: User) => {
    try {
      console.log("📢 Saving user to AsyncStorage:", userData)

      if (!userData.countryCode) {
        console.warn("⚠️ Missing countryCode in userData, defaulting to 'US'")
        userData.countryCode = "US" // ✅ Prevent undefined values
      }

      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.setItem("authToken", userData.token)

      console.log("✅ User and Token saved successfully.")
    } catch (error) {
      console.error("❌ Failed to save user data:", error)
    }
  }

  // 🔹 Login Function - Modified to return the user object
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      console.log("📢 Logging in...")
      const userData = await loginUser(email, password)
      setUser(userData)
      await saveUserToStorage(userData)

      console.log("✅ Login successful:", userData)

      const userRole = userData.role.toLowerCase()

      // Now it's safe to navigate after login
      switch (userRole) {
        case "athlete":
          console.log("🏀 Navigating to Athlete Home...")
          router.replace("/(athlete)/(tabs)/home")
          break
        case "instructor":
          console.log("📚 Navigating to Instructor Home...")
          router.replace("/(instructor)/(tabs)/instructorHome")
          break
        case "coach":
          console.log("🏆 Navigating to Coach Home...")
          router.replace("/(coach)/(tabs)/coachHome")
          break
        case "parent":
          console.log("👨‍👩‍👧‍👦 Navigating to Parent Home...")
          router.replace("/(parent)/(tabs)/home")
          break
        case "barber":
          console.log("💇 Navigating to Barber Home...")
          router.replace("/(barber)/(tabs)/home")
          break
        default:
          console.error("❌ Unknown role:", userRole)
      }

      // Return the user object for Redux
      return userData
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Register Function
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    age: number,
    phoneNumber: string,
    countryCode: string,
  ) => {
    setIsLoading(true)

    try {
      console.log("📢 Sending registration request...")

      // ✅ Send registration request (DO NOT store user yet)
      const userData = await registerUser(
        email,
        password,
        firstName,
        lastName,
        role.toLowerCase(), // 🔹 Ensure lowercase role
        age,
        phoneNumber,
        countryCode,
      )

      console.log("✅ Registration request successful, awaiting approval...")

      // ❌ DO NOT automatically log the user in!
      // setUser(userData);
      // await saveUserToStorage(userData);

      // ✅ Instead, show verification pending screen
      return userData
    } catch (error) {
      console.error("❌ Registration failed in useAuth.ts:", (error as any).response?.data || (error as any).message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerChild = async (
    parentToken: string, // ✅ Parent's Firebase token is required
    firstName: string,
    lastName: string,
    age: number,
    countryCode: string,
  ): Promise<any> => {
    setIsLoading(true)

    try {
      console.log("📢 Sending child registration request...")

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
      }
      console.log("📤 Child registration request body:", JSON.stringify(requestBody))
      console.log("🔑 Using parent token:", parentToken.substring(0, 10) + "...")

      // ✅ Send request to API using parent's token
      const response = await axios.post(`${API_URL}/register/child`, requestBody, {
        headers: {
          firebase_token: parentToken,
          "Content-Type": "application/json",
        },
      })

      console.log("✅ Child Registration Successful:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Child registration failed:", (error as any).response?.data || (error as any).message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Google Login - Modified to return the user object
  const loginWithGoogle = async (): Promise<User> => {
    try {
      const result = await promptAsync()
      if (result.type === "success") {
        const { id_token } = result.params
        const credential = GoogleAuthProvider.credential(id_token)
        const userCredential = await signInWithCredential(auth, credential)
        const firebaseUser = userCredential.user

        if (!firebaseUser) {
          throw new Error("Failed to authenticate with Firebase.")
        }

        // ✅ Get Firebase Authentication Token
        const token = await firebaseUser.getIdToken()
        console.log("🔥 Firebase Token:", token)

        // ✅ Send Firebase Token to API for verification and user details
        const response = await axios.post(
          `${API_URL}/auth`,
          { email: firebaseUser.email },
          {
            headers: { firebase_token: token },
          },
        )

        console.log("API Response:", response.data)

        // ✅ Extract user details from API response
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          role: response.data.role.toLowerCase(), // Ensure lowercase role
          countryCode: response.data.country_code || "US",
          token,
        }

        // ✅ Save user in AsyncStorage
        setUser(userData)
        await saveUserToStorage(userData)

        console.log("✅ Google Login Successful:", userData)

        // ✅ Redirect Based on Role
        switch (userData.role) {
          case "athlete":
            router.replace("/(athlete)/(tabs)/home")
            break
          case "coach":
            router.replace("/(coach)/(tabs)/coachHome")
            break
          case "instructor":
            router.replace("/(instructor)/(tabs)/instructorHome")
            break
          case "parent":
            router.replace("/(parent)/(tabs)/home")
            break
          case "barber":
            router.replace("/(barber)/(tabs)/home")
            break
          default:
            console.error("❌ Unknown role:", userData.role)
            router.replace("/(auth)/login")
        }

        // Return the user object for Redux
        return userData
      } else {
        throw new Error("Google login was cancelled or failed")
      }
    } catch (error) {
      console.error("Google Login Error:", error)
      throw error
    }
  }

  // 🔹 Apple Login - Modified to return the user object
  const loginWithApple = async (): Promise<User> => {
    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        throw new Error("Apple Authentication is not available on this device.")
      }

      // 🔹 Apple Sign-In
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!appleCredential.identityToken) {
        throw new Error("Apple Identity Token is missing.")
      }

      // 🔹 Convert Apple credentials into Firebase credential
      const credential = new OAuthProvider("apple.com").credential({
        idToken: appleCredential.identityToken,
      })

      // 🔹 Sign in with Firebase
      const userCredential = await signInWithCredential(auth, credential)
      const firebaseUser = userCredential.user

      if (!firebaseUser) {
        throw new Error("Failed to authenticate with Firebase.")
      }

      // 🔹 Retrieve Firebase Authentication Token
      const token = await firebaseUser.getIdToken()
      console.log("🔥 Apple Firebase Token:", token)

      // 🔹 Send Firebase Token to API to get user details
      const response = await axios.post(
        `${API_URL}/auth`,
        { email: firebaseUser.email },
        {
          headers: { firebase_token: token },
        },
      )

      console.log("API Response:", response.data)

      // 🔹 Extract user details from API response
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        role: response.data.role.toLowerCase(), // Ensure lowercase role
        countryCode: response.data.country_code || "US",
        token,
      }

      // 🔹 Save user in AsyncStorage
      setUser(userData)
      await saveUserToStorage(userData)

      console.log("✅ Apple Login Successful:", userData)

      // 🔹 Redirect Based on Role
      switch (userData.role) {
        case "athlete":
          router.replace("/(athlete)/(tabs)/home")
          break
        case "coach":
          router.replace("/(coach)/(tabs)/coachHome")
          break
        case "instructor":
          router.replace("/(instructor)/(tabs)/instructorHome")
          break
        case "parent":
          router.replace("/(parent)/(tabs)/home")
          break
        case "barber":
          router.replace("/(barber)/(tabs)/home")
          break
        default:
          console.error("❌ Unknown role:", userData.role)
          router.replace("/(auth)/login")
      }

      // Return the user object for Redux
      return userData
    } catch (error) {
      console.error("Apple Login Error:", error)
      throw error
    }
  }

  // 🔹 Logout Function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user")
      setUser(null)
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("Failed to log out:", error)
    }
  }

  useEffect(() => {
    loadUserFromStorage()
  }, [])

  return {
    user,
    isLoading,
    isAuthLoaded,
    login,
    register,
    registerChild,
    loginWithGoogle,
    loginWithApple,
    logout,
  }
}


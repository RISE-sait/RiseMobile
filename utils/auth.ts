import { useState, useEffect } from "react"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { loginUser, registerUser, verifyEmail as apiVerifyEmail, resendVerificationEmail as apiResendVerificationEmail } from "./api" // Import API functions
import { auth } from "@/firebase/firebaseConfig"
import { GoogleAuthProvider, signInWithCredential, OAuthProvider, onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as AppleAuthentication from "expo-apple-authentication"
import { makeRedirectUri } from "expo-auth-session"
import axios from "axios"
import { API_URL } from "./api"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { setUser as setReduxUser, logout as reduxLogout } from "@/store/slices/userSlice"
import { clearPractices } from "@/store/slices/practicesSlice"
import { clearMatches } from "@/store/slices/gamesSlice"
import { clearMembership } from "@/store/slices/membershipSlice"
import { persistor } from "@/store"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  countryCode: string
  token: string
  profileImage?: string
  isAuthenticated?: boolean // Make this optional for Redux compatibility
}

WebBrowser.maybeCompleteAuthSession()

export const useAuth = () => {
  const dispatch = useDispatch()
  const reduxUser = useSelector((state: RootState) => state.user.data)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false) // 🔹 Prevent concurrent loading

  // Use Redux user state as primary source of truth
  const user = reduxUser

  const [, , promptAsync] = Google.useAuthRequest({
    clientId: "238537761671-vf9tu3vu85hnpm6r56bael9pm5b3k63b.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "myapp://redirect",
    }),
    scopes: ["profile", "email"],
  })

  // 🔹 Verify token validity with backend
  const verifyTokenWithBackend = async (token: string, email: string): Promise<boolean> => {
    try {
      // Try to get upcoming bookings as a way to verify token validity
      await axios.get(`${API_URL}/bookings/upcoming`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      return true
    } catch (error) {
      console.warn("⚠️ Token verification failed:", (error as any).response?.status)
      return false
    }
  }

  // 🔹 Refresh Firebase token and exchange for JWT
  const refreshAndExchangeToken = async (firebaseUser: FirebaseUser): Promise<string | null> => {
    try {
      const freshFirebaseToken = await firebaseUser.getIdToken(true) // Force refresh
      
      // Exchange for JWT
      const response = await axios.post(`${API_URL}/auth`, 
        { email: firebaseUser.email },
        { headers: { Authorization: `Bearer ${freshFirebaseToken}` } }
      )
      
      // 🔧 JWT token is returned in response headers, not body!
      const authHeader = response.headers['authorization'] || response.headers['Authorization']
      const jwtToken = authHeader?.replace(/^Bearer\s+/i, '')
      
      if (jwtToken && jwtToken !== authHeader) {
        return jwtToken
      } else {
        // Fallback: try to get from response body (old method)
        const bodyJwtToken = response.data.token || response.data.jwt || response.data.access_token
        if (bodyJwtToken) {
          return bodyJwtToken
        }
        
        console.error("❌ No JWT returned from auth endpoint")
        return null
      }
    } catch (error) {
      console.error("❌ Failed to refresh and exchange token:", error)
      return null
    }
  }

  // 🔹 Load user from Redux Persist only - no direct AsyncStorage access
  const loadUserFromStorage = async () => {
    try {
      // 🔹 Use Redux user state as primary source, not AsyncStorage
      if (reduxUser) {
        // If Firebase user is available, verify token validity
        if (firebaseUser && reduxUser.token) {
          const isTokenValid = await verifyTokenWithBackend(reduxUser.token, reduxUser.email)
          
          if (!isTokenValid) {
            const newToken = await refreshAndExchangeToken(firebaseUser)
            
            if (newToken) {
              const updatedUser = { ...reduxUser, token: newToken }
              dispatch(setReduxUser(updatedUser)) // ✅ Only update Redux, no AsyncStorage
              setAuthError(null)
            } else {
              console.error("❌ Failed to refresh token, user needs to re-login")
              setAuthError("Authentication expired. Please log in again.")
              dispatch(reduxLogout()) // ✅ Only clear Redux
              setIsAuthLoaded(true)
              return
            }
          }
        }

        const userToSet = {
          ...reduxUser,
          firstName: reduxUser.firstName || (reduxUser.displayName?.split(" ")[0] ?? ""),
          lastName: reduxUser.lastName || (reduxUser.displayName?.split(" ")[1] ?? ""),
        }
        
        // ✅ User is already in Redux from persist, just ensure it's properly set
        if (JSON.stringify(reduxUser) !== JSON.stringify(userToSet)) {
          dispatch(setReduxUser(userToSet))
        }
        
        
        setAuthError(null)
        setIsAuthLoaded(true)
      } else {
        setIsAuthLoaded(true)
      }
    } catch (error) {
      console.error("❌ Failed to load user data:", error)
      setAuthError("Failed to load authentication data")
      setIsAuthLoaded(true)
    }
  }

  // 🔹 Save user data to Redux only - Redux Persist handles AsyncStorage
  const saveUserToRedux = async (userData: User) => {
    try {
      if (!userData.countryCode) {
          userData.countryCode = "US" // ✅ Prevent undefined values
      }

      // ✅ Only save to Redux - Redux Persist will handle AsyncStorage automatically
      dispatch(setReduxUser(userData))
    } catch (error) {
      console.error("❌ Failed to save user data to Redux:", error)
    }
  }

  // 🔹 Login Function - Modified to return the user object
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      const userData = await loginUser(email, password)
      dispatch(setReduxUser(userData))
      await saveUserToRedux(userData)

      const userRole = userData.role.toLowerCase()


      // Now it's safe to navigate after login
      switch (userRole) {
        case "athlete":
          router.replace("/(athlete)/(tabs)/home")
          break
        case "coach":
          router.replace("/(coach)/(tabs)/coachHome")
          break
        default:
          console.error("❌ Unknown role:", userRole)
          // Fallback to athlete for unknown roles
          router.replace("/(athlete)/(tabs)/home")
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
    dob: string, // ✅ Change from age:number → dob:string
    phoneNumber: string,
    countryCode: string,
  ) => {
    setIsLoading(true)

    try {
      // ✅ Send registration request (DO NOT store user yet)
      const userData = await registerUser(
        email,
        password,
        firstName,
        lastName,
        role.toLowerCase(), // 🔹 Ensure lowercase role
        dob, // ✅ Correct argument
        phoneNumber,
        countryCode,
      )

      // ❌ DO NOT automatically log the user in!
      // setUser(userData);
      // await saveUserToRedux(userData); // ❌ DO NOT automatically log the user in!

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
    dob: string,
    countryCode: string,
  ): Promise<any> => {
    setIsLoading(true)

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
      }

      // ✅ Send request to API using parent's token
      const response = await axios.post(`${API_URL}/register/child`, requestBody, {
        headers: {
          firebase_token: parentToken,
          "Content-Type": "application/json",
        },
      })
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

        // ✅ Send Firebase Token to API for verification and get JWT
        const response = await axios.post(
          `${API_URL}/auth`,
          { email: firebaseUser.email },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        // ✅ Extract JWT from response headers (not Firebase token!)
        const authHeader = response.headers['authorization'] || response.headers['Authorization']
        const jwtToken = authHeader?.replace(/^Bearer\s+/i, '') || response.data.token

        if (!jwtToken) {
          throw new Error("No JWT token received from backend")
        }

        // ✅ Extract user details from API response
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          role: response.data.role.toLowerCase(), // Ensure lowercase role
          countryCode: response.data.country_code || "US",
          token: jwtToken, // ✅ Store JWT, not Firebase token
          profileImage: response.data.photo_url || "", // ✅ Include profile image from backend
        }

        // ✅ Save user to Redux only - Redux Persist handles persistence
        dispatch(setReduxUser(userData))
        await saveUserToRedux(userData)

        // ✅ Redirect Based on Role
        switch (userData.role) {
          case "athlete":
            router.replace("/(athlete)/(tabs)/home")
            break
          case "coach":
            router.replace("/(coach)/(tabs)/coachHome")
            break
          default:
            console.error("❌ Unknown role:", userData.role)
            // Fallback to athlete for unknown roles
            router.replace("/(athlete)/(tabs)/home")
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

      // 🔹 Send Firebase Token to API to get JWT
      const response = await axios.post(
        `${API_URL}/auth`,
        { email: firebaseUser.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // 🔹 Extract JWT from response headers (not Firebase token!)
      const authHeader = response.headers['authorization'] || response.headers['Authorization']
      const jwtToken = authHeader?.replace(/^Bearer\s+/i, '') || response.data.token

      if (!jwtToken) {
        throw new Error("No JWT token received from backend")
      }

      // 🔹 Extract user details from API response
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        role: response.data.role.toLowerCase(), // Ensure lowercase role
        countryCode: response.data.country_code || "US",
        token: jwtToken, // ✅ Store JWT, not Firebase token
        profileImage: response.data.photo_url || "", // ✅ Include profile image from backend
      }

      // 🔹 Save user to Redux only - Redux Persist handles persistence
      dispatch(setReduxUser(userData))
      await saveUserToRedux(userData)

      // 🔹 Redirect Based on Role
      switch (userData.role) {
        case "athlete":
          router.replace("/(athlete)/(tabs)/home")
          break
        case "coach":
          router.replace("/(coach)/(tabs)/coachHome")
          break
        default:
          console.error("❌ Unknown role:", userData.role)
          // Fallback to athlete for unknown roles
          router.replace("/(athlete)/(tabs)/home")
      }

      // Return the user object for Redux
      return userData
    } catch (error) {
      console.error("Apple Login Error:", error)
      throw error
    }
  }

  // 🔹 Force re-login when authentication fails
  const forceReLogin = async (message: string = "Please log in again") => {
    setAuthError(message)
    
    try {
      // 🔄 Multiple approaches to clear Redux Persist state
      persistor.pause()
      await persistor.purge()
      await persistor.flush()
      
      // 🔄 Direct AsyncStorage key removal for Redux Persist
      const allKeys = await AsyncStorage.getAllKeys()
      const persistKeys = allKeys.filter(key => key.startsWith('persist:'))
      for (const key of persistKeys) {
        await AsyncStorage.removeItem(key)
      }
      
      // Clear Redux state
      dispatch(reduxLogout())
      
      // Clear AsyncStorage items manually (redundant after purge, but kept for safety)
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("authToken")
    } catch (error) {
      console.error("❌ forceReLogin: Error during clearing:", error)
    }
    
    router.replace("/(auth)/login")
  }

  // 🔹 Get valid token (centralized token management)
  const getValidToken = async (): Promise<string | null> => {
    try {
      // Try Redux user token first
      if (user?.token) {
        const isValid = await verifyTokenWithBackend(user.token, user.email)
        if (isValid) {
          return user.token
        }
      }

      // If no valid token from Redux, try Firebase user
      if (firebaseUser) {
        const newToken = await refreshAndExchangeToken(firebaseUser)
        if (newToken) {
          const updatedUser = { ...user, token: newToken }
          dispatch(setReduxUser(updatedUser))
          await saveUserToRedux(updatedUser)
          return newToken
        }
      }

      // If still no token, check Firebase auth state
      if (auth.currentUser) {
        const newToken = await refreshAndExchangeToken(auth.currentUser)
        if (newToken) {
          // If no Redux user but Firebase user exists, create minimal user object
          if (!user) {
            const minimalUser = {
              id: auth.currentUser.uid,
              email: auth.currentUser.email || '',
              firstName: '',
              lastName: '',
              role: '',
              countryCode: 'US',
              token: newToken
            }
            dispatch(setReduxUser(minimalUser))
          } else {
            const updatedUser = { ...user, token: newToken }
            dispatch(setReduxUser(updatedUser))
          }
          return newToken
        }
      }

      console.error("❌ Unable to obtain valid token")
      return null
    } catch (error) {
      console.error("❌ getValidToken failed:", error)
      return null
    }
  }

  // 🔹 Get valid Firebase token (for endpoints that require Firebase token)
  const getValidFirebaseToken = async (): Promise<string | null> => {
    try {
      if (firebaseUser) {
        return await firebaseUser.getIdToken(true)
      }
      
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken(true)
      }

      console.error("❌ No Firebase user available")
      return null
    } catch (error) {
      console.error("❌ getValidFirebaseToken failed:", error)
      return null
    }
  }

  // 🔹 Check authentication status
  const checkAuthStatus = async (): Promise<boolean> => {
    const token = await getValidToken()
    return token !== null
  }

  // 🔹 Logout Function
  const logout = async () => {
    try {
      // 🔥 Sign out from Firebase first
      if (auth.currentUser) {
        await signOut(auth)
      }
      
      // 🔄 Pause persistor first to prevent rehydration
      persistor.pause()
      
      // 🔄 Clear ALL Redux data FIRST while persistor is paused
      dispatch(reduxLogout())           // Clear user data
      dispatch(clearPractices())        // Clear practices cache
      dispatch(clearMatches())          // Clear match history cache
      dispatch(clearMembership())       // Clear membership cache
      
      // 🔄 Now purge the persisted data
      await persistor.purge()
      
      // 🔄 Force flush to ensure purge is written
      await persistor.flush()
      
      // 🔄 Direct AsyncStorage key removal for ALL persist keys
      const currentKeys = await AsyncStorage.getAllKeys()
      const persistKeys = currentKeys.filter(key => key.startsWith('persist:'))
      for (const key of persistKeys) {
        await AsyncStorage.removeItem(key)
      }
      
      // 🔄 Clear ALL user-related keys including legacy ones
      const userRelatedKeys = ['user', 'authToken', 'userToken', 'firebaseToken', 'jwt', 'token']
      for (const key of userRelatedKeys) {
        await AsyncStorage.removeItem(key)
      }
      
      // 🔧 Wait a bit to ensure async operations complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Clear auth error state
      setAuthError(null)
      
      // Navigate to login
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("❌ Failed to log out:", error)
    }
  }

  // 🔹 Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      // Don't clear user data automatically when Firebase user becomes null
      // This happens during app restart and would cause the logout issue
    })

    return unsubscribe
  }, [isAuthLoaded, user])

  // 🔹 Load user when Firebase user is available or on app start
  useEffect(() => {
    if (isLoadingFromStorage) {
      return
    }
    
    if (firebaseUser && !isAuthLoaded) {
      setIsLoadingFromStorage(true)
      loadUserFromStorage().finally(() => setIsLoadingFromStorage(false))
    } else if (!firebaseUser && !isAuthLoaded) {
      // No Firebase user, but still try to load from storage first
      // This handles the case where Firebase takes time to initialize
      setIsLoadingFromStorage(true)
      loadUserFromStorage().finally(() => setIsLoadingFromStorage(false))
    }
  }, [firebaseUser, isAuthLoaded, isLoadingFromStorage])

  // 🔹 Verify email with token
  const verifyEmail = async (token: string) => {
    try {
      const result = await apiVerifyEmail(token)
      return result
    } catch (error) {
      console.error("❌ Email verification failed:", error)
      throw error
    }
  }

  // 🔹 Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      const result = await apiResendVerificationEmail(email)
      return result
    } catch (error) {
      console.error("❌ Resend verification failed:", error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    isAuthLoaded,
    authError,
    firebaseUser,
    login,
    register,
    registerChild,
    loginWithGoogle,
    loginWithApple,
    logout,
    checkAuthStatus,
    forceReLogin,
    getValidToken,
    getValidFirebaseToken,
    verifyEmail,
    resendVerificationEmail,
  }
}


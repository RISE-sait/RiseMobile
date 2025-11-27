import { useState, useEffect, useRef, useCallback } from "react"
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
import { AppState, InteractionManager } from "react-native"
import Constants from "expo-constants"

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

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return await Promise.race<T>([
    promise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Token refresh timed out")), timeoutMs)
    }) as Promise<T>,
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })
}

export const useAuth = () => {
  const dispatch = useDispatch()
  const reduxUser = useSelector((state: RootState) => state.user.data)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false) // ✅ Simplified: track if initial check is done
  const hasLoadedOnce = useRef(false) // ✅ Track if loadUserFromStorage has been called
  const TOKEN_TTL_MS = 55 * 60 * 1000
  const refreshInFlight = useRef<Promise<string | null> | null>(null)
  const firebaseReadyResolvers = useRef<Array<(user: FirebaseUser | null) => void>>([])
  const lastDeliveredTokenRef = useRef<string | null>(null)

  // Use Redux user state as primary source of truth
  const user = reduxUser

  const [, , promptAsync] = Google.useAuthRequest({
    clientId: "238537761671-vf9tu3vu85hnpm6r56bael9pm5b3k63b.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "myapp://redirect",
    }),
    scopes: ["profile", "email"],
  })

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

  // ✅ Simplified: Load user from Redux state immediately
  const loadUserFromStorage = useCallback(async () => {
    // Prevent multiple calls - only run once per hook instance
    if (hasLoadedOnce.current) {
      return
    }
    hasLoadedOnce.current = true

    try {
      // 🔹 Use Redux user state as primary source
      if (reduxUser) {
        if (reduxUser.token && !reduxUser.tokenIssuedAt) {
          const patchedUser = { ...reduxUser, tokenIssuedAt: Date.now() }
          dispatch(setReduxUser(patchedUser))
        }

        setAuthError(null)
      }

      setIsAuthLoaded(true)
    } catch (error) {
      console.error("❌ [Auth] Error in loadUserFromStorage:", error)
      setAuthError("Failed to load authentication data")
      setIsAuthLoaded(true) // ✅ Always set to true to prevent infinite loading
    }
  }, []) // Empty deps - only create once, rely on closure for reduxUser/dispatch

  // 🔹 Save user data to Redux only - Redux Persist handles AsyncStorage
  const saveUserToRedux = async (userData: User) => {
    try {
      if (!userData.countryCode) {
          userData.countryCode = "US" // ✅ Prevent undefined values
      }
      if (userData.token && !userData.tokenIssuedAt) {
        userData.tokenIssuedAt = Date.now()
      }
      if (!userData.tokenIssuedAt) {
        userData.tokenIssuedAt = Date.now()
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
    athleteFields?: {
      gender: string
      emergencyContactName: string
      emergencyContactPhone: string
      emergencyContactRelationship: string
    },
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
        athleteFields,
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
      // ✅ Clear Redux state first
      dispatch(reduxLogout())

      // ✅ Use Redux Persist API only - avoid manual persist:* key manipulation
      persistor.pause()
      await persistor.purge()
      await persistor.flush()

      // ✅ Only clear legacy keys if they exist (not managed by Redux Persist)
      await AsyncStorage.removeItem("authToken")
    } catch (error) {
      console.error("❌ forceReLogin: Error during clearing:", error)
    }

    router.replace("/(auth)/login")
  }

  const waitForFirebaseUser = useCallback(async () => {
    if (firebaseUser || auth.currentUser) {
      return firebaseUser || auth.currentUser
    }

    return await new Promise<FirebaseUser | null>((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      const cleanup = (resolver?: (user: FirebaseUser | null) => void) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (resolver) {
          firebaseReadyResolvers.current = firebaseReadyResolvers.current.filter((r) => r !== resolver)
        }
      }

      const resolver = (user: FirebaseUser | null) => {
        cleanup(resolver)
        resolve(user)
      }

      timeoutId = setTimeout(() => {
        cleanup(resolver)
        resolve(null)
      }, 3000)

      firebaseReadyResolvers.current.push(resolver)
    })
  }, [firebaseUser])

  const refreshTokenSilently = useCallback(async (): Promise<string | null> => {
    let sourceUser = firebaseUser || auth.currentUser
    if (!sourceUser) {
      sourceUser = await waitForFirebaseUser()
      if (!sourceUser) {
        return null
      }
    }

    if (refreshInFlight.current) {
      return refreshInFlight.current
    }

    const refreshPromise = (async () => {
      try {
        const newToken = await withTimeout(refreshAndExchangeToken(sourceUser!), 8000)
        if (!newToken) return null

        const issuedAt = Date.now()

        if (user) {
          const updatedUser = { ...user, token: newToken, tokenIssuedAt: issuedAt }
          dispatch(setReduxUser(updatedUser))
          await saveUserToRedux(updatedUser)
        } else {
          const minimalUser = {
            id: sourceUser.uid,
            email: sourceUser.email || '',
            firstName: '',
            lastName: '',
            role: '',
            countryCode: 'US',
            token: newToken,
            tokenIssuedAt: issuedAt,
          }
          dispatch(setReduxUser(minimalUser))
        }

        return newToken
      } catch (error) {
        console.warn("⚠️ [Auth] Silent token refresh failed", error)
        return null
      } finally {
        refreshInFlight.current = null
      }
    })()

    refreshInFlight.current = refreshPromise
    return refreshPromise
  }, [dispatch, firebaseUser, saveUserToRedux, user, waitForFirebaseUser])

  useEffect(() => {
    const isStandalone = Constants.appOwnership === "standalone"

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        refreshInFlight.current = null
        return
      }

      // Skip token refresh in Expo Go to prevent blocking
      if (!isStandalone) {
        return
      }

      const issuedAt = user?.tokenIssuedAt ?? 0
      const age = Date.now() - issuedAt
      if (user?.token && age > TOKEN_TTL_MS) {
        backgroundRefresh()
      }
    })

    return () => subscription.remove()
  }, [backgroundRefresh, refreshTokenSilently, user?.token, user?.tokenIssuedAt])

  useEffect(() => {
    if (user?.token) {
      lastDeliveredTokenRef.current = user.token
    }
  }, [user?.token])

  const backgroundRefresh = useCallback(() => {
    if (!refreshInFlight.current) {
      InteractionManager.runAfterInteractions(() => {
        refreshTokenSilently().catch(() => null)
      })
    }
  }, [refreshTokenSilently])

  // 🔹 Get valid token (centralized token management)
  const getValidToken = async (forceRefresh = false): Promise<string | null> => {
    try {
      const isStandalone = Constants.appOwnership === "standalone"

      if (!forceRefresh && user?.token) {
        const issuedAt = user.tokenIssuedAt ?? 0
        const age = Date.now() - issuedAt

        // In Expo Go, be more lenient with token expiration to avoid blocking /auth calls
        // Only trigger background refresh if token is VERY old (>24 hours) or in standalone
        const expirationThreshold = isStandalone ? TOKEN_TTL_MS : 24 * 60 * 60 * 1000 // 24 hours for Expo Go

        if (age >= expirationThreshold) {
          backgroundRefresh()
        }
        lastDeliveredTokenRef.current = user.token
        return user.token
      }

      // In Expo Go, if we have a lastDeliveredToken, use it instead of forcing refresh
      // This avoids the blocking /auth call
      if (!isStandalone && lastDeliveredTokenRef.current) {
        return lastDeliveredTokenRef.current
      }

      const refreshed = await refreshTokenSilently()
      if (refreshed) {
        lastDeliveredTokenRef.current = refreshed
        return refreshed
      }

      return lastDeliveredTokenRef.current
    } catch (error) {
      return lastDeliveredTokenRef.current
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

      return null
    } catch (error) {
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

      // ✅ Clear ALL Redux data FIRST
      dispatch(reduxLogout())           // Clear user data
      dispatch(clearPractices())        // Clear practices cache
      dispatch(clearMatches())          // Clear match history cache
      dispatch(clearMembership())       // Clear membership cache

      // ✅ Use Redux Persist API only - avoid manual persist:* key manipulation
      persistor.pause()
      await persistor.purge()
      await persistor.flush()

      // ✅ Only clear legacy keys if they exist (not managed by Redux Persist)
      await AsyncStorage.removeItem("authToken")

      // Clear auth error state
      setAuthError(null)

      // Navigate to login after a brief delay to ensure Root Layout is ready
      setTimeout(() => {
        router.replace("/(auth)/login")
      }, 100)
    } catch (error) {
      console.error("❌ Failed to log out:", error)
    }
  }

  // ✅ Wait for Redux Persist rehydration to complete before initializing auth
  useEffect(() => {

    let hasRun = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Subscribe to Redux Persist state changes
    const unsubscribe = persistor.subscribe(() => {
      const state = persistor.getState()

      // Only proceed once rehydration is complete
      if (state.bootstrapped && !hasRun) {
        hasRun = true
        setHasInitialized(true)
        unsubscribe() // Unsubscribe after first trigger
      }
    })

    // Check if already bootstrapped when subscription is created
    const currentState = persistor.getState()
    if (currentState.bootstrapped && !hasRun) {
      hasRun = true
      setHasInitialized(true)
      unsubscribe()
    }

    // Safety timeout: Force initialization after 2 seconds even if rehydration hasn't completed
    timeoutId = setTimeout(() => {
      if (!hasRun) {
        hasRun = true
        setHasInitialized(true)
        unsubscribe()
      }
    }, 2000) // 2 second safety timeout

    return () => {
      unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // 🔹 Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextFirebaseUser) => {
      setFirebaseUser(nextFirebaseUser)

      if (firebaseReadyResolvers.current.length > 0) {
        firebaseReadyResolvers.current.forEach((resolver) => resolver(nextFirebaseUser))
        firebaseReadyResolvers.current = []
      }

      // Don't clear user data automatically when Firebase user becomes null
      // This happens during app restart and would cause the logout issue
    })

    return unsubscribe
  }, [isAuthLoaded, user])

  // ✅ Simplified: Load user once after initialization
  useEffect(() => {
    if (!hasInitialized || isAuthLoaded) {
      return
    }

    loadUserFromStorage()
  }, [hasInitialized, isAuthLoaded, loadUserFromStorage])

  // ✅ Safety timeout: Ensure isAuthLoaded is set after maximum time
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthLoaded) {
        console.warn("⚠️ [Auth] Safety timeout reached - forcing isAuthLoaded to true")
        setIsAuthLoaded(true)
      }
    }, 1500) // ⚡ 1.5 second timeout - reduced since we now properly wait for rehydration

    return () => clearTimeout(timeoutId)
  }, [isAuthLoaded])

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

import { useState, useRef, useEffect } from "react"
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { useAuth } from "@/utils/auth"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/userSlice"
import { setMembership } from "@/store/slices/membershipSlice"
import type { User } from "@/types"
import {
  saveBiometricCredentials,
  checkBiometricCapability,
  isBiometricLoginEnabled,
  getBiometricDisplayName,
  type BiometricCredentials
} from "@/utils/biometricAuth"



// Components
import { AnimatedLogo } from "@/components/auth/AnimatedLogo"
import { LoginHeader } from "@/components/auth/LoginHeader"
import { LoginForm } from "@/components/auth/LoginForm"
import { SocialLogin } from "@/components/auth/SocialLogin"
import { SignupLink } from "@/components/auth/SignupLink"
import { ErrorToast } from "@/components/auth/ErrorToast"
import BiometricLogin from "@/components/auth/BiometricLogin"

const { height } = Dimensions.get("window")

interface ErrorState {
  general?: string
  email?: string
  password?: string
}

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorState>({})
  const [lastLoginEmail, setLastLoginEmail] = useState<string>("")
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  const dispatch = useDispatch()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    // Animate elements when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)

      // Trigger haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      const user = await loginWithGoogle()

      // Store user in Redux
      if (user) {
        dispatch(
          setUser({
            ...user,
            isAuthenticated: true, // Add isAuthenticated property
          }),
        )
      }

      // Note: Navigation is already handled in loginWithGoogle function
    } catch (error) {
      setErrors({ general: "Google login failed. Please try again." })
      // Trigger haptic feedback for error
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Email/Password Login Handler
const handleLogin = async (email: string, password: string, saveForBiometric?: boolean) => {
  try {
    setIsLoading(true)

    const user = await login(email, password) as User;

    if (user) {
      dispatch(setUser({ ...user, isAuthenticated: true }))
      if (user.membership_info) {
        dispatch(setMembership(user.membership_info))
      }

      // Save email for potential biometric setup
      setLastLoginEmail(email)

      // Save credentials for biometric login if requested
      if (saveForBiometric) {
        await saveBiometricCredentials({ email, password })
      } else {
        // Check and offer biometric setup after successful login (with a small delay for UX)
        setTimeout(() => {
          checkAndOfferBiometricSetup(email, password)
        }, 1500)
      }
    }

  } catch (error) {
    console.error("Failed to login:", error)
    setErrors({ general: "Invalid email or password. Please try again." })
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  } finally {
    setIsLoading(false)
  }
}

// Handle biometric login
const handleBiometricLogin = async (credentials: BiometricCredentials) => {
  await handleLogin(credentials.email, credentials.password)
}

// Check and offer biometric setup after successful login
const checkAndOfferBiometricSetup = async (email: string, password: string) => {
  try {
    // Check if device supports biometrics
    const capability = await checkBiometricCapability()
    if (!capability.isAvailable) return

    // Check if biometric login is already enabled
    const isAlreadyEnabled = await isBiometricLoginEnabled()
    if (isAlreadyEnabled) return

    // Offer biometric setup
    const biometricName = getBiometricDisplayName(capability.biometricType)

    Alert.alert(
      `Enable ${biometricName} Login?`,
      `Would you like to use ${biometricName} for faster and more secure sign-ins?`,
      [
        {
          text: "Not Now",
          style: "cancel",
        },
        {
          text: "Enable",
          style: "default",
          onPress: async () => {
            const success = await saveBiometricCredentials({ email, password })
            if (success) {
              Alert.alert(
                "Success!",
                `${biometricName} login has been enabled. You can now use ${biometricName} to sign in.`,
                [{ text: "OK", style: "default" }]
              )
              // Success haptic feedback
              if (Platform.OS === "ios") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              }
            } else {
              Alert.alert(
                "Setup Failed",
                `Unable to set up ${biometricName} login. Please try again later.`,
                [{ text: "OK", style: "default" }]
              )
            }
          },
        },
      ]
    )
  } catch (error) {
    console.error('Error checking biometric setup:', error)
  }
}

// Handle enabling biometric login after successful password login
const handleEnableBiometric = async (email: string, password: string) => {
  const success = await saveBiometricCredentials({ email, password })
  if (success) {
    // Show success feedback
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }
}


  return (
    <View style={styles.outerContainer}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
          >
            <View style={styles.fullScreenBackground}>
              <LinearGradient
                colors={["#000", "#000", "rgba(0,0,0,0.9)", "#121212"]}
                style={[styles.gradientBackground, Platform.OS === "android" && styles.androidGradient]}
              >
                {/* Logo */}
                <AnimatedLogo fadeAnim={fadeAnim} />

                {/* Header */}
                <LoginHeader fadeAnim={fadeAnim} slideAnim={slideAnim} />

                {/* Form Container */}
                <Animated.View
                  style={[
                    styles.formContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  {/* Login Form */}
                  <LoginForm onLogin={handleLogin} isLoading={isLoading} errors={errors} setErrors={setErrors} />

                  {/* Biometric Login */}
                  <BiometricLogin
                    onBiometricLogin={handleBiometricLogin}
                    onEnableBiometric={handleEnableBiometric}
                    isLoading={isLoading}
                    lastLoginEmail={lastLoginEmail}
                  />

                  {/* Sign Up Link */}
                  <SignupLink onPress={() => router.push("/(auth)/signup")} />


                  {/* Add bottom padding */}
                  <View style={styles.bottomPadding} />
                </Animated.View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* Error message */}
      <ErrorToast message={errors.general} />
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  fullScreenBackground: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  androidGradient: {
    height: height + 100, // Extra height for Android
  },
  formContainer: {
    paddingHorizontal: 30,
    flex: 1,
  },
  bottomPadding: {
    height: Platform.OS === "android" ? 100 : 50, // Extra padding for Android
  },
})

export default LoginScreen


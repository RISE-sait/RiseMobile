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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { useAuth } from "@/utils/auth"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/userSlice"

// Components
import { AnimatedLogo } from "@/components/auth/AnimatedLogo"
import { LoginHeader } from "@/components/auth/LoginHeader"
import { LoginForm } from "@/components/auth/LoginForm"
import { SocialLogin } from "@/components/auth/SocialLogin"
import { SignupLink } from "@/components/auth/SignupLink"
import { ErrorToast } from "@/components/auth/ErrorToast"

const { height } = Dimensions.get("window")

interface ErrorState {
  general?: string
  email?: string
  password?: string
}

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorState>({})
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
      console.log("Google login successful:", user)

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
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Using the existing login function from useAuth
      const user = await login(email, password)

      console.log("User logged in:", user)

      // Store user in Redux
      if (user) {
        dispatch(
          setUser({
            ...user,
            isAuthenticated: true, // Add isAuthenticated property
          }),
        )
      }

      // Note: Navigation is already handled in the login function in auth.ts
    } catch (error) {
      console.error("Failed to login:", error)
      setErrors({ general: "Invalid email or password. Please try again." })
      // Trigger haptic feedback for error
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } finally {
      setIsLoading(false)
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

                  {/* Sign Up Link */}
                  <SignupLink onPress={() => router.push("/(auth)/signup")} />

                  {/* Social Login Options */}
                  <SocialLogin onGoogleLogin={handleGoogleLogin} />

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


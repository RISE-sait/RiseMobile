import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { resendVerificationEmail } from "@/utils/api"
import { StatusBar } from "expo-status-bar"
import * as Haptics from "expo-haptics"

const ResendVerificationScreen = () => {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const [email, setEmail] = useState(params.email || "")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const handleResendEmail = async () => {
    // Check if cooldown is active
    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before resending`)
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    try {
      setIsLoading(true)
      setError("")

      await resendVerificationEmail(email)

      setEmailSent(true)
      setCooldownSeconds(60) // Start 60 second cooldown

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error: any) {
      // Handle specific error messages from backend
      const backendMessage = error.response?.data?.error?.message || error.response?.data?.message
      if (backendMessage) {
        setError(backendMessage)
      } else if (error.response?.status === 404) {
        setError("No account found with this email address.")
      } else if (error.response?.status === 429) {
        setError("Too many requests. Please wait a few minutes before trying again.")
      } else {
        setError("Failed to send verification email. Please try again.")
      }

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.replace("/(auth)/login")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <LinearGradient colors={["#000", "#000", "rgba(0,0,0,0.9)", "#121212"]} style={styles.gradientBackground}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoToLogin}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            {emailSent ? (
              <Ionicons name="mail-outline" size={80} color="#4CAF50" />
            ) : (
              <Ionicons name="mail-unread-outline" size={80} color="#FFD700" />
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{emailSent ? "Check Your Email" : "Resend Verification"}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {emailSent
              ? `We've sent a verification link to ${email}. Please check your inbox and click the link to verify your account.`
              : "Enter your email address and we'll send you a new verification link."}
          </Text>

          {/* Email Input (only show if not sent) */}
          {!emailSent && (
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused, error && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={emailFocused ? "#FFD700" : "#9EA0A4"} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#9EA0A4"
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (error) setError("")
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onSubmitEditing={handleResendEmail}
                  editable={!isLoading}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          )}

          {/* Action Buttons */}
          {emailSent ? (
            <>
              <TouchableOpacity style={styles.button} onPress={handleGoToLogin}>
                <LinearGradient
                  colors={["#4CAF50", "#45A049"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Go to Login</Text>
                  <Ionicons name="log-in-outline" size={20} color="#000" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setEmailSent(false)
                  setError("")
                }}
              >
                <Text style={styles.secondaryButtonText}>Send Again</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleResendEmail}
              disabled={isLoading || cooldownSeconds > 0}
            >
              <LinearGradient
                colors={cooldownSeconds > 0 ? ["#666", "#555"] : ["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : cooldownSeconds > 0 ? (
                  <>
                    <Text style={styles.buttonText}>Wait {cooldownSeconds}s</Text>
                    <Ionicons name="time-outline" size={20} color="#000" />
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Verification Email</Text>
                    <Ionicons name="mail-outline" size={20} color="#000" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: "#9EA0A4",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 10,
  },
  inputWrapperFocused: {
    borderBottomColor: "#FFD700",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
  },
  inputError: {
    borderBottomColor: "#FF4D4F",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 30,
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
    width: "100%",
    maxWidth: 300,
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default ResendVerificationScreen

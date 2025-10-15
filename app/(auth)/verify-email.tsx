import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { verifyEmail } from "@/utils/api"
import { StatusBar } from "expo-status-bar"
import { TouchableOpacity } from "react-native"

const VerifyEmailScreen = () => {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token: string }>()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<"success" | "error" | "loading">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus("error")
        setErrorMessage("Invalid verification link. Please check your email and try again.")
        setIsVerifying(false)
        return
      }

      try {
        setIsVerifying(true)
        const response = await verifyEmail(token)

        if (response.verified) {
          setVerificationStatus("success")
        } else {
          setVerificationStatus("error")
          setErrorMessage("Email verification failed. Please try again.")
        }
      } catch (error: any) {
        console.error("❌ Verification error:", error)
        setVerificationStatus("error")

        // Handle specific error messages from backend
        const backendMessage = error.response?.data?.error?.message || error.response?.data?.message
        if (backendMessage) {
          setErrorMessage(backendMessage)
        } else if (error.response?.status === 400) {
          setErrorMessage("Invalid or expired verification link.")
        } else {
          setErrorMessage("Something went wrong. Please try again later.")
        }
      } finally {
        setIsVerifying(false)
      }
    }

    handleVerification()
  }, [token])

  const handleGoToLogin = () => {
    router.replace("/(auth)/login")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <LinearGradient colors={["#000", "#000", "rgba(0,0,0,0.9)", "#121212"]} style={styles.gradientBackground}>
        <View style={styles.content}>
          {/* Icon */}
          {isVerifying ? (
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          ) : verificationStatus === "success" ? (
            <View style={[styles.iconContainer, styles.successIcon]}>
              <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
            </View>
          ) : (
            <View style={[styles.iconContainer, styles.errorIcon]}>
              <Ionicons name="close-circle" size={100} color="#FF4D4F" />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>
            {isVerifying
              ? "Verifying Your Email..."
              : verificationStatus === "success"
                ? "Email Verified!"
                : "Verification Failed"}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {isVerifying
              ? "Please wait while we verify your email address."
              : verificationStatus === "success"
                ? "Your email has been successfully verified. You can now log in to your account."
                : errorMessage}
          </Text>

          {/* Action Button */}
          {!isVerifying && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleGoToLogin}
              disabled={isVerifying}
            >
              <LinearGradient
                colors={verificationStatus === "success" ? ["#4CAF50", "#45A049"] : ["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>
                  {verificationStatus === "success" ? "Go to Login" : "Try Again"}
                </Text>
                <Ionicons
                  name={verificationStatus === "success" ? "log-in-outline" : "refresh-outline"}
                  size={20}
                  color="#000"
                />
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
  iconContainer: {
    marginBottom: 30,
  },
  successIcon: {
    // Additional styles for success icon if needed
  },
  errorIcon: {
    // Additional styles for error icon if needed
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
  button: {
    borderRadius: 30,
    overflow: "hidden",
    width: "100%",
    maxWidth: 300,
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
})

export default VerifyEmailScreen

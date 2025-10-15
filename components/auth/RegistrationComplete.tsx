import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useState, useEffect } from "react"
import * as Haptics from "expo-haptics"
import { resendVerificationEmail } from "@/utils/api"

interface RegistrationCompleteProps {
  email: string
  successAnim: Animated.Value
  checkmarkScale: Animated.Value
  role?: string
}

export const RegistrationComplete = ({ email, successAnim, checkmarkScale, role }: RegistrationCompleteProps) => {
  const isAthlete = role === 'athlete'
  const [isResending, setIsResending] = useState(false)
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

  const messageText = isAthlete
    ? "Please check your email to verify your account before logging in. Click the verification link we sent to complete the process."
    : "Please check your email to verify your account. You'll also receive a separate email when your account is approved by our team."

  const approvalTimeText = isAthlete
    ? "After email verification"
    : "1-2 hours within business hours (after verification)"

  const handleResendVerification = async () => {
    // Check if cooldown is active
    if (cooldownSeconds > 0) {
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      Alert.alert(
        "Please Wait",
        `You can resend the email in ${cooldownSeconds} seconds`,
        [{ text: "OK" }]
      )
      return
    }

    try {
      setIsResending(true)

      await resendVerificationEmail(email)

      setCooldownSeconds(60) // Start 60 second cooldown

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      Alert.alert(
        "Email Sent",
        "A new verification email has been sent. Please check your inbox.",
        [{ text: "OK" }]
      )
    } catch (error: any) {
      console.error("❌ Resend verification error:", error)

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }

      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "Failed to send verification email. Please try again."

      Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK" }]
      )
    } finally {
      setIsResending(false)
    }
  }
  return (
    <View style={styles.successContainer}>
      <Animated.View
        style={[
          styles.successCircle,
          {
            opacity: successAnim,
            transform: [{ scale: checkmarkScale }],
          },
        ]}
      >
        <Ionicons name="checkmark" size={80} color="#FFD700" />
      </Animated.View>

      <Animated.Text style={[styles.successTitle, { opacity: successAnim }]}>Registration Complete!</Animated.Text>

      <Animated.Text style={[styles.successMessage, { opacity: successAnim }]}>
        {messageText}
      </Animated.Text>

      <Animated.View style={[styles.successInfo, { opacity: successAnim }]}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Verification email sent to:</Text>
        </View>
        <Text style={styles.infoValue}>{email}</Text>

        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>{isAthlete ? "Access time:" : "Estimated approval time:"}</Text>
        </View>
        <Text style={styles.infoValue}>{approvalTimeText}</Text>
      </Animated.View>

      <TouchableOpacity style={styles.loginButton} onPress={() => router.replace("/(auth)/login")}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>GO TO LOGIN</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendVerification}
        disabled={isResending || cooldownSeconds > 0}
      >
        <Text style={[styles.resendButtonText, (isResending || cooldownSeconds > 0) && styles.resendButtonTextDisabled]}>
          {isResending ? "Sending..." : cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Didn't receive the email? Resend"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#000",
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#9EA0A4",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  successInfo: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoText: {
    color: "#9EA0A4",
    fontSize: 14,
    marginLeft: 10,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 30,
    marginBottom: 15,
  },
  loginButton: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
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
  },
  resendButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resendButtonText: {
    color: "#FFD700",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  resendButtonTextDisabled: {
    color: "#666",
  },
})


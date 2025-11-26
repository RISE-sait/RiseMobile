import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../firebase/firebaseConfig"
import LottieView from "lottie-react-native"

const ForgotPasswordScreen = () => {
  // State
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)

  // Lottie ref
  const lottieRef = useRef<LottieView>(null)
  
  // Handle password reset
  const handleResetPassword = async () => {
    // Clear previous errors
    setError("")

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    // Show loading state
    setIsLoading(true)

    try {
      // Trigger haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email)

      // Show success state
      setEmailSent(true)

      // Play Lottie animation
      if (lottieRef.current) {
        lottieRef.current.play()
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
          <LinearGradient colors={["#000", "#121212"]} style={styles.gradientBackground}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFD700" />
            </TouchableOpacity>

            {emailSent ? (
              // Success View
              <View style={styles.contentContainer}>
                <View style={styles.successContainer}>
                  <View style={styles.lottieContainer}>
                    <LottieView
                      ref={lottieRef}
                      source={require("../../assets/animations/email-sent.json")}
                      style={styles.lottieAnimation}
                      autoPlay={true}
                      loop={true}
                    />
                  </View>

                  <Text style={styles.successTitle}>Check Your Email</Text>

                  <Text style={styles.successText}>We've sent password reset instructions to your email address.</Text>

                  <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.returnGradientButton}
                    >
                      <Text style={styles.returnButtonText}>Return to Login</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.resendLink} onPress={() => setEmailSent(false)}>
                    <Text style={styles.resendText}>Didn't receive the email? Try again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Form View
              <View style={styles.contentContainer}>
                {/* Header */}
                <View>
                  <Text style={styles.title}>Reset Password</Text>

                  <Text style={styles.subtitle}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </Text>
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                      error && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? "#FFD700" : "#9EA0A4"}
                      style={styles.inputIcon}
                    />
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
                      onSubmitEditing={handleResetPassword}
                    />
                  </View>

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#000" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>RESET PASSWORD</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </LinearGradient>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(30, 30, 30, 0.7)",
  },
  inputWrapperFocused: {
    borderColor: "#FFD700",
  },
  inputError: {
    borderColor: "#FF4D4F",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 13,
    marginTop: 8,
    marginLeft: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  resetButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  lottieContainer: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  returnButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  returnGradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  returnButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendLink: {
    marginTop: 24,
  },
  resendText: {
    color: "#FFD700",
    fontSize: 14,
  },
})

export default ForgotPasswordScreen


import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"

interface RegistrationCompleteProps {
  email: string
  successAnim: Animated.Value
  checkmarkScale: Animated.Value
}

export const RegistrationComplete = ({ email, successAnim, checkmarkScale }: RegistrationCompleteProps) => {
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
        Your account is pending verification by our team. You'll receive an email when your account is approved and
        ready to use.
      </Animated.Text>

      <Animated.View style={[styles.successInfo, { opacity: successAnim }]}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Verification email sent to:</Text>
        </View>
        <Text style={styles.infoValue}>{email}</Text>

        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Estimated approval time:</Text>
        </View>
        <Text style={styles.infoValue}>6-12 hours</Text>
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
})


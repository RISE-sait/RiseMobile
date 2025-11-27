import { useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import type { SignupFormErrors } from "@/hooks/auth/useSignupForm"

interface SignupStep1FormProps {
  email: string
  setEmail: (text: string) => void
  password: string
  setPassword: (text: string) => void
  confirmPassword: string
  setConfirmPassword: (text: string) => void
  passwordVisible: boolean
  setPasswordVisible: (visible: boolean) => void
  confirmPasswordVisible: boolean
  setConfirmPasswordVisible: (visible: boolean) => void
  errors: SignupFormErrors
  setErrors: (errors: SignupFormErrors) => void
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
  onContinue: () => void
  validatePassword: (password: string) => { valid: boolean; strength: string; message: string }
}

export const SignupStep1Form = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  passwordVisible,
  setPasswordVisible,
  confirmPasswordVisible,
  setConfirmPasswordVisible,
  errors,
  setErrors,
  fadeAnim,
  slideAnim,
  onContinue,
  validatePassword,
}: SignupStep1FormProps) => {
  const passwordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (errors.email) setErrors({ ...errors, email: null })
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            ref={passwordRef}
            placeholder="Password (min. 8 characters)"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              if (errors.password) setErrors({ ...errors, password: null })
            }}
            secureTextEntry={!passwordVisible}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <TouchableOpacity style={styles.visibilityIcon} onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#9EA0A4" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${(() => {
                      const result = validatePassword(password)
                      switch (result.strength) {
                        case "weak":
                          return 25
                        case "medium":
                          return 50
                        case "good":
                          return 75
                        case "strong":
                          return 100
                        default:
                          return 0
                      }
                    })()}%`,
                    backgroundColor: (() => {
                      const result = validatePassword(password)
                      switch (result.strength) {
                        case "weak":
                          return "#FF4D4F"
                        case "medium":
                          return "#FFA500"
                        case "good":
                          return "#2EB62C"
                        case "strong":
                          return "#57C84D"
                        default:
                          return "#FF4D4F"
                      }
                    })(),
                  },
                ]}
              />
            </View>
            <View style={styles.strengthTextContainer}>
              <Text style={styles.strengthText}>{validatePassword(password).message}</Text>
              {validatePassword(password).strength === "weak" && (
                <Ionicons name="alert-circle" size={14} color="#FF4D4F" style={{ marginLeft: 5 }} />
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            ref={confirmPasswordRef}
            placeholder="Confirm password"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text)
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null })
            }}
            secureTextEntry={!confirmPasswordVisible}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.visibilityIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Ionicons name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#9EA0A4" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <View style={styles.passwordMatchContainer}>
            <Ionicons
              name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
              size={16}
              color={password === confirmPassword ? "#2EB62C" : "#FF4D4F"}
            />
            <Text style={[
              styles.passwordMatchText,
              { color: password === confirmPassword ? "#2EB62C" : "#FF4D4F" }
            ]}>
              {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (email && password && confirmPassword && password === confirmPassword) {
            onContinue()
            // Trigger haptic feedback for step change
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          } else {
            // Validate form
          }
        }}
      >
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 10,
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
  visibilityIcon: {
    padding: 5,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginLeft: 30,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: "#9EA0A4",
  },
  strengthTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordMatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 30,
  },
  passwordMatchText: {
    fontSize: 12,
    marginLeft: 6,
  },
  nextButton: {
    marginTop: 20,
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
    marginRight: 10,
  },
})


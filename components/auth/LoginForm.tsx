"use client"

import { useState, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"

interface LoginFormErrors {
  email?: string | null
  password?: string | null
}

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  isLoading: boolean
  errors: LoginFormErrors
  setErrors: (errors: LoginFormErrors) => void
}

export const LoginForm = ({ onLogin, isLoading, errors, setErrors }: LoginFormProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const passwordRef = useRef<TextInput>(null)

  const handleSubmit = async () => {
    const newErrors: LoginFormErrors = {}

    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Trigger haptic feedback for error
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    try {
      // Trigger haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      await onLogin(email, password)
    } catch (error) {
    }
  }

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    router.push("/(auth)/forgot-password")
  }

  return (
    <View>
      <View style={styles.inputContainer}>
        <View
          style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused, errors.email && styles.inputError]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={emailFocused ? "#FCA311" : "#9EA0A4"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9EA0A4"
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (errors.email) setErrors({ ...errors, email: null })
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            passwordFocused && styles.inputWrapperFocused,
            errors.password && styles.inputError,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={passwordFocused ? "#FCA311" : "#9EA0A4"}
            style={styles.inputIcon}
          />
          <TextInput
            ref={passwordRef}
            placeholder="Password"
            placeholderTextColor="#9EA0A4"
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              if (errors.password) setErrors({ ...errors, password: null })
            }}
            secureTextEntry={!passwordVisible}
            returnKeyType="done"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity style={styles.visibilityIcon} onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#9EA0A4" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={isLoading}>
        <LinearGradient
          colors={["#FCA311", "#E8920F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>LOG IN</Text>
              <Ionicons name="log-in-outline" size={20} color="#000" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
  inputWrapperFocused: {
    borderBottomColor: "#FCA311",
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
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#FCA311",
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
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


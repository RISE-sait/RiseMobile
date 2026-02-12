import { useState } from "react"
import { Platform } from "react-native"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/utils/auth"
import type { SignupFormData, SignupFormErrors } from "./useSignupForm"

export const useSignupSubmission = (
  formData: SignupFormData,
  validateForm: () => boolean,
  setErrors: (errors: SignupFormErrors) => void,
  animateSuccess: () => void,
) => {
  const { register, isLoading } = useAuth()
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [recentCountries, setRecentCountries] = useState([
    { cca2: "US", name: "United States" },
    { cca2: "CA", name: "Canada" },
    { cca2: "GB", name: "United Kingdom" },
    { cca2: "AU", name: "Australia" },
  ])

  const handleSignUp = async () => {
    if (!validateForm()) return

    try {
      // Calculate Age
      const birthYear = formData.dateOfBirth ? Number.parseInt(formData.dateOfBirth.split("-")[0]) : null
      const currentYear = new Date().getFullYear()
      const age = birthYear ? currentYear - birthYear : null

      if (!age || age < 13) {
        setErrors({ dateOfBirth: "You must be at least 13 years old." })
        return
      }

      // Format phone with country code
      const fullPhoneNumber = `+${formData.country.callingCode?.[0] || "1"}${formData.phoneNumber}`

      // Trigger haptic feedback for submission
      if (Platform.OS === "ios") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }


      // Format emergency contact phone with country code
      const fullEmergencyPhone = formData.role === "athlete"
        ? `+${formData.emergencyContactPhoneCountry.callingCode?.[0] || "1"}${formData.emergencyContactPhone}`
        : ""

      // Send request to your register function
      const response = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role,
        formData.dateOfBirth,
        fullPhoneNumber,
        formData.country.cca2,
        // Additional fields for athletes
        formData.role === "athlete" ? {
          gender: formData.gender,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: fullEmergencyPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
        } : undefined,
      )


      // Show verification pending screen
      setRegistrationComplete(true)
      animateSuccess()

      // Save country to recent countries if not already there
      if (!recentCountries.some((c) => c.cca2 === formData.country.cca2)) {
        setRecentCountries((prev) => [formData.country, ...prev.slice(0, 3)])
      }
    } catch (error) {
      console.error("❌ Signup failed:", error)
      setErrors({ general: "Registration failed. Please try again." })

      // Trigger haptic feedback for error
      if (Platform.OS === "ios") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    }
  }

  return {
    isLoading,
    registrationComplete,
    recentCountries,
    handleSignUp,
  }
}


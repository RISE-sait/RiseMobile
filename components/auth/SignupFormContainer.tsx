import type React from "react"
import { View, StyleSheet, Alert, Platform } from "react-native"
import { SignupStep1Form } from "./SignupStep1Form"
import { SignupStep2Form } from "./SignupStep2Form"
import type { Animated } from "react-native"
import type { SignupFormData, SignupFormErrors } from "@/hooks/auth/useSignupForm"
import * as Haptics from "expo-haptics"

interface SignupFormContainerProps {
  formData: SignupFormData
  updateFormData: (field: keyof SignupFormData, value: any) => void
  errors: SignupFormErrors
  setErrors: (errors: SignupFormErrors) => void
  passwordVisible: boolean
  setPasswordVisible: (visible: boolean) => void
  confirmPasswordVisible: boolean
  setConfirmPasswordVisible: (visible: boolean) => void
  phoneInputFocused: boolean
  setPhoneInputFocused: (focused: boolean) => void
  emergencyPhoneInputFocused: boolean
  setEmergencyPhoneInputFocused: (focused: boolean) => void
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
  validatePassword: (password: string) => { valid: boolean; strength: string; message: string }
  onSignUp: () => void
  onOpenRoleModal: () => void
  onCancelRegistration: () => void
  isLoading: boolean
  setCountryPickerVisible: (visible: boolean) => void
  countryPickerVisible: boolean
  setPhoneCountryPickerVisible: (visible: boolean) => void
  phoneCountryPickerVisible: boolean
  emergencyPhoneCountryPickerVisible: boolean
  setEmergencyPhoneCountryPickerVisible: (visible: boolean) => void
  formatPhoneNumber: (text: string) => void
  formatEmergencyContactPhone: (text: string) => void
  step: number
  setStep: (step: number) => void
}

export const SignupFormContainer: React.FC<SignupFormContainerProps> = ({
  formData,
  updateFormData,
  errors,
  setErrors,
  passwordVisible,
  setPasswordVisible,
  confirmPasswordVisible,
  setConfirmPasswordVisible,
  phoneInputFocused,
  setPhoneInputFocused,
  emergencyPhoneInputFocused,
  setEmergencyPhoneInputFocused,
  fadeAnim,
  slideAnim,
  validatePassword,
  onSignUp,
  onOpenRoleModal,
  onCancelRegistration,
  isLoading,
  setCountryPickerVisible,
  countryPickerVisible,
  setPhoneCountryPickerVisible,
  phoneCountryPickerVisible,
  emergencyPhoneCountryPickerVisible,
  setEmergencyPhoneCountryPickerVisible,
  formatPhoneNumber,
  formatEmergencyContactPhone,
  step,
  setStep,
}) => {
  // Handle continue to step 2
  const handleContinueToStep2 = () => {
    const newErrors: SignupFormErrors = {}

    if (!formData.email) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"

    if (!formData.password) newErrors.password = "Password is required"
    else {
      const passwordCheck = validatePassword(formData.password)
      if (!passwordCheck.valid) newErrors.password = passwordCheck.message
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"

      // Show alert for password mismatch
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }

      Alert.alert(
        "Passwords Don't Match",
        "Please make sure both password fields contain the same password.",
        [{ text: "OK" }]
      )
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep(2)
  }

  return (
    <View style={styles.formContainer}>
      {step === 1 ? (
        <SignupStep1Form
          email={formData.email}
          setEmail={(value) => updateFormData("email", value)}
          password={formData.password}
          setPassword={(value) => updateFormData("password", value)}
          confirmPassword={formData.confirmPassword}
          setConfirmPassword={(value) => updateFormData("confirmPassword", value)}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
          confirmPasswordVisible={confirmPasswordVisible}
          setConfirmPasswordVisible={setConfirmPasswordVisible}
          errors={errors}
          setErrors={setErrors}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onContinue={handleContinueToStep2}
          validatePassword={validatePassword}
        />
      ) : (
        <SignupStep2Form
          firstName={formData.firstName}
          setFirstName={(value) => updateFormData("firstName", value)}
          lastName={formData.lastName}
          setLastName={(value) => updateFormData("lastName", value)}
          dateOfBirth={formData.dateOfBirth}
          setDateOfBirth={(value) => updateFormData("dateOfBirth", value)}
          gender={formData.gender}
          setGender={(value) => updateFormData("gender", value)}
          role={formData.role}
          setRole={(value) => updateFormData("role", value)}
          phoneNumber={formData.phoneNumber}
          setPhoneNumber={(value) => updateFormData("phoneNumber", value)}
          formattedPhoneNumber={formData.formattedPhoneNumber}
          setFormattedPhoneNumber={(value) => updateFormData("formattedPhoneNumber", value)}
          phoneInputFocused={phoneInputFocused}
          setPhoneInputFocused={setPhoneInputFocused}
          phoneCountry={formData.phoneCountry}
          setPhoneCountry={(value) => updateFormData("phoneCountry", value)}
          country={formData.country}
          setCountry={(value) => updateFormData("country", value)}
          errors={errors}
          setErrors={setErrors}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onSignUp={onSignUp}
          onOpenRoleModal={onOpenRoleModal}
          onCancelRegistration={onCancelRegistration}
          isLoading={isLoading}
          setCountryPickerVisible={setCountryPickerVisible}
          countryPickerVisible={countryPickerVisible}
          setPhoneCountryPickerVisible={setPhoneCountryPickerVisible}
          phoneCountryPickerVisible={phoneCountryPickerVisible}
          formatPhoneNumber={formatPhoneNumber}
          acceptedTerms={formData.acceptedTerms}
          setAcceptedTerms={(value) => updateFormData("acceptedTerms", value)}
          acceptedWaiver={formData.acceptedWaiver}
          setAcceptedWaiver={(value) => updateFormData("acceptedWaiver", value)}
          emergencyContactName={formData.emergencyContactName}
          setEmergencyContactName={(value) => updateFormData("emergencyContactName", value)}
          emergencyContactPhone={formData.emergencyContactPhone}
          setEmergencyContactPhone={(value) => updateFormData("emergencyContactPhone", value)}
          emergencyContactPhoneFormatted={formData.emergencyContactPhoneFormatted}
          emergencyContactPhoneCountry={formData.emergencyContactPhoneCountry}
          setEmergencyContactPhoneCountry={(value) => updateFormData("emergencyContactPhoneCountry", value)}
          emergencyPhoneInputFocused={emergencyPhoneInputFocused}
          setEmergencyPhoneInputFocused={setEmergencyPhoneInputFocused}
          emergencyPhoneCountryPickerVisible={emergencyPhoneCountryPickerVisible}
          setEmergencyPhoneCountryPickerVisible={setEmergencyPhoneCountryPickerVisible}
          formatEmergencyContactPhone={formatEmergencyContactPhone}
          emergencyContactRelationship={formData.emergencyContactRelationship}
          setEmergencyContactRelationship={(value) => updateFormData("emergencyContactRelationship", value)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 30,
  },
})


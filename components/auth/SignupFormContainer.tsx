import type React from "react"
import { View, StyleSheet } from "react-native"
import { SignupStep1Form } from "./SignupStep1Form"
import { SignupStep2Form } from "./SignupStep2Form"
import type { Animated } from "react-native"
import type { SignupFormData, SignupFormErrors } from "@/hooks/auth/useSignupForm"

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
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
  validatePassword: (password: string) => { valid: boolean; strength: string; message: string }
  onSignUp: () => void
  onOpenRoleModal: () => void
  isLoading: boolean
  setCountryPickerVisible: (visible: boolean) => void
  countryPickerVisible: boolean
  formatPhoneNumber: (text: string) => void
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
  fadeAnim,
  slideAnim,
  validatePassword,
  onSignUp,
  onOpenRoleModal,
  isLoading,
  setCountryPickerVisible,
  countryPickerVisible,
  formatPhoneNumber,
  step,
  setStep,
}) => {
  // Handle continue to step 2
  const handleContinueToStep2 = () => {
    const newErrors = {}

    if (!formData.email) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"

    if (!formData.password) newErrors.password = "Password is required"
    else {
      const passwordCheck = validatePassword(formData.password)
      if (!passwordCheck.valid) newErrors.password = passwordCheck.message
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match"

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
          role={formData.role}
          setRole={(value) => updateFormData("role", value)}
          phoneNumber={formData.phoneNumber}
          setPhoneNumber={(value) => updateFormData("phoneNumber", value)}
          formattedPhoneNumber={formData.formattedPhoneNumber}
          setFormattedPhoneNumber={(value) => updateFormData("formattedPhoneNumber", value)}
          phoneInputFocused={phoneInputFocused}
          setPhoneInputFocused={setPhoneInputFocused}
          country={formData.country}
          setCountry={(value) => updateFormData("country", value)}
          errors={errors}
          setErrors={setErrors}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onSignUp={onSignUp}
          onOpenRoleModal={onOpenRoleModal}
          isLoading={isLoading}
          setCountryPickerVisible={setCountryPickerVisible}
          countryPickerVisible={countryPickerVisible}
          formatPhoneNumber={formatPhoneNumber}
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


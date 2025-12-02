import { useState } from "react"
import {
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"

// Import custom hooks
import { useSignupForm } from "@/hooks/auth/useSignupForm"
import { useSignupAnimations } from "@/hooks/auth/useSignupAnimations"
import { useSignupSubmission } from "@/hooks/auth/useSignupSubmission"

// Import componentsA
import { SignupLogo } from "@/components/auth/SignupLogo"
import { SignupHeader } from "@/components/auth/SignupHeader"
import { StepIndicator } from "@/components/auth/StepIndicator"
import { SignupFormContainer } from "@/components/auth/SignupFormContainer"
import { RoleSelectionModal } from "@/components/auth/RoleSelectionModal"
import { RegistrationComplete } from "@/components/auth/RegistrationComplete"
import { ModernBackground } from "@/components/auth/ModernBackground"
import { ErrorToast } from "@/components/auth/ErrorToast"

const SignUpScreen = () => {
  // Custom hooks
  const {
    formData,
    errors,
    passwordVisible,
    confirmPasswordVisible,
    phoneInputFocused,
    emergencyPhoneInputFocused,
    roleModalVisible,
    countryPickerVisible,
    phoneCountryPickerVisible,
    emergencyPhoneCountryPickerVisible,
    updateFormData,
    setErrors,
    setPasswordVisible,
    setConfirmPasswordVisible,
    setPhoneInputFocused,
    setEmergencyPhoneInputFocused,
    setRoleModalVisible,
    setCountryPickerVisible,
    setPhoneCountryPickerVisible,
    setEmergencyPhoneCountryPickerVisible,
    formatPhoneNumber,
    formatEmergencyContactPhone,
    validateForm,
    validatePassword,
  } = useSignupForm()

  const { fadeAnim, slideAnim, successAnim, checkmarkScale, logoSize, animateSuccess } = useSignupAnimations()

  const { isLoading, registrationComplete, handleSignUp } = useSignupSubmission(
    formData,
    validateForm,
    setErrors,
    animateSuccess,
  )

  // UI state
  const [step, setStep] = useState(1)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {registrationComplete ? (
        <RegistrationComplete email={formData.email} successAnim={successAnim} checkmarkScale={checkmarkScale} role={formData.role} />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <LinearGradient colors={["rgba(0,0,0,0.9)", "#121212"]} style={styles.gradientBackground}>
                {/* Modern background */}
                <ModernBackground />

                {/* Logo */}
                <SignupLogo fadeAnim={fadeAnim} />

                {/* Header */}
                <SignupHeader fadeAnim={fadeAnim} slideAnim={slideAnim} />

                {/* Step indicator */}
                <StepIndicator currentStep={step} totalSteps={2} />

                {/* Form Steps */}
                <SignupFormContainer
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  setErrors={setErrors}
                  passwordVisible={passwordVisible}
                  setPasswordVisible={setPasswordVisible}
                  confirmPasswordVisible={confirmPasswordVisible}
                  setConfirmPasswordVisible={setConfirmPasswordVisible}
                  phoneInputFocused={phoneInputFocused}
                  setPhoneInputFocused={setPhoneInputFocused}
                  emergencyPhoneInputFocused={emergencyPhoneInputFocused}
                  setEmergencyPhoneInputFocused={setEmergencyPhoneInputFocused}
                  fadeAnim={fadeAnim}
                  slideAnim={slideAnim}
                  validatePassword={validatePassword}
                  onSignUp={handleSignUp}
                  onOpenRoleModal={() => setRoleModalVisible(true)}
                  onCancelRegistration={() => router.replace("/(auth)/login")}
                  isLoading={isLoading}
                  setCountryPickerVisible={setCountryPickerVisible}
                  countryPickerVisible={countryPickerVisible}
                  setPhoneCountryPickerVisible={setPhoneCountryPickerVisible}
                  phoneCountryPickerVisible={phoneCountryPickerVisible}
                  emergencyPhoneCountryPickerVisible={emergencyPhoneCountryPickerVisible}
                  setEmergencyPhoneCountryPickerVisible={setEmergencyPhoneCountryPickerVisible}
                  formatPhoneNumber={formatPhoneNumber}
                  formatEmergencyContactPhone={formatEmergencyContactPhone}
                  step={step}
                  setStep={setStep}
                />

                {/* Login Link */}
                <TouchableOpacity style={styles.loginLink} onPress={() => router.replace("/(auth)/login")}>
                  <Text style={styles.loginText}>
                    ALREADY HAVE AN ACCOUNT? <Text style={styles.loginHighlight}>LOG IN</Text>
                  </Text>
                </TouchableOpacity>

              </LinearGradient>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}

      {/* Role Modal */}
      <RoleSelectionModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        onSelectRole={(selectedRole) => {
          updateFormData("role", selectedRole)
          setRoleModalVisible(false)
        }}
        currentRole={formData.role}
      />

      {/* Error message */}
      <ErrorToast message={errors.general} />
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
  scrollContent: {
    flexGrow: 1,
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  loginHighlight: {
    color: "#FCA311",
    fontWeight: "bold",
  },
})

export default SignUpScreen


import { useState } from "react"

// Email validation
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Password validation
const validatePassword = (password: string) => {
  // Check for minimum length
  if (password.length < 8) return { valid: false, strength: "weak", message: "Password must be at least 8 characters" }

  // Check for complexity
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length

  if (complexity === 1)
    return { valid: false, strength: "weak", message: "Add uppercase, numbers, or special characters" }
  if (complexity === 2)
    return { valid: false, strength: "medium", message: "Add more character types for a stronger password" }
  if (complexity === 3) return { valid: true, strength: "good", message: "Good password strength" }
  if (complexity === 4) return { valid: true, strength: "strong", message: "Strong password" }

  return { valid: false, strength: "weak", message: "Invalid password" }
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  phoneCountry: {
    cca2: string
    callingCode?: string[]
  }
  country: {
    cca2: string
    name: string
    callingCode?: string[]
  }
  formattedPhoneNumber: string
  acceptedTerms: boolean
  acceptedWaiver: boolean
  // Emergency contact fields (for athletes)
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactPhoneFormatted: string
  emergencyContactPhoneCountry: {
    cca2: string
    callingCode?: string[]
  }
  emergencyContactRelationship: string
}

export interface SignupFormErrors {
  email?: string | null
  password?: string | null
  confirmPassword?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  phoneNumber?: string | null
  acceptedTerms?: string | null
  acceptedWaiver?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelationship?: string | null
  general?: string | null
  [key: string]: string | null | undefined
}

export const useSignupForm = () => {
  // Form state
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    phoneCountry: {
      cca2: "CA",
      callingCode: ["1"],
    },
    country: {
      cca2: "CA",
      name: "Canada",
    },
    formattedPhoneNumber: "",
    acceptedTerms: false,
    acceptedWaiver: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactPhoneFormatted: "",
    emergencyContactPhoneCountry: {
      cca2: "CA",
      callingCode: ["1"],
    },
    emergencyContactRelationship: "",
  })

  // UI state
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [phoneInputFocused, setPhoneInputFocused] = useState(false)
  const [emergencyPhoneInputFocused, setEmergencyPhoneInputFocused] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [countryPickerVisible, setCountryPickerVisible] = useState(false)
  const [phoneCountryPickerVisible, setPhoneCountryPickerVisible] = useState(false)
  const [emergencyPhoneCountryPickerVisible, setEmergencyPhoneCountryPickerVisible] = useState(false)

  // Update form data
  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field if it exists
    if (errors[field as keyof SignupFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof SignupFormErrors]
        return newErrors
      })
    }
  }

  // Format phone number
  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "")
    updateFormData("phoneNumber", cleaned)

    // Format based on length
    let formatted = cleaned
    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }

    updateFormData("formattedPhoneNumber", formatted)
  }

  // Format emergency contact phone number
  const formatEmergencyContactPhone = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "")
    updateFormData("emergencyContactPhone", cleaned)

    // Format based on length
    let formatted = cleaned
    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }

    updateFormData("emergencyContactPhoneFormatted", formatted)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: SignupFormErrors = {}

    if (!formData.email) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format"

    if (!formData.password) newErrors.password = "Password is required"
    else {
      const passwordCheck = validatePassword(formData.password)
      if (!passwordCheck.valid) newErrors.password = passwordCheck.message
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match"

    if (!formData.role) newErrors.role = "Please select a role"

    if (formData.role === "athlete") {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
      if (!formData.gender) newErrors.gender = "Please select your gender"
      if (!formData.emergencyContactName) newErrors.emergencyContactName = "Emergency contact name is required"
      if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = "Emergency contact phone is required"
      if (!formData.emergencyContactRelationship) newErrors.emergencyContactRelationship = "Emergency contact relationship is required"
    }

    // Waiver and terms validation
    if (!formData.acceptedTerms) newErrors.acceptedTerms = "You must accept the Terms of Service"
    if (!formData.acceptedWaiver) newErrors.acceptedWaiver = "You must accept the Liability Waiver"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return {
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
  }
}


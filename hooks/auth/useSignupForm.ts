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
  phoneNumber: string
  country: {
    cca2: string
    name: string
    callingCode?: string[]
  }
  formattedPhoneNumber: string
}

export interface SignupFormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  role?: string
  dateOfBirth?: string
  phoneNumber?: string
  general?: string
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
    phoneNumber: "",
    country: {
      cca2: "US",
      name: "United States",
    },
    formattedPhoneNumber: "",
  })

  // UI state
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [phoneInputFocused, setPhoneInputFocused] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [countryPickerVisible, setCountryPickerVisible] = useState(false)

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

    if (formData.role === "athlete" && !formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return {
    formData,
    errors,
    passwordVisible,
    confirmPasswordVisible,
    phoneInputFocused,
    roleModalVisible,
    countryPickerVisible,
    updateFormData,
    setErrors,
    setPasswordVisible,
    setConfirmPasswordVisible,
    setPhoneInputFocused,
    setRoleModalVisible,
    setCountryPickerVisible,
    formatPhoneNumber,
    validateForm,
    validatePassword,
  }
}


"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Linking, Alert, Platform, ActivityIndicator } from "react-native"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { format, differenceInYears } from "date-fns"
import CountryPicker from "react-native-country-picker-modal"
import * as Haptics from "expo-haptics"
import type { SignupFormErrors } from "@/hooks/auth/useSignupForm"

interface SignupStep2FormProps {
  firstName: string
  setFirstName: (text: string) => void
  lastName: string
  setLastName: (text: string) => void
  dateOfBirth: string
  setDateOfBirth: (date: string) => void
  gender: string
  setGender: (gender: string) => void
  role: string
  setRole: (role: string) => void
  phoneNumber: string
  setPhoneNumber: (number: string) => void
  formattedPhoneNumber: string
  setFormattedPhoneNumber: (number: string) => void
  phoneInputFocused: boolean
  setPhoneInputFocused: (focused: boolean) => void
  phoneCountry: any
  setPhoneCountry: (country: any) => void
  country: any
  setCountry: (country: any) => void
  errors: SignupFormErrors
  setErrors: (errors: SignupFormErrors) => void
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
  onSignUp: () => void
  onOpenRoleModal: () => void
  onCancelRegistration: () => void
  isLoading: boolean
  setCountryPickerVisible: (visible: boolean) => void
  countryPickerVisible: boolean
  setPhoneCountryPickerVisible: (visible: boolean) => void
  phoneCountryPickerVisible: boolean
  formatPhoneNumber: (text: string) => void
  acceptedTerms: boolean
  setAcceptedTerms: (accepted: boolean) => void
  acceptedWaiver: boolean
  setAcceptedWaiver: (accepted: boolean) => void
  // Emergency contact fields (for athletes)
  emergencyContactName: string
  setEmergencyContactName: (name: string) => void
  emergencyContactPhone: string
  setEmergencyContactPhone: (phone: string) => void
  emergencyContactPhoneFormatted: string
  emergencyContactPhoneCountry: any
  setEmergencyContactPhoneCountry: (country: any) => void
  emergencyPhoneInputFocused: boolean
  setEmergencyPhoneInputFocused: (focused: boolean) => void
  emergencyPhoneCountryPickerVisible: boolean
  setEmergencyPhoneCountryPickerVisible: (visible: boolean) => void
  formatEmergencyContactPhone: (text: string) => void
  emergencyContactRelationship: string
  setEmergencyContactRelationship: (relationship: string) => void
}

export const SignupStep2Form: React.FC<SignupStep2FormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  role,
  setRole,
  phoneNumber,
  phoneInputFocused,
  setPhoneInputFocused,
  formattedPhoneNumber,
  phoneCountry,
  setPhoneCountry,
  country,
  setCountry,
  errors,
  setErrors,
  fadeAnim,
  slideAnim,
  onSignUp,
  onOpenRoleModal,
  onCancelRegistration,
  isLoading,
  setCountryPickerVisible,
  countryPickerVisible,
  setPhoneCountryPickerVisible,
  phoneCountryPickerVisible,
  formatPhoneNumber,
  acceptedTerms,
  setAcceptedTerms,
  acceptedWaiver,
  setAcceptedWaiver,
  emergencyContactName,
  setEmergencyContactName,
  emergencyContactPhone,
  setEmergencyContactPhone,
  emergencyContactPhoneFormatted,
  emergencyContactPhoneCountry,
  setEmergencyContactPhoneCountry,
  emergencyPhoneInputFocused,
  setEmergencyPhoneInputFocused,
  emergencyPhoneCountryPickerVisible,
  setEmergencyPhoneCountryPickerVisible,
  formatEmergencyContactPhone,
  emergencyContactRelationship,
  setEmergencyContactRelationship,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false)
  const [isGenderPickerVisible, setGenderPickerVisible] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisible(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }

  const handleConfirmDate = (date: Date) => {
    const age = differenceInYears(new Date(), date)

    // Check if user is under 13
    if (age < 13) {
      // Close the picker first
      hideDatePicker()

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }

      // Use setTimeout to ensure the picker is closed before showing alert
      setTimeout(() => {
        Alert.alert(
          "Parental Consent Required",
          "You must be at least 13 years old to create an account. Please use your parent's or guardian's email address to register.",
          [
            {
              text: "OK",
              onPress: () => {
                // Show second confirmation
                Alert.alert(
                  "Confirm",
                  "Are you using your parent or guardian's email address?",
                  [
                    {
                      text: "No, I can't register",
                      style: "destructive",
                      onPress: () => {
                        // Cancel the registration and go back to login
                        Alert.alert(
                          "Registration Cancelled",
                          "You must be 13 or older, or have parental consent to create an account.",
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                onCancelRegistration()
                              },
                            },
                          ]
                        )
                      },
                    },
                    {
                      text: "Yes, continue",
                      onPress: () => {
                        setDateOfBirth(format(date, "yyyy-MM-dd"))
                        if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: null })
                      },
                    },
                  ],
                  { cancelable: false }
                )
              },
            },
          ],
          { cancelable: false }
        )
      }, 100)
    } else {
      // User is 13 or older
      setDateOfBirth(format(date, "yyyy-MM-dd"))
      hideDatePicker()
      if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: null })
    }
  }

  const renderRoleIcon = () => {
    switch (role) {
      case "athlete":
        return <FontAwesome5 name="basketball-ball" size={18} color="#FCA311" />
      case "coach":
        return <FontAwesome5 name="chalkboard-teacher" size={18} color="#FCA311" />
      case "parent":
        return <Ionicons name="people" size={18} color="#FCA311" />
      case "instructor":
        return <MaterialCommunityIcons name="whistle" size={18} color="#FCA311" />
      case "barber":
        return <MaterialCommunityIcons name="content-cut" size={18} color="#FCA311" />
      default:
        return <Ionicons name="person-outline" size={18} color="#9EA0A4" />
    }
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* First Name */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text)
              if (errors.firstName) setErrors({ ...errors, firstName: null })
            }}
          />
        </View>
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      {/* Last Name */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text)
              if (errors.lastName) setErrors({ ...errors, lastName: null })
            }}
          />
        </View>
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}
          onPress={showDatePicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <Text style={[styles.pickerText, dateOfBirth ? styles.activePickerText : {}]}>
            {dateOfBirth ? dateOfBirth : "Date of Birth"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9EA0A4" style={styles.dropdownIcon} />
        </TouchableOpacity>
        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
        date={dateOfBirth ? new Date(dateOfBirth) : new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
      />

      {/* Role Selection */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={[styles.inputWrapper, errors.role && styles.inputError]} onPress={onOpenRoleModal}>
          {renderRoleIcon()}
          <Text style={[styles.pickerText, role ? styles.activePickerText : {}]}>
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Select your role"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9EA0A4" style={styles.dropdownIcon} />
        </TouchableOpacity>
        {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
      </View>

      {/* Gender Selection (Athletes only) */}
      {role === "athlete" && (
        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            {[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "O", label: "Other" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  gender === option.value && styles.genderOptionSelected,
                ]}
                onPress={() => {
                  setGender(option.value)
                  if (errors.gender) setErrors({ ...errors, gender: null })
                }}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    gender === option.value && styles.genderOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>
      )}

      {/* Emergency Contact Section (Athletes only) */}
      {role === "athlete" && (
        <>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          {/* Emergency Contact Name */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
              <TextInput
                placeholder="Emergency Contact Name"
                placeholderTextColor="#9EA0A4"
                style={[styles.input, errors.emergencyContactName && styles.inputError]}
                value={emergencyContactName}
                onChangeText={(text) => {
                  setEmergencyContactName(text)
                  if (errors.emergencyContactName) setErrors({ ...errors, emergencyContactName: null })
                }}
              />
            </View>
            {errors.emergencyContactName && <Text style={styles.errorText}>{errors.emergencyContactName}</Text>}
          </View>

          {/* Emergency Contact Phone */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.emergencyContactPhone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />

              <TouchableOpacity style={styles.countryCodeContainer} onPress={() => setEmergencyPhoneCountryPickerVisible(true)}>
                <Text style={styles.countryCodeText}>{emergencyContactPhoneCountry ? `+${emergencyContactPhoneCountry.callingCode?.[0] || "1"}` : "+1"}</Text>
                <Ionicons name="chevron-down" size={16} color="#9EA0A4" />
              </TouchableOpacity>

              <TextInput
                placeholder="Emergency Contact Phone"
                placeholderTextColor="#9EA0A4"
                style={styles.input}
                value={emergencyPhoneInputFocused ? emergencyContactPhone : emergencyContactPhoneFormatted}
                onChangeText={formatEmergencyContactPhone}
                keyboardType="phone-pad"
                onFocus={() => setEmergencyPhoneInputFocused(true)}
                onBlur={() => setEmergencyPhoneInputFocused(false)}
              />
            </View>
            {errors.emergencyContactPhone && <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>}
          </View>

          {/* Emergency Phone Country Picker Modal */}
          {emergencyPhoneCountryPickerVisible && (
            <CountryPicker
              withFilter
              withFlag
              withCallingCode
              withAlphaFilter
              withEmoji
              countryCode={emergencyContactPhoneCountry?.cca2 || "US"}
              onSelect={(selectedCountry) => {
                setEmergencyContactPhoneCountry(selectedCountry)
                setEmergencyPhoneCountryPickerVisible(false)
              }}
              onClose={() => setEmergencyPhoneCountryPickerVisible(false)}
              visible={true}
            />
          )}

          {/* Emergency Contact Relationship */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="people-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
              <TextInput
                placeholder="Relationship (e.g., Parent, Spouse)"
                placeholderTextColor="#9EA0A4"
                style={[styles.input, errors.emergencyContactRelationship && styles.inputError]}
                value={emergencyContactRelationship}
                onChangeText={(text) => {
                  setEmergencyContactRelationship(text)
                  if (errors.emergencyContactRelationship) setErrors({ ...errors, emergencyContactRelationship: null })
                }}
              />
            </View>
            {errors.emergencyContactRelationship && <Text style={styles.errorText}>{errors.emergencyContactRelationship}</Text>}
          </View>
        </>
      )}

      {/* Phone Number with Country Code */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
          <Ionicons name="call-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />

          <TouchableOpacity style={styles.countryCodeContainer} onPress={() => setPhoneCountryPickerVisible(true)}>
            <Text style={styles.countryCodeText}>{phoneCountry ? `+${phoneCountry.callingCode?.[0] || "1"}` : "+1"}</Text>
            <Ionicons name="chevron-down" size={16} color="#9EA0A4" />
          </TouchableOpacity>

          <TextInput
            placeholder="Your Phone Number"
            placeholderTextColor="#9EA0A4"
            style={styles.input}
            value={phoneInputFocused ? phoneNumber : formattedPhoneNumber}
            onChangeText={formatPhoneNumber}
            keyboardType="phone-pad"
            onFocus={() => setPhoneInputFocused(true)}
            onBlur={() => setPhoneInputFocused(false)}
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>

      {/* Phone Country Picker Modal */}
      {phoneCountryPickerVisible && (
        <CountryPicker
          withFilter
          withFlag
          withCallingCode
          withAlphaFilter
          withEmoji
          countryCode={phoneCountry?.cca2 || "US"}
          onSelect={(selectedCountry) => {
            setPhoneCountry(selectedCountry)
            setPhoneCountryPickerVisible(false)
          }}
          onClose={() => setPhoneCountryPickerVisible(false)}
          visible={true}
        />
      )}

      {/* Country Picker */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputWrapper} onPress={() => setCountryPickerVisible(true)}>
          <Ionicons name="globe-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <Text style={[styles.pickerText, country ? styles.activePickerText : {}]}>
            {country ? country.name : "Select your country"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9EA0A4" style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>

      {/* Country Picker Modal (for location only, not phone) */}
      {countryPickerVisible && (
        <CountryPicker
          withFilter
          withFlag
          withCountryNameButton
          withAlphaFilter
          withEmoji
          countryCode={country?.cca2 || "US"}
          onSelect={(selectedCountry) => {
            setCountry(selectedCountry)
            setCountryPickerVisible(false)
          }}
          onClose={() => setCountryPickerVisible(false)}
          visible={true}
        />
      )}

      {/* Terms of Service Checkbox */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            setAcceptedTerms(!acceptedTerms)
            if (errors.acceptedTerms) setErrors({ ...errors, acceptedTerms: null })
          }}
        >
          <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked]}>
            {acceptedTerms && <Ionicons name="checkmark" size={18} color="#000" />}
          </View>
          <Text style={styles.checkboxText}>
            I accept the{" "}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL("https://storage.googleapis.com/rise-sports/waivers/terms.pdf")}
            >
              Terms of Service
            </Text>
          </Text>
        </TouchableOpacity>
        {errors.acceptedTerms && <Text style={styles.checkboxError}>{errors.acceptedTerms}</Text>}
      </View>

      {/* Liability Waiver Checkbox */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            setAcceptedWaiver(!acceptedWaiver)
            if (errors.acceptedWaiver) setErrors({ ...errors, acceptedWaiver: null })
          }}
        >
          <View style={[styles.checkboxBox, acceptedWaiver && styles.checkboxBoxChecked]}>
            {acceptedWaiver && <Ionicons name="checkmark" size={18} color="#000" />}
          </View>
          <Text style={styles.checkboxText}>
            I accept the{" "}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL("https://storage.googleapis.com/rise-sports/waivers/waiver.pdf")}
            >
              Liability Waiver
            </Text>
          </Text>
        </TouchableOpacity>
        {errors.acceptedWaiver && <Text style={styles.checkboxError}>{errors.acceptedWaiver}</Text>}
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={onSignUp} disabled={isLoading} activeOpacity={0.8}>
        <LinearGradient
          colors={isLoading ? ["rgba(252, 163, 17, 0.5)", "rgba(232, 146, 15, 0.5)"] : ["#FCA311", "#E8920F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Text style={styles.buttonText}>SIGN UP</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </>
          )}
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
  pickerText: {
    flex: 1,
    color: "#9EA0A4",
    fontSize: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  activePickerText: {
    color: "#FFFFFF",
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  countryCodeText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 5,
  },
  checkboxContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#FCA311",
    borderColor: "#FCA311",
  },
  checkboxText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: "#FCA311",
    textDecorationLine: "underline",
  },
  checkboxError: {
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 36,
  },
  signUpButton: {
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
  sectionTitle: {
    color: "#FCA311",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    color: "#9EA0A4",
    fontSize: 14,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  genderOptionSelected: {
    borderColor: "#FCA311",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
  },
  genderOptionText: {
    color: "#9EA0A4",
    fontSize: 14,
  },
  genderOptionTextSelected: {
    color: "#FCA311",
    fontWeight: "600",
  },
})


"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { format } from "date-fns"
import CountryPicker from "react-native-country-picker-modal"

interface SignupStep2FormProps {
  firstName: string
  setFirstName: (text: string) => void
  lastName: string
  setLastName: (text: string) => void
  dateOfBirth: string
  setDateOfBirth: (date: string) => void
  role: string
  setRole: (role: string) => void
  phoneNumber: string
  setPhoneNumber: (number: string) => void
  formattedPhoneNumber: string
  setFormattedPhoneNumber: (number: string) => void
  phoneInputFocused: boolean
  setPhoneInputFocused: (focused: boolean) => void
  country: any
  setCountry: (country: any) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
  onSignUp: () => void
  onOpenRoleModal: () => void
  isLoading: boolean
  setCountryPickerVisible: (visible: boolean) => void
  countryPickerVisible: boolean
  formatPhoneNumber: (text: string) => void
}

export const SignupStep2Form: React.FC<SignupStep2FormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
  role,
  setRole,
  phoneNumber,
  phoneInputFocused,
  setPhoneInputFocused,
  formattedPhoneNumber,
  country,
  setCountry,
  errors,
  setErrors,
  fadeAnim,
  slideAnim,
  onSignUp,
  onOpenRoleModal,
  isLoading,
  setCountryPickerVisible,
  countryPickerVisible,
  formatPhoneNumber,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisible(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }

  const handleConfirmDate = (date) => {
    setDateOfBirth(format(date, "yyyy-MM-dd"))
    hideDatePicker()
    if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: null })
  }

  const renderRoleIcon = () => {
    switch (role) {
      case "athlete":
        return <FontAwesome5 name="basketball-ball" size={18} color="#FFD700" />
      case "coach":
        return <FontAwesome5 name="chalkboard-teacher" size={18} color="#FFD700" />
      case "parent":
        return <Ionicons name="people" size={18} color="#FFD700" />
      case "instructor":
        return <MaterialCommunityIcons name="whistle" size={18} color="#FFD700" />
      case "barber":
        return <MaterialCommunityIcons name="content-cut" size={18} color="#FFD700" />
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

      {/* Phone Number with Country Code */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
          <Ionicons name="call-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />

          <TouchableOpacity style={styles.countryCodeContainer} onPress={() => setCountryPickerVisible(true)}>
            <Text style={styles.countryCodeText}>{country ? `+${country.callingCode?.[0] || "1"}` : "+1"}</Text>
            <Ionicons name="chevron-down" size={16} color="#9EA0A4" />
          </TouchableOpacity>

          <TextInput
            placeholder="Phone Number"
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

      {/* Country Picker Modal */}
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

      <TouchableOpacity style={styles.signUpButton} onPress={onSignUp} disabled={isLoading}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
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
})


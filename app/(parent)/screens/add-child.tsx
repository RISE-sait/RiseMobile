"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import BackButton from "@/components/buttons/BackButton"
import DateTimePicker from "@react-native-community/datetimepicker"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.92

export default function AddChildScreen() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [sport, setSport] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [date, setDate] = useState(new Date())
  const [activeField, setActiveField] = useState(null)

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setShowDatePicker(Platform.OS === "ios")
    setDate(currentDate)

    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(2, "0")
    setDateOfBirth(`${year}-${month}-${day}`)

    if (errors.dateOfBirth) {
      setErrors({ ...errors, dateOfBirth: null })
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!firstName.trim()) newErrors.firstName = "First name is required"
    if (!lastName.trim()) newErrors.lastName = "Last name is required"
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddChild = async () => {
    if (!validateForm()) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      } catch (error) {
        console.log("Haptics not available")
      }
      return
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (error) {
      console.log("Haptics not available")
    }

    setIsLoading(true)

    try {
      // Calculate age from date of birth
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      // Get parent token from AsyncStorage
      const storedUser = await AsyncStorage.getItem("user")
      if (!storedUser) {
        throw new Error("Parent authentication required")
      }

      const parentData = JSON.parse(storedUser)
      const parentToken = parentData.token

      if (!parentToken) {
        throw new Error("Parent token not found")
      }

      console.log("🔑 Using parent token:", parentToken.substring(0, 10) + "...")
      console.log("📝 Registering child with data:", {
        firstName,
        lastName,
        age,
        countryCode: parentData.countryCode || "US",
      })

      // Mock successful registration for now
      // In a real app, you would call your API here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch (error) {
        console.log("Haptics not available")
      }

      Alert.alert("Success", "Your child has been added successfully to your account.", [
        { text: "OK", onPress: () => router.back() },
      ])
    } catch (error) {
      console.error("Failed to add child:", error)

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      } catch (hapticError) {
        console.log("Haptics not available")
      }

      // Set a more descriptive error message based on the error
      let errorMsg = "Failed to add child. Please try again."
      if (error.message) {
        errorMsg = `Error: ${error.message}`
      }

      Alert.alert("Error", errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const focusField = (fieldName) => {
    setActiveField(fieldName)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
  }

  const blurField = () => {
    setActiveField(null)
  }

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!dateOfBirth) return null

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const age = calculateAge()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-4 pt-4">
            <View className="flex-row items-center mb-4">
              <BackButton />
              <Text className="text-white-100 text-xl font-bold ml-2">Add Child</Text>
            </View>

            {/* Personal Information Card */}
            <View style={styles.formCard}>
              <View className="mb-5">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons name="account-details" size={20} color="#FFD700" />
                  <Text className="text-white-100 text-xl font-semibold ml-2">Personal Information</Text>
                </View>
                <View style={styles.divider} />
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white-100 font-medium">First Name</Text>
                  {errors.firstName && <Text className="text-[#FF4D4F] text-xs">{errors.firstName}</Text>}
                </View>
                <View
                  className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${
                    activeField === "firstName"
                      ? "border border-[#FFD700]"
                      : errors.firstName
                        ? "border border-[#FF4D4F]"
                        : ""
                  }`}
                >
                  <FontAwesome5 name="user-alt" size={14} color="#FFD700" />
                  <TextInput
                    className="flex-1 text-white-100 ml-3 text-base"
                    placeholder="Enter first name"
                    placeholderTextColor="#666"
                    value={firstName}
                    onFocus={() => focusField("firstName")}
                    onBlur={blurField}
                    onChangeText={(text) => {
                      setFirstName(text)
                      if (errors.firstName) {
                        setErrors({ ...errors, firstName: null })
                      }
                    }}
                  />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white-100 font-medium">Last Name</Text>
                  {errors.lastName && <Text className="text-[#FF4D4F] text-xs">{errors.lastName}</Text>}
                </View>
                <View
                  className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${
                    activeField === "lastName"
                      ? "border border-[#FFD700]"
                      : errors.lastName
                        ? "border border-[#FF4D4F]"
                        : ""
                  }`}
                >
                  <FontAwesome5 name="user-alt" size={14} color="#FFD700" />
                  <TextInput
                    className="flex-1 text-white-100 ml-3 text-base"
                    placeholder="Enter last name"
                    placeholderTextColor="#666"
                    value={lastName}
                    onFocus={() => focusField("lastName")}
                    onBlur={blurField}
                    onChangeText={(text) => {
                      setLastName(text)
                      if (errors.lastName) {
                        setErrors({ ...errors, lastName: null })
                      }
                    }}
                  />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white-100 font-medium">Date of Birth</Text>
                  {errors.dateOfBirth && <Text className="text-[#FF4D4F] text-xs">{errors.dateOfBirth}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center justify-between ${
                    activeField === "dateOfBirth"
                      ? "border border-[#FFD700]"
                      : errors.dateOfBirth
                        ? "border border-[#FF4D4F]"
                        : ""
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={16} color="#FFD700" />
                    <Text className={`ml-3 text-base ${dateOfBirth ? "text-white-100" : "text-[#666]"}`}>
                      {dateOfBirth || "Select date of birth"}
                    </Text>
                  </View>
                  {age !== null && <Text className="text-[#FFD700]">{age} years old</Text>}
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1990, 0, 1)}
                  />
                )}
              </View>
            </View>

            {/* Sports Information Card */}
            <View style={styles.formCard}>
              <View className="mb-5">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons name="basketball" size={20} color="#FFD700" />
                  <Text className="text-white-100 text-xl font-semibold ml-2">Sports Information</Text>
                </View>
                <View style={styles.divider} />
              </View>

              <View className="mb-4">
                <Text className="text-white-100 font-medium mb-2">Primary Sport</Text>
                <View
                  className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${
                    activeField === "sport" ? "border border-[#FFD700]" : ""
                  }`}
                >
                  <Ionicons name="basketball-outline" size={16} color="#FFD700" />
                  <TextInput
                    className="flex-1 text-white-100 ml-3 text-base"
                    placeholder="e.g. Basketball, Soccer"
                    placeholderTextColor="#666"
                    value={sport}
                    onFocus={() => focusField("sport")}
                    onBlur={blurField}
                    onChangeText={setSport}
                  />
                </View>
                <Text className="text-gray-500 text-xs mt-1 ml-1">Optional</Text>
              </View>

              <View className="mb-2">
                <Text className="text-white-100 font-medium mb-2">Jersey Number</Text>
                <View
                  className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${
                    activeField === "jerseyNumber" ? "border border-[#FFD700]" : ""
                  }`}
                >
                  <Ionicons name="shirt-outline" size={16} color="#FFD700" />
                  <TextInput
                    className="flex-1 text-white-100 ml-3 text-base"
                    placeholder="e.g. 23"
                    placeholderTextColor="#666"
                    value={jerseyNumber}
                    onFocus={() => focusField("jerseyNumber")}
                    onBlur={blurField}
                    onChangeText={setJerseyNumber}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <Text className="text-gray-500 text-xs mt-1 ml-1">Optional</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="mb-6 mt-4"
              onPress={handleAddChild}
              disabled={isLoading}
              activeOpacity={0.8}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text className="text-black font-bold text-lg">Add Child</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <View className="flex-row items-start mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#FFD700" style={{ marginTop: 1 }} />
                <Text className="text-white-100 font-semibold text-base ml-2">Parent Confirmation</Text>
              </View>
              <Text className="text-gray-400 text-sm">
                By adding your child, you confirm that you are the legal guardian and have the authority to register
                them on the Rise platform.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 8,
  },
  buttonContainer: {
    width: "100%",
    alignSelf: "center",
  },
  infoCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
})


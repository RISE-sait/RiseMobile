"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import BackButton from "@/components/BackButton"
import images from "@/constants/images"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  phoneNumber?: string
  bio?: string
  specialties?: string[]
  experience?: string
  countryCode: string
  token: string
}

export default function EditProfileScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Initialize form fields
          setFirstName(parsedUser.firstName || "")
          setLastName(parsedUser.lastName || "")
          setEmail(parsedUser.email || "")
          setPhoneNumber(parsedUser.phoneNumber || "")
          setBio(parsedUser.bio || "")
          setExperience(parsedUser.experience || "")
          setSpecialties(parsedUser.specialties || [])
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() !== "" && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (index: number) => {
    const updatedSpecialties = [...specialties]
    updatedSpecialties.splice(index, 1)
    setSpecialties(updatedSpecialties)
  }

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    setIsSaving(true)
    try {
      // Update user object with form values
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        experience,
        specialties,
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
      Alert.alert("Success", "Profile updated successfully")
      router.back()
    } catch (error) {
      console.error("Error saving profile:", error)
      Alert.alert("Error", "Failed to save profile changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <BackButton />
            <Text className="text-white text-xl font-bold">Edit Profile</Text>
            <View style={{ width: 40 }} /> {/* Empty view for spacing */}
          </View>

          {/* Profile Image (Display Only) */}
          <View className="items-center my-6">
            <Image
              source={user?.profileImage ? { uri: user.profileImage } : images.instructorHeadshot}
              className="w-24 h-24 rounded-full"
            />
            <Text className="text-gray-400 text-sm mt-2">Profile Image</Text>
          </View>

          {/* Form */}
          <View className="px-4 space-y-4">
            {/* Personal Information */}
            <Text className="text-white text-lg font-bold mb-2">Personal Information</Text>

            <View className="space-y-2">
              <Text className="text-gray-400">First Name*</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
              />
            </View>

            <View className="space-y-2">
              <Text className="text-gray-400">Last Name*</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
              />
            </View>

            <View className="space-y-2">
              <Text className="text-gray-400">Email*</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
              />
            </View>

            <View className="space-y-2">
              <Text className="text-gray-400">Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
              />
            </View>

            {/* Bio */}
            <View className="space-y-2 mt-4">
              <Text className="text-white text-lg font-bold">Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
                textAlignVertical="top"
              />
            </View>

            {/* Experience */}
            <View className="space-y-2 mt-4">
              <Text className="text-white text-lg font-bold">Experience</Text>
              <TextInput
                value={experience}
                onChangeText={setExperience}
                multiline
                numberOfLines={3}
                className="bg-[#1C1C1E] text-white p-3 rounded-lg"
                placeholderTextColor="#666"
                textAlignVertical="top"
              />
            </View>

            {/* Specialties */}
            <View className="mt-4">
              <Text className="text-white text-lg font-bold mb-2">Specialties</Text>

              {/* Add new specialty */}
              <View className="flex-row space-x-2 mb-4">
                <TextInput
                  value={newSpecialty}
                  onChangeText={setNewSpecialty}
                  placeholder="Add a specialty"
                  className="bg-[#1C1C1E] text-white p-3 rounded-lg flex-1"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity onPress={handleAddSpecialty} className="bg-[#FFD700] p-3 rounded-lg justify-center">
                  <Text className="text-black font-bold">Add</Text>
                </TouchableOpacity>
              </View>

              {/* Specialty tags */}
              <View className="flex-row flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <View key={index} className="bg-[#1C1C1E] rounded-full px-3 py-2 flex-row items-center">
                    <Text className="text-white mr-2">{specialty}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSpecialty(index)}>
                      <Ionicons name="close-circle" size={16} color="#999" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`mt-8 p-4 rounded-xl items-center ${isSaving ? "bg-gray-600" : "bg-[#FFD700]"}`}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-black font-bold text-lg">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}


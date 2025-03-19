"use client"

import { useState, useEffect } from "react"
import { Text, View, ScrollView, TouchableOpacity, Image, Switch, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/app/utils/auth"
import images from "@/constants/images"

// Define User Type
type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  countryCode: string
  token: string
  phoneNumber?: string
}

export default function BarberProfileScreen() {
  const router = useRouter()
  const { logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(true)
  const [availableForBooking, setAvailableForBooking] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser({
            ...parsedUser,
            firstName: parsedUser.firstName || parsedUser.first_name || "",
            lastName: parsedUser.lastName || parsedUser.last_name || "",
            countryCode: parsedUser.countryCode || parsedUser.country_code || "US",
          })
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => logout(),
        style: "destructive",
      },
    ])
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <ScrollView className="flex-1">
        <View className="px-5 pt-12 pb-6 items-center">
          <Image
            source={user?.profileImage ? { uri: user.profileImage } : images.barberHeadshot}
            className="w-24 h-24 rounded-full"
          />

          <Text className="text-white text-2xl font-bold mt-4">
            {user?.firstName} {user?.lastName}
          </Text>

          <Text className="text-gray-400">{user?.email}</Text>

          <TouchableOpacity
            className="mt-4 bg-[#1A1A1A] px-4 py-2 rounded-full flex-row items-center"
            onPress={() => router.push("/screens/edit-profile")}
          >
            <Ionicons name="pencil" size={16} color="#FFD700" />
            <Text className="text-gold-100 ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5">
          <Text className="text-white text-lg font-bold mb-2">Availability</Text>

          <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mb-6">
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Available for Booking</Text>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#FFD700" }}
                thumbColor={availableForBooking ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#333"
                onValueChange={setAvailableForBooking}
                value={availableForBooking}
              />
            </View>
          </View>

          <Text className="text-white text-lg font-bold mb-2">Account</Text>

          <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mb-6">
            <TouchableOpacity
              className="p-4 border-b border-[#333] flex-row items-center justify-between"
              onPress={() => router.push("/screens/service-management")}
            >
              <View className="flex-row items-center">
                <Ionicons name="cut" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Manage Services</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 border-b border-[#333] flex-row items-center justify-between"
              onPress={() => router.push("/screens/earnings")}
            >
              <View className="flex-row items-center">
                <Ionicons name="cash" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Earnings & Payments</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-[#333] flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Working Hours</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="lock-closed" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-bold mb-2">Notifications</Text>

          <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mb-6">
            <View className="p-4 border-b border-[#333] flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Push Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#FFD700" }}
                thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#333"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Email Updates</Text>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#FFD700" }}
                thumbColor={emailUpdatesEnabled ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#333"
                onValueChange={setEmailUpdatesEnabled}
                value={emailUpdatesEnabled}
              />
            </View>
          </View>

          <Text className="text-white text-lg font-bold mb-2">Support</Text>

          <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mb-6">
            <TouchableOpacity className="p-4 border-b border-[#333] flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="help-circle" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-[#333] flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFD700" />
                <Text className="text-white ml-3">Contact Us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#FFD700" />
                <Text className="text-white ml-3">About Rise</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-[#1A1A1A] rounded-xl p-4 flex-row items-center justify-center mb-8"
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#FF4D4F" />
            <Text className="text-[#FF4D4F] ml-2 font-bold">Logout</Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-center mb-8">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


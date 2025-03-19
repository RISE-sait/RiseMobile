"use client"

import { useEffect, useState } from "react"
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"

import images from "@/constants/images"
import ProfileHeader from "@/app/components/ProfileHeader"
import QRCodeModal from "@/app/components/QRCodeModal"

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
}

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    clientName: "Michael Johnson",
    service: "Fade Haircut",
    date: dayjs().format("YYYY-MM-DD"),
    time: "10:00 AM",
    duration: 30,
    price: 25,
    status: "confirmed",
  },
  {
    id: "2",
    clientName: "James Wilson",
    service: "Lineup & Beard Trim",
    date: dayjs().format("YYYY-MM-DD"),
    time: "11:30 AM",
    duration: 45,
    price: 35,
    status: "confirmed",
  },
  {
    id: "3",
    clientName: "Dwayne Carter",
    service: "Taper Fade",
    date: dayjs().format("YYYY-MM-DD"),
    time: "1:15 PM",
    duration: 30,
    price: 25,
    status: "confirmed",
  },
]

export default function BarberHome() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [todaysAppointments, setTodaysAppointments] = useState(mockAppointments)
  const [stats, setStats] = useState({
    todayEarnings: 85,
    weeklyEarnings: 450,
    monthlyEarnings: 1850,
    appointmentsToday: 3,
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("📢 Loaded user from AsyncStorage:", parsedUser)

          setUser({
            ...parsedUser,
            firstName: parsedUser.firstName || parsedUser.first_name || "",
            lastName: parsedUser.lastName || parsedUser.last_name || "",
            countryCode: parsedUser.countryCode || parsedUser.country_code || "US",
          })
        } else {
          console.log("⚠️ No user found in AsyncStorage.")
        }
      } catch (error) {
        console.error("❌ Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white text-center mt-4">Loading user data...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Only render when user exists */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader
              firstName={user.firstName}
              lastName={user.lastName}
              role="Barber"
              profileImage={user.profileImage ? { uri: user.profileImage } : images.barberHeadshot}
              countryCode={user?.countryCode}
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Stats Section */}
        <View className="mt-6 px-5">
          <Text className="text-white text-xl font-bold mb-2">Today's Overview</Text>
          <View className="flex-row justify-between">
            <View className="bg-[#1A1A1A] rounded-xl p-4 w-[48%]">
              <Text className="text-gray-400">Today's Earnings</Text>
              <Text className="text-gold-100 text-2xl font-bold">${stats.todayEarnings}</Text>
              <TouchableOpacity className="flex-row items-center mt-2" onPress={() => router.push("/screens/earnings")}>
                <Text className="text-white text-xs">View Details</Text>
                <Ionicons name="chevron-forward" size={12} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="bg-[#1A1A1A] rounded-xl p-4 w-[48%]">
              <Text className="text-gray-400">Appointments</Text>
              <Text className="text-gold-100 text-2xl font-bold">{stats.appointmentsToday}</Text>
              <TouchableOpacity className="flex-row items-center mt-2" onPress={() => router.push("/appointments")}>
                <Text className="text-white text-xs">View Schedule</Text>
                <Ionicons name="chevron-forward" size={12} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Appointments */}
        <View className="mt-6 px-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-xl font-bold">Today's Appointments</Text>
            <TouchableOpacity onPress={() => router.push("/appointments")}>
              <Text className="text-gold-100">View All</Text>
            </TouchableOpacity>
          </View>

          {todaysAppointments.length > 0 ? (
            todaysAppointments.map((appointment, index) => (
              <TouchableOpacity
                key={index}
                className="bg-[#1A1A1A] rounded-xl p-4 mb-3"
                onPress={() => router.push(`/screens/appointment-details/${appointment.id}`)}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-lg font-bold">{appointment.clientName}</Text>
                    <Text className="text-gold-100">{appointment.service}</Text>
                    <Text className="text-gray-400">
                      {appointment.time} • {appointment.duration} min
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">${appointment.price}</Text>
                    <View className="bg-[#2A2A2A] px-3 py-1 rounded-full mt-1">
                      <Text className="text-gold-100 text-xs">Confirmed</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-[#1A1A1A] rounded-xl p-6 items-center">
              <Ionicons name="calendar-outline" size={48} color="#666" />
              <Text className="text-white text-lg mt-2">No appointments today</Text>
              <Text className="text-gray-400 text-center mt-1">You have no scheduled appointments for today</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mt-6 px-5 mb-8">
          <Text className="text-white text-xl font-bold mb-2">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-[#1A1A1A] rounded-xl p-4 items-center w-[48%]"
              onPress={() => router.push("/screens/service-management")}
            >
              <Ionicons name="cut" size={24} color="#FFD700" />
              <Text className="text-white mt-2">Manage Services</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#1A1A1A] rounded-xl p-4 items-center w-[48%]"
              onPress={() => router.push("/screens/earnings")}
            >
              <Ionicons name="stats-chart" size={24} color="#FFD700" />
              <Text className="text-white mt-2">View Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


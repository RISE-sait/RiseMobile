"use client"

import { useEffect, useState } from "react"
import { Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

import images from "@/constants/images"
import ProfileHeader from "@/components/profile/ProfileHeader"
import AccountSection from "@/components/profile/AccountSection"
import GradientBackground from "@/components/barber/GradientBackground"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  countryCode: string
  token: string
  teamLogo?: string
}

const InstructorProfileScreen = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // ✅ Prioritize Redux data
  const reduxUser = useSelector((state: RootState) => state.user.data)

  useEffect(() => {
    const loadUser = async () => {
      try {
        // ✅ Prioritize Redux data
        if (reduxUser) {
          console.log("📢 Loaded user from Redux state:", reduxUser)
          setUser({
            ...reduxUser,
            firstName: reduxUser.firstName || reduxUser.first_name || "",
            lastName: reduxUser.lastName || reduxUser.last_name || "",
            countryCode: reduxUser.countryCode || reduxUser.country_code || "US",
          })
          return // ✅ Redux data available, return directly
        }

        // ⚠️ Only use AsyncStorage fallback when Redux data is not available
        console.log("⚠️ Redux user not available, trying AsyncStorage fallback...")
        const storedUser = await AsyncStorage.getItem("user")

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("📢 Loaded user from AsyncStorage:", parsedUser)

          setUser({
            ...parsedUser,
            firstName: parsedUser.firstName || parsedUser.first_name || "",
            lastName: parsedUser.lastName || parsedUser.last_name || "",
            countryCode: parsedUser.countryCode || parsedUser.country_code || "US", // Ensure correct key
          })
        } else {
          console.log("⚠️ No user found in AsyncStorage.")
        }
      } catch (error) {
        console.error("❌ Error loading user:", error)
      }
    }

    loadUser()
  }, [reduxUser]) // ✅ Depend on reduxUser changes

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user")
    router.replace("/(auth)/login")
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5 items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <Text className="text-[#F0F0F0] text-base">Loading Profile...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <GradientBackground>
        <ScrollView showsVerticalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Profile Header */}
          <ProfileHeader
            firstName={user.firstName}
            lastName={user.lastName}
            role={user.role}
            number={"IR"} // Static text for instructors
            profileImage={user.profileImage ? { uri: user.profileImage } : images.instructorHeadshot}
            countryCode={user?.countryCode} // Ensure countryCode is always defined
            teamLogo={user.teamLogo ? { uri: user.teamLogo } : images.teamLogo}
          />

          {/* My Account Section */}
          <AccountSection
            title="My Account"
            items={[
              {
                icon: "pen-to-square",
                text: "Edit Profile",
                onPress: () => router.push("/screens/edit-profile"),
              },
              { icon: "bell", text: "Notifications", onPress: () => router.push("/screens/comingSoon") },
              {
                icon: "arrow-right-from-bracket",
                text: "Logout",
                iconColor: "#EF4444",
                textColor: "#EF4444",
                onPress: handleLogout,
              },
            ]}
          />

          {/* Support Section */}
          <AccountSection
            title="Support"
            items={[
              {
                icon: "question-circle",
                text: "Help Center",
                onPress: () => router.push("/screens/profile-options/helpCenter"),
              },
              {
                icon: "envelope",
                text: "Contact Us",
                onPress: () => router.push("/screens/profile-options/contactUs"),
              },
            ]}
          />
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  )
}

export default InstructorProfileScreen


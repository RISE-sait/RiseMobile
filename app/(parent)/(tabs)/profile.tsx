"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useAuth } from "@/utils/auth"
import ProfileHeader from "@/components/profile/ProfileHeader"
import AccountSection from "@/components/profile/AccountSection"
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

export default function ParentProfileScreen() {
  const router = useRouter()
  const { logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
          setIsLoading(false)
          return // ✅ Redux data available, return directly
        }

        // ⚠️ Only use AsyncStorage fallback when Redux data is not available
        console.log("⚠️ Redux user not available, trying AsyncStorage fallback...")
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
  }, [reduxUser]) // ✅ Depend on reduxUser changes

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
        <View className="h-16" />
        <View className="flex-1 items-center justify-center">
          <View className="h-8 w-8 rounded-full bg-gold-100 animate-pulse" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <ScrollView showsVerticalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingBottom: 80 }}>
        <ProfileHeader
          firstName={user?.firstName || ""}
          lastName={user?.lastName || ""}
          role="Parent"
          number="P"
          profileImage={user?.profileImage ? { uri: user.profileImage } : images.parentHeadshot}
          countryCode={user?.countryCode}
        />

        <View className="px-4 pb-10">
          <AccountSection
            title="ACCOUNT"
            items={[
              {
                icon: "user-pen",
                text: "Edit Profile",
                onPress: () => router.push("/screens/edit-profile"),
              },
              {
                icon: "children",
                text: "Manage Children",
                onPress: () => router.push("/(parent)/(tabs)/children"),
              },
              {
                icon: "credit-card",
                text: "Membership & Billing",
                onPress: () => router.push("/screens/membership"),
              },
              {
                icon: "id-card", // you can use a FontAwesome icon like `id-card`
                text: "My Parent ID",
                onPress: () => router.push("/screens/parent-id"),
              },
              {
                icon: "file-signature",
                text: "Waivers & Agreements",
                onPress: () => router.push("/screens/waivers"),
              },
              {
                icon: "right-from-bracket",
                text: "Logout",
                textColor: "#FF4D4F",
                iconColor: "#FF4D4F",
                onPress: handleLogout,
              },
            ]}
          />

          <AccountSection
            title="SUPPORT"
            items={[
              {
                icon: "circle-question",
                text: "Help Center",
                onPress: () => router.push("/screens/help"),
              },
              {
                icon: "message",
                text: "Contact Us",
                onPress: () => router.push("/screens/contact"),
              },
              {
                icon: "circle-info",
                text: "About Rise",
                onPress: () => router.push("/screens/about"),
              },
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


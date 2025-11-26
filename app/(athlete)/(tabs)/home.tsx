import { useEffect, useState } from "react"
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppSelector } from "@/store/hooks"

import images from "@/constants/images"
import GoToCards, { type NavigationOption } from "../../../components/GoToCards"
import UpcomingCard from "@/components/events/UpcomingCard"
import ProfileHeader from "@/components/profile/ProfileHeader"
import QRCodeButton from "@/components/buttons/QRCodeButton"
import { useUpcomingEvent } from "@/hooks/useUpcomingEvent"

// Define User Type
type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  jerseyNumber?: string
  profileImage?: string
  countryCode: string
  token: string
}


export default function AthleteHome() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Get user from Redux store
  const reduxUser = useAppSelector((state) => state.user.data)
  const [user, setUser] = useState<User | null>(null)

  // Use the new hook to get upcoming events from /secure/schedule
  const { upcomingEvent, loading: eventLoading, error: eventError } = useUpcomingEvent()

  useEffect(() => {
    if (__DEV__) {
      console.log(`[Home] mounted at ${new Date().toISOString()}`)
    }
    return () => {
      if (__DEV__) {
        console.log(`[Home] unmounted at ${new Date().toISOString()}`)
      }
    }
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (__DEV__) {
          console.log('[Home] loadUser invoked', {
            hasReduxUser: !!reduxUser,
          })
        }
        // If we have user in Redux, use that
        if (reduxUser) {
          setUser(reduxUser)
        } else {
          // Otherwise try to load from AsyncStorage (backward compatibility)
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
        }
      } catch (error) {
        // Error loading user data
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [reduxUser])


  const navigationOptions: NavigationOption[] = [
    {
      label: "Schedule",
      route: "/calendar",
      icon: "calendar-days",
      description: "View upcoming practices & games",
      colors: ["#FCA311", "#C36A04"] as [string, string],
    },
    {
      label: "Events",
      route: "/screens/events",
      icon: "ticket",
      description: "See what's happening at RISE",
      colors: ["#8E2DE2", "#4A00E0"] as [string, string],
    },
    {
      label: "Membership",
      route: "/screens/membership",
      icon: "crown",
      description: "Manage your plan & perks",
      colors: ["#0F2027", "#2C5364"] as [string, string],
    },
  ]

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white text-center mt-4">Loading user data...</Text>
      </SafeAreaView>
    )
  }

  const handleNavigate = (route: string) => {
    if (__DEV__) {
      console.log(`[Home] navigate to ${route} at ${new Date().toISOString()}`)
    }
    router.push(route as any)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* QR Code Button */}
        <View className="absolute top-8 left-10 z-50">
          <QRCodeButton onPress={() => router.push("/modals/qr-code")} />
        </View>

        {/* Header Section - Only render when user exists */}
        <View className="w-full px-5 mt-24">
          {user ? (
            user.profileImage ? (
              <ProfileHeader
                firstName={user.firstName}
                lastName={user.lastName}
                role={user.role}
                profileImage={{ uri: user.profileImage }}
                countryCode={user?.countryCode} // Ensure countryCode is always defined
                teamLogo={images.teamLogo}
                onPress={() => router.push("/profile")}
              />
            ) : (
              <View className="bg-[#111111] border border-[#222222] rounded-2xl p-4">
                <Text className="text-white-100 font-Oswald-Bold text-lg">Add your profile photo</Text>
                <Text className="text-[#cccccc] text-sm mt-2">
                  Upload a picture to personalize your account and make check-ins faster.
                </Text>
                <TouchableOpacity
                  className="mt-3 px-4 py-2 rounded-lg bg-[#FFD700]"
                  onPress={() => router.push("/screens/edit-profile")}
                  activeOpacity={0.85}
                >
                  <Text className="text-black font-semibold text-sm">Upload photo</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Upcoming Event Section - Using new /secure/schedule API */}
        <UpcomingCard event={upcomingEvent} />

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={handleNavigate} />
      </ScrollView>
    </SafeAreaView>
  )
}

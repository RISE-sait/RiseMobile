"use client"
import { useEffect } from "react"
import { Text, View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Alert } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"

import { useAuth } from "@/utils/auth"
import images from "@/constants/images"
import ProfileHeader from "@/components/profile/ProfileHeader"
import GradientBackground from "@/components/barber/GradientBackground"

export default function BarberProfileScreen() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  // Animation values
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)

  useEffect(() => {
    if (!isLoading) {
      // Start animations when data is loaded
      headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      contentOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    }
  }, [isLoading])

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: withTiming(headerOpacity.value * 0, { duration: 600 }) }],
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: withTiming((1 - contentOpacity.value) * 20, { duration: 600 }) }],
    }
  })

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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

  const handleNavigation = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientBackground>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </GradientBackground>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <GradientBackground>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.profileHeaderContainer, headerAnimatedStyle]}>
            {user ? (
              <ProfileHeader
                firstName={user.firstName}
                lastName={user.lastName}
                role="Barber"
                number="01"
                profileImage={user.profileImage ? { uri: user.profileImage } : images.barberHeadshot}
                countryCode={user?.countryCode}
                teamLogo={images.teamLogo}
              />
            ) : (
              <Text style={styles.errorText}>User data not available</Text>
            )}
          </Animated.View>

          <Animated.View style={[styles.sectionsContainer, contentAnimatedStyle]}>
            {/* Account Section */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>ACCOUNT</Text>
              <View style={styles.sectionContent}>
                <MenuItem
                  icon="pen-to-square"
                  text="Edit Profile"
                  onPress={() => handleNavigation("/screens/edit-profile")}
                />
                <MenuItem
                  icon="scissors"
                  text="Manage Services"
                  onPress={() => handleNavigation("/screens/service-management")}
                />
                <MenuItem
                  icon="clock"
                  text="Working Hours"
                  onPress={() => handleNavigation("/screens/working-hours")}
                />
                <MenuItem
                  icon="chart-line"
                  text="Earnings & Payments"
                  onPress={() => handleNavigation("/screens/earnings")}
                />
                <MenuItem
                  icon="arrow-right-from-bracket"
                  text="Logout"
                  textColor="#FF4D4F"
                  iconColor="#FF4D4F"
                  onPress={handleLogout}
                />
              </View>
            </View>

            {/* Support Section */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>SUPPORT</Text>
              <View style={styles.sectionContent}>
                <MenuItem
                  icon="question-circle"
                  text="Help Center"
                  onPress={() => handleNavigation("/screens/help-center")}
                />
                <MenuItem
                  icon="comment-alt"
                  text="Contact Us"
                  onPress={() => handleNavigation("/screens/contact-us")}
                />
                <MenuItem icon="info" text="About Rise" onPress={() => handleNavigation("/screens/about")} />
              </View>
            </View>

            <Text style={styles.versionText}>Version 1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  )
}

// MenuItem component for better organization
const MenuItem = ({ icon, text, onPress, textColor = "white", iconColor = "#FFD700" }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <FontAwesome6 name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
      <FontAwesome6 name="chevron-right" size={14} color="#666" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  profileHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#999",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  versionText: {
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
})


"use client"

import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import { FontAwesome6 } from "@expo/vector-icons"

import { useAuth } from "@/utils/auth"
import images from "@/constants/images"
import ProfileHeader from "@/components/ProfileHeader"
import QRCodeModal from "@/components/QRCodeModal"
import GradientBackground from "@/components/barber/GradientBackground"
import AnimatedStatsCard from "@/components/barber/AnimatedStatsCard"
import AnimatedAppointmentCard from "@/components/barber/AnimatedAppointmentCard"

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    clientName: "Michael Johnson",
    service: "Fade Haircut",
    date: "2023-05-15",
    time: "10:00 AM",
    duration: 30,
    price: 25,
    status: "confirmed",
  },
  {
    id: "2",
    clientName: "James Wilson",
    service: "Lineup & Beard Trim",
    date: "2023-05-15",
    time: "11:30 AM",
    duration: 45,
    price: 35,
    status: "confirmed",
  },
  {
    id: "3",
    clientName: "Dwayne Carter",
    service: "Taper Fade",
    date: "2023-05-15",
    time: "1:15 PM",
    duration: 30,
    price: 25,
    status: "confirmed",
  },
]

export default function BarberHome() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [todaysAppointments, setTodaysAppointments] = useState(mockAppointments)
  const [stats, setStats] = useState({
    todayEarnings: 85,
    weeklyEarnings: 450,
    monthlyEarnings: 1850,
    appointmentsToday: 3,
  })

  // Animation values
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const contentTranslateY = useSharedValue(50)

  useEffect(() => {
    if (!authLoading) {
      // Simulate loading data
      const timer = setTimeout(() => {
        setIsLoading(false)

        // Start animations
        headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })

        contentOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }))

        contentTranslateY.value = withDelay(400, withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }))
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [authLoading])

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    }
  })

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }, [])

  const handleViewAllAppointments = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push("/appointments")
  }

  const handleQuickAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(route)
  }

  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground>
      <ScrollView showsVerticalScrollIndicator={false}  contentContainerStyle={{ paddingBottom: 80 }}

          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" colors={["#FFD700"]} />
          }
        >
          {/* QR Code Button */}
          <QRCodeModal />

          {/* Header Section */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            {user ? (
              <ProfileHeader
                firstName={user.firstName}
                lastName={user.lastName}
                role="Barber"
                number={user?.jerseyNumber ? user.jerseyNumber.toString() : "01"}
                profileImage={user.profileImage ? { uri: user.profileImage } : images.barberHeadshot}
                countryCode={user?.countryCode || "US"}
                teamLogo={images.teamLogo}
              />
            ) : (
              <Text className="text-white text-center">User data not available</Text>
            )}
          </Animated.View>

          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {/* Stats Section */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Today's Overview</Text>
              <View style={styles.statsRow}>
                <AnimatedStatsCard
                  title="Today's Earnings"
                  value={stats.todayEarnings}
                  icon="sack-dollar"
                  actionText="View Details"
                  onPress={() => router.push("/screens/earnings")}
                  index={0}
                />

                <AnimatedStatsCard
                  title="Appointments"
                  value={stats.appointmentsToday}
                  icon="calendar-check"
                  actionText="View Schedule"
                  onPress={() => router.push("/appointments")}
                  index={1}
                />
              </View>
            </View>

            {/* Today's Appointments */}
            <View style={styles.appointmentsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Appointments</Text>
                <TouchableOpacity onPress={handleViewAllAppointments}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment, index) => (
                  <AnimatedAppointmentCard
                    key={appointment.id}
                    id={appointment.id}
                    clientName={appointment.clientName}
                    service={appointment.service}
                    time={appointment.time}
                    duration={appointment.duration}
                    price={appointment.price}
                    status={appointment.status}
                    index={index}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <FontAwesome6 name="calendar" size={48} color="#666" />
                  <Text style={styles.emptyStateTitle}>No appointments today</Text>
                  <Text style={styles.emptyStateMessage}>You have no scheduled appointments for today</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction("/screens/service-management")}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <FontAwesome6 name="scissors" size={24} color="#FFD700" />
                  </View>
                  <Text style={styles.quickActionText}>Manage Services</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction("/screens/earnings")}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <FontAwesome6 name="chart-line" size={24} color="#FFD700" />
                  </View>
                  <Text style={styles.quickActionText}>View Earnings</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction("/screens/working-hours")}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <FontAwesome6 name="clock" size={24} color="#FFD700" />
                  </View>
                  <Text style={styles.quickActionText}>Working Hours</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction("/screens/edit-profile")}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <FontAwesome6 name="user-edit" size={24} color="#FFD700" />
                  </View>
                  <Text style={styles.quickActionText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: 24,
  },
  appointmentsSection: {
    marginTop: 32,
  },
  quickActionsSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyState: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyStateMessage: {
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
})


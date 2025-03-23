"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

import BackButton from "@/components/BackButton"
import GradientBackground from "@/components/barber/GradientBackground"
import AppointmentDetailCard from "@/components/barber/AppointmentDetailCard"

// Mock API functions
const getAppointment = async (id: string) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data for different appointments
      const appointments = {
        "1": {
          id: "1",
          clientName: "Michael Johnson",
          clientPhone: "+1 (555) 123-4567",
          service: "Fade Haircut",
          date: "May 15, 2023",
          time: "10:00 AM",
          duration: 30,
          price: 25,
          status: "confirmed",
          notes: "First time client. Prefers a low fade with a clean lineup.",
        },
        "2": {
          id: "2",
          clientName: "James Wilson",
          clientPhone: "+1 (555) 987-6543",
          service: "Lineup & Beard Trim",
          date: "May 15, 2023",
          time: "11:30 AM",
          duration: 45,
          price: 35,
          status: "confirmed",
          notes: "Regular client. Likes his beard shaped with a pointed chin.",
        },
        "3": {
          id: "3",
          clientName: "Dwayne Carter",
          clientPhone: "+1 (555) 456-7890",
          service: "Taper Fade",
          date: "May 15, 2023",
          time: "1:15 PM",
          duration: 30,
          price: 25,
          status: "confirmed",
        },
        "4": {
          id: "4",
          clientName: "Kevin Durant",
          clientPhone: "+1 (555) 234-5678",
          service: "Fade Haircut",
          date: "May 16, 2023",
          time: "9:30 AM",
          duration: 30,
          price: 25,
          status: "confirmed",
        },
        "5": {
          id: "5",
          clientName: "Stephen Curry",
          clientPhone: "+1 (555) 876-5432",
          service: "Lineup",
          date: "May 16, 2023",
          time: "11:00 AM",
          duration: 20,
          price: 15,
          status: "confirmed",
        },
        "6": {
          id: "6",
          clientName: "LeBron James",
          clientPhone: "+1 (555) 345-6789",
          service: "Fade & Beard Trim",
          date: "May 17, 2023",
          time: "2:00 PM",
          duration: 45,
          price: 35,
          status: "confirmed",
          notes: "Wants to try a different beard style this time.",
        },
      }

      resolve(appointments[id] || null)
    }, 800)
  })
}

const updateAppointmentStatus = async (id: string, status: string) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`Appointment ${id} status updated to ${status}`)
      resolve()
    }, 1000)
  })
}

export default function AppointmentDetailsScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Animation values
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)

  useEffect(() => {
    if (appointmentId) {
      loadAppointment(appointmentId)
    }
  }, [appointmentId])

  useEffect(() => {
    if (!isLoading && appointment) {
      // Start animations when data is loaded
      opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    }
  }, [isLoading, appointment])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  const loadAppointment = async (id: string) => {
    try {
      setIsLoading(true)
      const appointmentData = await getAppointment(id)
      setAppointment(appointmentData)
    } catch (error) {
      Alert.alert("Error", "Failed to load appointment details.")
      console.error("Error loading appointment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true)

      // Haptic feedback based on status
      if (status === "completed") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else if (status === "cancelled") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }

      await updateAppointmentStatus(appointmentId, status)
      setAppointment({ ...appointment, status })

      Alert.alert("Status Updated", `Appointment has been marked as ${status}.`, [
        { text: "OK", onPress: () => router.back() },
      ])
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert("Error", "Failed to update appointment status.")
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Message Client", "This feature will allow you to send a message to the client.", [{ text: "OK" }])
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground intensity="low">
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {appointment && (
              <Animated.View style={[styles.appointmentContainer, animatedStyle]}>
                <LinearGradient
                  colors={["#1A1A1A", "#252525"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <AppointmentDetailCard
                    clientName={appointment.clientName}
                    clientPhone={appointment.clientPhone}
                    service={appointment.service}
                    date={appointment.date}
                    time={appointment.time}
                    duration={appointment.duration}
                    price={appointment.price}
                    status={appointment.status}
                    notes={appointment.notes}
                    onStatusChange={handleStatusChange}
                    onSendMessage={handleSendMessage}
                  />

                  {isUpdating && (
                    <View style={styles.updatingOverlay}>
                      <ActivityIndicator size="large" color="#FFD700" />
                      <Text style={styles.updatingText}>Updating status...</Text>
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.quickActionsContainer}>
                  <TouchableOpacity style={styles.quickAction} onPress={handleSendMessage}>
                    <View style={styles.quickActionIcon}>
                      <FontAwesome6 name="message" size={20} color="#FFD700" />
                    </View>
                    <Text style={styles.quickActionText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
                    <View style={styles.quickActionIcon}>
                      <FontAwesome6 name="phone" size={20} color="#FFD700" />
                    </View>
                    <Text style={styles.quickActionText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
                    <View style={styles.quickActionIcon}>
                      <FontAwesome6 name="calendar-plus" size={20} color="#FFD700" />
                    </View>
                    <Text style={styles.quickActionText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        )}
      </GradientBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  updatingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  updatingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    color: "white",
    fontSize: 14,
  },
})


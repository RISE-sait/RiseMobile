"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import dayjs from "dayjs"
import * as Haptics from "expo-haptics"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"

import GradientBackground from "@/components/barber/GradientBackground"
import AnimatedAppointmentCard from "@/components/barber/AnimatedAppointmentCard"

// Mock appointments data
const mockAppointments = {
  "2023-05-15": [
    {
      id: "1",
      clientName: "Michael Johnson",
      service: "Fade Haircut",
      time: "10:00 AM",
      duration: 30,
      price: 25,
      status: "confirmed",
    },
    {
      id: "2",
      clientName: "James Wilson",
      service: "Lineup & Beard Trim",
      time: "11:30 AM",
      duration: 45,
      price: 35,
      status: "confirmed",
    },
    {
      id: "3",
      clientName: "Dwayne Carter",
      service: "Taper Fade",
      time: "1:15 PM",
      duration: 30,
      price: 25,
      status: "confirmed",
    },
  ],
  "2023-05-16": [
    {
      id: "4",
      clientName: "Kevin Durant",
      service: "Fade Haircut",
      time: "9:30 AM",
      duration: 30,
      price: 25,
      status: "confirmed",
    },
    {
      id: "5",
      clientName: "Stephen Curry",
      service: "Lineup",
      time: "11:00 AM",
      duration: 20,
      price: 15,
      status: "confirmed",
    },
  ],
  "2023-05-17": [
    {
      id: "6",
      clientName: "LeBron James",
      service: "Fade & Beard Trim",
      time: "2:00 PM",
      duration: 45,
      price: 35,
      status: "confirmed",
    },
  ],
}

export default function AppointmentsScreen() {
  const router = useRouter()
  const today = dayjs().format("YYYY-MM-DD")
  const [selectedDate, setSelectedDate] = useState(today)
  const [isLoading, setIsLoading] = useState(true)

  // Animation values
  const headerOpacity = useSharedValue(0)
  const calendarOpacity = useSharedValue(0)
  const calendarTranslateY = useSharedValue(-20)
  const listOpacity = useSharedValue(0)
  const listTranslateY = useSharedValue(30)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Start animations
      headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })

      calendarOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }))

      calendarTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }))

      listOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }))

      listTranslateY.value = withDelay(400, withTiming(0, { duration: 700, easing: Easing.out(Easing.quad) }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Reset list animations when date changes
  useEffect(() => {
    if (!isLoading) {
      listOpacity.value = 0
      listTranslateY.value = 30

      listOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
      listTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    }
  }, [selectedDate, isLoading])

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    }
  })

  const calendarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: calendarOpacity.value,
      transform: [{ translateY: calendarTranslateY.value }],
    }
  })

  const listAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: listOpacity.value,
      transform: [{ translateY: listTranslateY.value }],
    }
  })

  // Create marked dates for the calendar
  const markedDates = {}
  Object.keys(mockAppointments).forEach((date) => {
    markedDates[date] = {
      marked: true,
      dotColor: "#FFD700",
    }
  })

  // Add selected date styling
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: "#333",
  }

  // Get appointments for selected date
  const appointmentsForSelectedDate = mockAppointments[selectedDate] || []

  const handleDayPress = (day) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedDate(day.dateString)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.headerTitle}>Appointments</Text>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <>
            <Animated.View style={[styles.calendarContainer, calendarAnimatedStyle]}>
              <Calendar
                theme={{
                  backgroundColor: "#1A1A1A",
                  calendarBackground: "#1A1A1A",
                  textSectionTitleColor: "#b6c1cd",
                  selectedDayBackgroundColor: "#FFD700",
                  selectedDayTextColor: "#000000",
                  todayTextColor: "#FFD700",
                  dayTextColor: "#FFFFFF",
                  textDisabledColor: "#444444",
                  dotColor: "#FFD700",
                  selectedDotColor: "#000000",
                  arrowColor: "#FFD700",
                  monthTextColor: "#FFFFFF",
                  indicatorColor: "#FFD700",
                  textDayFontWeight: "300",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "500",
                }}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                enableSwipeMonths={true}
              />
            </Animated.View>

            <Animated.View style={[styles.appointmentsContainer, listAnimatedStyle]}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateTitle}>{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
              </View>

              <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
                {appointmentsForSelectedDate.length > 0 ? (
                  appointmentsForSelectedDate.map((appointment, index) => (
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
                    <Text style={styles.emptyStateTitle}>No appointments</Text>
                    <Text style={styles.emptyStateMessage}>You have no scheduled appointments for this day</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </>
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  dateTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  appointmentsList: {
    flex: 1,
  },
  emptyState: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
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
})


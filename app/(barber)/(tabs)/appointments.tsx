"use client"

import { useState } from "react"
import { Text, View, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import dayjs from "dayjs"

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <View className="px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Appointments</Text>
      </View>

      <View className="px-4">
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
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />
      </View>

      <View className="px-5 mt-4">
        <Text className="text-white text-xl font-bold mb-2">{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {appointmentsForSelectedDate.length > 0 ? (
          appointmentsForSelectedDate.map((appointment, index) => (
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
            <Text className="text-white text-lg mt-2">No appointments</Text>
            <Text className="text-gray-400 text-center mt-1">You have no scheduled appointments for this day</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}


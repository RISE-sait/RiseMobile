"use client"

import { useState } from "react"
import { Text, View, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { Calendar } from "react-native-calendars"
import { Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import { mockMatches } from "@/app/(athlete)/screens/matchesData"

export default function ParentCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))

  // Create marked dates for the calendar
  const markedDates = mockMatches.reduce((acc, event) => {
    const date = event.date
    const existingDots = acc[date]?.dots || []

    // Determine dot color based on event type
    let dotColor = "#FFD700" // Default gold
    if (event.type === "match") dotColor = "#FF4D4F" // Red for matches
    if (event.type === "practice") dotColor = "#4CAF50" // Green for practices

    return {
      ...acc,
      [date]: {
        dots: [...existingDots, { key: event.id, color: dotColor }],
        marked: true,
      },
    }
  }, {})

  // Add selected date styling
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: "#333",
  }

  // Filter events for the selected date
  const eventsForSelectedDate = mockMatches.filter((event) => event.date === selectedDate)

  // Group events by child
  const eventsByChild = eventsForSelectedDate.reduce((acc, event) => {
    // In a real app, each event would have a childId
    // For mock data, we'll assign events to children based on type
    const childName = event.type === "match" ? "Michael" : "Sarah"

    if (!acc[childName]) {
      acc[childName] = []
    }

    acc[childName].push(event)
    return acc
  }, {})

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <View className="px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Family Calendar</Text>
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
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />

        <View className="flex-row mt-4 mb-2">
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 rounded-full bg-[#FF4D4F] mr-1" />
            <Text className="text-white">Match</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 rounded-full bg-[#4CAF50] mr-1" />
            <Text className="text-white">Practice</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#FFD700] mr-1" />
            <Text className="text-white">Other</Text>
          </View>
        </View>
      </View>

      <View className="px-5 mt-2">
        <Text className="text-white text-xl font-bold mb-2">{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {Object.keys(eventsByChild).length > 0 ? (
          Object.entries(eventsByChild).map(([childName, events], index) => (
            <View key={index} className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-gold-100 mr-2" />
                <Text className="text-gold-100 font-bold">{childName}'s Schedule</Text>
              </View>

              {events.map((event, eventIndex) => (
                <TouchableOpacity key={eventIndex} className="bg-[#1A1A1A] rounded-xl p-4 mb-3">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className={`font-bold ${event.type === "match" ? "text-[#FF4D4F]" : "text-[#4CAF50]"}`}>
                        {event.type.toUpperCase()}
                      </Text>
                      <Text className="text-white text-lg font-bold">{event.title}</Text>
                      <Text className="text-gray-400">{event.time}</Text>
                      <Text className="text-gray-400">{event.location}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View className="bg-[#1A1A1A] rounded-xl p-6 items-center justify-center">
            <Ionicons name="calendar-outline" size={48} color="#666" />
            <Text className="text-white text-lg mt-2">No events scheduled</Text>
            <Text className="text-gray-400 text-center mt-1">There are no events scheduled for this day</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}


"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, FlatList, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import BackButton from "@/components/BackButton"
import PageTitle from "@/components/PageTitle"
import { Calendar } from "react-native-calendars"

// Mock data for classes
const mockClasses = [
  {
    id: "1",
    name: "Basketball Fundamentals",
    time: "4:00 PM - 5:30 PM",
    location: "Main Court",
    students: [
      { id: "s1", name: "Alex Johnson", present: true },
      { id: "s2", name: "Maria Garcia", present: false },
      { id: "s3", name: "Jamal Williams", present: true },
      { id: "s4", name: "Sarah Chen", present: true },
      { id: "s5", name: "Tyler Brown", present: false },
    ],
  },
  {
    id: "2",
    name: "Advanced Shooting Techniques",
    time: "5:00 PM - 6:30 PM",
    location: "Practice Court B",
    students: [
      { id: "s6", name: "Marcus Lee", present: true },
      { id: "s7", name: "Sophia Rodriguez", present: true },
      { id: "s8", name: "Ethan Davis", present: true },
      { id: "s9", name: "Olivia Wilson", present: false },
      { id: "s10", name: "Noah Martinez", present: true },
    ],
  },
]

export default function AttendanceScreen() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedClass, setSelectedClass] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Handle marking attendance
  const toggleAttendance = (studentId) => {
    if (!selectedClass) return

    setSelectedClass({
      ...selectedClass,
      students: selectedClass.students.map((student) =>
        student.id === studentId ? { ...student, present: !student.present } : student,
      ),
    })
  }

  // Filter students based on search
  const filteredStudents =
    selectedClass?.students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  // Calculate attendance stats
  const attendanceStats = selectedClass
    ? {
        total: selectedClass.students.length,
        present: selectedClass.students.filter((s) => s.present).length,
        absent: selectedClass.students.filter((s) => !s.present).length,
        percentage: Math.round(
          (selectedClass.students.filter((s) => s.present).length / selectedClass.students.length) * 100,
        ),
      }
    : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar style="light" />

      <View className="px-4 pt-2">
        <BackButton onPress={() => router.back()} />
        <PageTitle title="Attendance" />
      </View>

      {/* Calendar */}
      <View className="px-4 mt-4">
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "#FFD700" },
          }}
          theme={{
            backgroundColor: "#0C0B0B",
            calendarBackground: "#1C1C1E",
            textSectionTitleColor: "#b6c1cd",
            selectedDayBackgroundColor: "#FFD700",
            selectedDayTextColor: "#000000",
            todayTextColor: "#FFD700",
            dayTextColor: "#ffffff",
            textDisabledColor: "#444444",
            dotColor: "#FFD700",
            selectedDotColor: "#000000",
            arrowColor: "#FFD700",
            monthTextColor: "#ffffff",
            textMonthFontWeight: "bold",
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      <Text className="text-white text-lg font-semibold px-4 mt-4">{formatDate(selectedDate)}</Text>

      {/* Class Selection */}
      {!selectedClass ? (
        <View className="flex-1 px-4 mt-4">
          <Text className="text-gray-300 mb-3">Select a class to take attendance:</Text>
          <FlatList
            data={mockClasses}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                  className="bg-[#1C1C1E] p-4 rounded-xl mb-3 flex-row justify-between items-center"
                  onPress={() => setSelectedClass(item)}
                >
                  <View>
                    <Text className="text-white font-semibold text-lg">{item.name}</Text>
                    <Text className="text-gray-400 mt-1">{item.time}</Text>
                    <Text className="text-gray-400">{item.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFD700" />
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        </View>
      ) : (
        <View className="flex-1 px-4 mt-4">
          {/* Class Header */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-semibold text-lg">{selectedClass.name}</Text>
              <Text className="text-gray-400">
                {selectedClass.time} • {selectedClass.location}
              </Text>
            </View>
            <TouchableOpacity className="bg-[#2C2C2E] p-2 rounded-full" onPress={() => setSelectedClass(null)}>
              <Ionicons name="close" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Attendance Stats */}
          {attendanceStats && (
            <View className="flex-row justify-between bg-[#1C1C1E] rounded-xl p-4 mt-4">
              <View className="items-center">
                <Text className="text-gray-400 text-xs">Total</Text>
                <Text className="text-white font-bold text-lg">{attendanceStats.total}</Text>
              </View>
              <View className="items-center">
                <Text className="text-green-500 text-xs">Present</Text>
                <Text className="text-white font-bold text-lg">{attendanceStats.present}</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-500 text-xs">Absent</Text>
                <Text className="text-white font-bold text-lg">{attendanceStats.absent}</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#FFD700] text-xs">Rate</Text>
                <Text className="text-white font-bold text-lg">{attendanceStats.percentage}%</Text>
              </View>
            </View>
          )}

          {/* Search */}
          <View className="bg-[#1C1C1E] flex-row items-center rounded-xl px-4 mt-4">
            <Ionicons name="search" size={20} color="#777" />
            <TextInput
              className="flex-1 py-3 px-2 text-white"
              placeholder="Search students..."
              placeholderTextColor="#777"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#777" />
              </TouchableOpacity>
            )}
          </View>

          {/* Student List */}
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            className="mt-4"
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                className="bg-[#1C1C1E] p-4 rounded-xl mb-3 flex-row justify-between items-center"
              >
                <Text className="text-white font-medium">{item.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleAttendance(item.id)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    item.present ? "bg-green-500" : "bg-[#2C2C2E]"
                  }`}
                >
                  {item.present ? (
                    <Ionicons name="checkmark" size={18} color="white" />
                  ) : (
                    <Ionicons name="close" size={18} color="#777" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Text className="text-gray-400 text-center">No students found</Text>
              </View>
            }
          />

          {/* Save Button */}
          <TouchableOpacity
            className="bg-[#FFD700] py-3 rounded-xl items-center mt-4 mb-6"
            onPress={() => {
              console.log("Saving attendance for", selectedClass.name)
              // Here you would save the attendance data
              setSelectedClass(null)
            }}
          >
            <Text className="text-black font-bold text-lg">Save Attendance</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}


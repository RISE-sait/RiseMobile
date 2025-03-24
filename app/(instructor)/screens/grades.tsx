"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import BackButton from "@/components/buttons/BackButton"
import PageTitle from "@/components/PageTitle"

// Mock data for courses and assignments
const mockCourses = [
  {
    id: "1",
    name: "Basketball 101",
    students: 24,
    assignments: [
      { id: "a1", name: "Dribbling Assessment", maxScore: 100, dueDate: "Mar 15, 2024" },
      { id: "a2", name: "Shooting Form Quiz", maxScore: 50, dueDate: "Mar 22, 2024" },
      { id: "a3", name: "Team Play Evaluation", maxScore: 100, dueDate: "Mar 29, 2024" },
    ],
  },
  {
    id: "2",
    name: "Advanced Shooting",
    students: 18,
    assignments: [
      { id: "a4", name: "Three-Point Challenge", maxScore: 100, dueDate: "Mar 18, 2024" },
      { id: "a5", name: "Shot Analysis Report", maxScore: 50, dueDate: "Mar 25, 2024" },
    ],
  },
  {
    id: "3",
    name: "Team Defense",
    students: 15,
    assignments: [
      { id: "a6", name: "Zone Defense Quiz", maxScore: 50, dueDate: "Mar 20, 2024" },
      { id: "a7", name: "Defensive Positioning Test", maxScore: 100, dueDate: "Mar 27, 2024" },
    ],
  },
  {
    id: "4",
    name: "Basketball Conditioning",
    students: 22,
    assignments: [
      { id: "a8", name: "Endurance Assessment", maxScore: 100, dueDate: "Mar 15, 2024" },
      { id: "a9", name: "Agility Drills Evaluation", maxScore: 100, dueDate: "Mar 22, 2024" },
    ],
  },
  {
    id: "5",
    name: "Point Guard Masterclass",
    students: 12,
    assignments: [
      { id: "a10", name: "Ball Handling Skills", maxScore: 100, dueDate: "Mar 18, 2024" },
      { id: "a11", name: "Court Vision Test", maxScore: 50, dueDate: "Mar 25, 2024" },
      { id: "a12", name: "Leadership Assessment", maxScore: 50, dueDate: "Apr 1, 2024" },
    ],
  },
]

// Mock student data
const mockStudents = [
  { id: "s1", name: "Alex Johnson", grades: { a1: 85, a2: 42, a3: null, a4: 90 } },
  { id: "s2", name: "Maria Garcia", grades: { a1: 92, a2: 48, a3: null, a4: 88 } },
  { id: "s3", name: "Jamal Williams", grades: { a1: 78, a2: 39, a3: null, a4: 82 } },
  { id: "s4", name: "Sarah Chen", grades: { a1: 95, a2: 50, a3: null, a4: 94 } },
  { id: "s5", name: "Tyler Brown", grades: { a1: 88, a2: 45, a3: null, a4: 79 } },
  { id: "s6", name: "Marcus Lee", grades: { a1: 90, a2: 47, a3: null, a4: 85 } },
  { id: "s7", name: "Sophia Rodriguez", grades: { a1: 82, a2: 41, a3: null, a4: 88 } },
  { id: "s8", name: "Ethan Davis", grades: { a1: 75, a2: 38, a3: null, a4: 80 } },
]

export default function GradesScreen() {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [studentGrades, setStudentGrades] = useState([...mockStudents])

  // Filter students based on search
  const filteredStudents = studentGrades.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Update a student's grade
  const updateGrade = (studentId, value) => {
    // Validate input
    const numValue = Number.parseInt(value)
    if (isNaN(numValue) || numValue < 0 || numValue > selectedAssignment.maxScore) {
      Alert.alert("Invalid Grade", `Please enter a number between 0 and ${selectedAssignment.maxScore}.`)
      return
    }

    setStudentGrades((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              grades: {
                ...student.grades,
                [selectedAssignment.id]: numValue,
              },
            }
          : student,
      ),
    )
  }

  // Calculate class average for the selected assignment
  const calculateAverage = () => {
    if (!selectedAssignment) return "N/A"

    const grades = studentGrades
      .map((student) => student.grades[selectedAssignment.id])
      .filter((grade) => grade !== null && grade !== undefined)

    if (grades.length === 0) return "N/A"

    const sum = grades.reduce((acc, curr) => acc + curr, 0)
    return (sum / grades.length).toFixed(1)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar style="light" />

      <View className="px-4 pt-2">
        <BackButton
          onPress={() => {
            if (selectedAssignment) {
              setSelectedAssignment(null)
            } else if (selectedCourse) {
              setSelectedCourse(null)
            } else {
              router.back()
            }
          }}
        />
        <PageTitle title="Grades" />
      </View>

      {/* Course Selection */}
      {!selectedCourse ? (
        <View className="flex-1 px-4 mt-4">
          <Text className="text-gray-300 mb-3">Select a course to manage grades:</Text>
          <FlatList
            data={mockCourses}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity className="bg-[#1C1C1E] p-4 rounded-xl mb-3" onPress={() => setSelectedCourse(item)}>
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-semibold text-lg">{item.name}</Text>
                      <Text className="text-gray-400 mt-1">{item.students} students</Text>
                      <Text className="text-gray-400">{item.assignments.length} assignments</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#FFD700" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        </View>
      ) : !selectedAssignment ? (
        <View className="flex-1 px-4 mt-4">
          {/* Course Header */}
          <View className="bg-[#1C1C1E] p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold text-lg">{selectedCourse.name}</Text>
            <Text className="text-gray-400 mt-1">{selectedCourse.students} students enrolled</Text>
          </View>

          <Text className="text-gray-300 mb-3">Select an assignment to grade:</Text>

          {/* Assignment List */}
          <FlatList
            data={selectedCourse.assignments}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                  className="bg-[#1C1C1E] p-4 rounded-xl mb-3 flex-row justify-between items-center"
                  onPress={() => setSelectedAssignment(item)}
                >
                  <View>
                    <Text className="text-white font-semibold">{item.name}</Text>
                    <Text className="text-gray-400 mt-1">Max Score: {item.maxScore}</Text>
                    <Text className="text-gray-400">Due: {item.dueDate}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFD700" />
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        </View>
      ) : (
        <View className="flex-1 px-4 mt-4">
          {/* Assignment Header */}
          <View className="bg-[#1C1C1E] p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold text-lg">{selectedAssignment.name}</Text>
            <Text className="text-gray-400 mt-1">{selectedCourse.name}</Text>
            <Text className="text-gray-400">Due: {selectedAssignment.dueDate}</Text>

            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-[#333]">
              <View>
                <Text className="text-gray-400 text-xs">Max Score</Text>
                <Text className="text-white font-bold">{selectedAssignment.maxScore}</Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs">Class Average</Text>
                <Text className="text-white font-bold">{calculateAverage()}</Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View className="bg-[#1C1C1E] flex-row items-center rounded-xl px-4 mb-4">
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

          {/* Student Grading List */}
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                className="bg-[#1C1C1E] p-4 rounded-xl mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-medium">{item.name}</Text>
                  <View className="flex-row items-center bg-[#2C2C2E] rounded-lg overflow-hidden">
                    <TextInput
                      className="text-white text-center w-16 py-2"
                      keyboardType="number-pad"
                      placeholder="--"
                      placeholderTextColor="#777"
                      value={item.grades[selectedAssignment.id]?.toString() || ""}
                      onChangeText={(value) => updateGrade(item.id, value)}
                      maxLength={3}
                    />
                    <Text className="text-gray-400 pr-3">/ {selectedAssignment.maxScore}</Text>
                  </View>
                </View>
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
              console.log("Saving grades for", selectedAssignment.name)
              // Here you would save the grades data
              Alert.alert("Grades Saved", `Grades for ${selectedAssignment.name} have been saved successfully.`, [
                { text: "OK", onPress: () => setSelectedAssignment(null) },
              ])
            }}
          >
            <Text className="text-black font-bold text-lg">Save Grades</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}


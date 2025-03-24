"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import BackButton from "@/components/buttons/BackButton"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const timeSlots = ["9:00 AM - 5:00 PM", "10:00 AM - 6:00 PM", "11:00 AM - 7:00 PM", "12:00 PM - 8:00 PM"]

// Mock initial schedule
const initialSchedule = {
  Monday: { isWorking: true, hours: "9:00 AM - 5:00 PM" },
  Tuesday: { isWorking: true, hours: "9:00 AM - 5:00 PM" },
  Wednesday: { isWorking: true, hours: "10:00 AM - 6:00 PM" },
  Thursday: { isWorking: true, hours: "10:00 AM - 6:00 PM" },
  Friday: { isWorking: true, hours: "11:00 AM - 7:00 PM" },
  Saturday: { isWorking: true, hours: "12:00 PM - 8:00 PM" },
  Sunday: { isWorking: false, hours: "Off" },
}

export default function WorkingHoursScreen() {
  const router = useRouter()
  const [schedule, setSchedule] = useState(initialSchedule)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const toggleDayWorking = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        isWorking: !schedule[day].isWorking,
        hours: !schedule[day].isWorking ? "9:00 AM - 5:00 PM" : "Off",
      },
    })
  }

  const setDayHours = (day: string, hours: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        hours,
      },
    })
  }

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)

      Alert.alert("Schedule Updated", "Your working hours have been updated successfully.")
    }, 1000)
  }

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsEditing(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Working Hours</Text>
        {isLoading ? (
          <View style={styles.placeholderButton} />
        ) : (
          <TouchableOpacity
            onPress={isEditing ? handleSave : handleEdit}
            disabled={isSaving}
            style={[styles.actionButton, isEditing && styles.saveButton]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={isEditing ? "#000" : "#FFD700"} />
            ) : (
              <Text style={[styles.actionButtonText, isEditing && styles.saveButtonText]}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.scheduleContainer}>
            {daysOfWeek.map((day, index) => (
              <View key={day} style={[styles.dayCard, index < daysOfWeek.length - 1 && styles.dayCardWithBorder]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day}</Text>

                  {isEditing ? (
                    <Switch
                      trackColor={{ false: "#333", true: "#FFD700" }}
                      thumbColor={schedule[day].isWorking ? "#FFFFFF" : "#f4f3f4"}
                      ios_backgroundColor="#333"
                      onValueChange={() => toggleDayWorking(day)}
                      value={schedule[day].isWorking}
                    />
                  ) : (
                    <View style={[styles.statusBadge, schedule[day].isWorking ? styles.openBadge : styles.closedBadge]}>
                      <Text style={[styles.statusText, schedule[day].isWorking ? styles.openText : styles.closedText]}>
                        {schedule[day].isWorking ? "Open" : "Closed"}
                      </Text>
                    </View>
                  )}
                </View>

                {isEditing && schedule[day].isWorking ? (
                  <View style={styles.timeSlotContainer}>
                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.timeSlotButton, schedule[day].hours === slot && styles.selectedTimeSlot]}
                        onPress={() => setDayHours(day, slot)}
                      >
                        <Text
                          style={[styles.timeSlotText, schedule[day].hours === slot && styles.selectedTimeSlotText]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.hoursText}>{schedule[day].isWorking ? schedule[day].hours : "Closed"}</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.noteContainer}>
            <FontAwesome6 name="circle-info" size={18} color="#FFD700" />
            <Text style={styles.noteText}>
              Your working hours determine when clients can book appointments with you.
            </Text>
          </View>
        </ScrollView>
      )}
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
    fontSize: 22,
    fontWeight: "bold",
  },
  placeholderButton: {
    width: 60,
    height: 36,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  actionButtonText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  saveButtonText: {
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  scheduleContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  dayCard: {
    padding: 16,
  },
  dayCardWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  closedBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  openText: {
    color: "#4CAF50",
  },
  closedText: {
    color: "#F44336",
  },
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  timeSlotButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: "#FFD700",
  },
  timeSlotText: {
    color: "white",
    fontSize: 12,
  },
  selectedTimeSlotText: {
    color: "#000000",
    fontWeight: "500",
  },
  hoursText: {
    color: "#999",
    fontSize: 14,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "flex-start",
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },
  noteText: {
    color: "#999",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
})


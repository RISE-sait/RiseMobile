"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { COLORS } from "@/constants/colors"

interface DateTimeSelectorProps {
  label: string
  date: Date
  setDate: (date: Date) => void
  showPicker: boolean
  setShowPicker: (show: boolean) => void
  mode: "date" | "time"
  hasError?: boolean
  errorMessage?: string
}

const formatDate = (date: Date) => date.toDateString()
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  label,
  date,
  setDate,
  showPicker,
  setShowPicker,
  mode,
  hasError,
  errorMessage,
}) => {
  const onChange = (event: any, selectedDate?: Date) => {
    const currentPlatform = Platform.OS

    // Handle platform-specific behavior
    if (currentPlatform === 'android') {
      // On Android, the picker shows a dialog
      // Only update the date if the user pressed "OK" (event.type === 'set')
      // If they pressed "Cancel", event.type will be 'dismissed'
      if (event.type === 'set' && selectedDate) {
        setDate(selectedDate)
      }
      // Always close the picker after any event on Android
      setShowPicker(false)
    } else {
      // On iOS, the picker is inline and updates continuously
      if (selectedDate) {
        setDate(selectedDate)
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.button, hasError && styles.errorButton]} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{mode === "date" ? formatDate(date) : formatTime(date)}</Text>
        <Ionicons
          name={mode === "date" ? "calendar" : "time"}
          size={24}
          color={hasError ? "#ff4d4f" : COLORS.primary}
        />
      </TouchableOpacity>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {showPicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
          minimumDate={mode === "date" ? new Date() : undefined}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, marginTop: 8 },
  label: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 8 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  buttonText: { fontSize: 16, color: COLORS.text },
  errorButton: {
    borderColor: "#ff4d4f",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
})

export default DateTimeSelector


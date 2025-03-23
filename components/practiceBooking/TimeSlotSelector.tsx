import type React from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native"
import { COLORS } from "@/constants/colors"

// Update the TimeSlot interface to match the one in practiceBooking.tsx
interface TimeSlot {
  time: string
  availability: string // Changed from "high" | "medium" | "low" to string to be more flexible
  timestamp: number
}

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[]
  selectTimeSlot: (slot: TimeSlot) => void // Changed from (time: string) => void
  selectedTime?: number
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ timeSlots, selectTimeSlot, selectedTime }) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "high":
        return "#4CAF50" // Green
      case "medium":
        return "#FFC107" // Amber
      case "low":
        return "#F44336" // Red
      default:
        return COLORS.textSecondary
    }
  }

  const renderAvailabilityIndicator = (availability: string) => {
    const color = getAvailabilityColor(availability)
    return (
      <View style={[styles.availabilityIndicator, { backgroundColor: color }]}>
        <Text style={styles.availabilityText}>
          {availability === "high" ? "High" : availability === "medium" ? "Med" : "Low"}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={timeSlots}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.timeSlot,
              { backgroundColor: COLORS.cardLight },
              selectedTime === item.timestamp && styles.selectedTimeSlot,
            ]}
            onPress={() => selectTimeSlot(item)}
          >
            <Text style={[styles.timeText, selectedTime === item.timestamp && styles.selectedTimeText]}>
              {item.time}
            </Text>
            {renderAvailabilityIndicator(item.availability)}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  list: { paddingVertical: 8 },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.cardLight,
    minWidth: 100,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: "500",
  },
  selectedTimeText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  availabilityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  availabilityText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
})

export default TimeSlotSelector


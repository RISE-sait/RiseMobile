import type React from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"
import type { Court } from "@/store/slices/courtsSlice"

interface CourtSelectorProps {
  courts: Court[]
  selectedCourt: Court | null
  setSelectedCourt: React.Dispatch<React.SetStateAction<Court | null>>
  selectedDate?: Date
  startTime?: Date
  endTime?: Date
  hasError?: boolean
  errorMessage?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#4CAF50'
    case 'in_use':
      return '#FF5252'
    case 'maintenance':
      return '#FFC107'
    case 'reserved':
      return '#2196F3'
    default:
      return '#999999'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available'
    case 'in_use':
      return 'In Use'
    case 'maintenance':
      return 'Maintenance'
    case 'reserved':
      return 'Reserved'
    default:
      return 'Unknown'
  }
}

const CourtSelector: React.FC<CourtSelectorProps> = ({
  courts,
  selectedCourt,
  setSelectedCourt,
  selectedDate,
  startTime,
  endTime,
  hasError,
  errorMessage,
}) => {
  // Helper function to check if a court is available for the selected time slot
  const isCourtAvailableForTimeSlot = (court: Court) => {
    // If no date/time selected yet, show all courts as available
    if (!selectedDate || !startTime || !endTime) {
      return true
    }

    // If court has no current event, it's available
    if (!court.current_event) {
      return true
    }

    // Combine selected date with selected times
    const selectedStart = new Date(selectedDate)
    selectedStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)

    const selectedEnd = new Date(selectedDate)
    selectedEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)

    const eventStart = new Date(court.current_event.start_time)
    const eventEnd = new Date(court.current_event.end_time)

    // Check if the selected time slot overlaps with the current event
    // Available if: selected ends before event starts OR selected starts after event ends
    const noOverlap = selectedEnd <= eventStart || selectedStart >= eventEnd

    return noOverlap
  }

  // Show message if date/time not selected yet
  const showTimeMessage = !selectedDate || !startTime || !endTime

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Court</Text>
      {showTimeMessage && (
        <View style={styles.messageContainer}>
          <Ionicons name="information-circle" size={16} color={COLORS.primary} />
          <Text style={styles.messageText}>
            Select date and time first to see court availability
          </Text>
        </View>
      )}
      <FlatList
        data={courts}
        renderItem={({ item }) => {
          const isAvailable = isCourtAvailableForTimeSlot(item)

          return (
            <TouchableOpacity
              style={[
                styles.item,
                selectedCourt?.id === item.id && styles.selected,
                hasError && styles.errorBorder,
                !isAvailable && styles.disabledItem
              ]}
              onPress={() => setSelectedCourt(item)}
              disabled={!isAvailable}
            >
              <View style={styles.iconContainer}>
                <FontAwesome5 name="basketball-ball" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.courtInfo}>
                <Text style={[styles.name, !isAvailable && styles.disabledText]}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  {item.location_name && (
                    <>
                      <Ionicons name="location" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.location}>{item.location_name}</Text>
                    </>
                  )}
                </View>
                {!isAvailable && selectedDate && startTime && endTime && (
                  <Text style={styles.unavailableText}>
                    Conflict with existing booking
                  </Text>
                )}
              </View>
              {selectedCourt?.id === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          )
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  errorBorder: {
    borderColor: "#ff4d4f",
  },
  disabledItem: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  courtInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "bold",
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  unavailableText: {
    fontSize: 11,
    color: '#FF5252',
    marginTop: 4,
    fontStyle: 'italic',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
})

export default CourtSelector

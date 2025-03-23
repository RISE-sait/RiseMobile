"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { FontAwesome6 } from "@expo/vector-icons"

interface TimeSlot {
  label: string
  value: string
}

interface DayScheduleCardProps {
  day: string
  isWorking: boolean
  hours: string
  isEditing: boolean
  index: number
  onToggleWorking: (day: string) => void
  onChangeHours: (day: string, hours: string) => void
  timeSlots: TimeSlot[]
}

const DayScheduleCard: React.FC<DayScheduleCardProps> = ({
  day,
  isWorking,
  hours,
  isEditing,
  index,
  onToggleWorking,
  onChangeHours,
  timeSlots,
}) => {
  // Animation values
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  React.useEffect(() => {
    // Staggered animation
    opacity.value = withDelay(index * 70, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }))

    translateY.value = withDelay(index * 70, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  const handleToggleWorking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleWorking(day)
  }

  const handleSelectTimeSlot = (timeSlot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChangeHours(day, timeSlot)
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={isWorking ? ["#1A1A1A", "#252525"] : ["#1A1A1A", "#1A1A1A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.dayName}>{day}</Text>

          {isEditing ? (
            <Switch
              trackColor={{ false: "#333", true: "#FFD700" }}
              thumbColor={isWorking ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#333"
              onValueChange={handleToggleWorking}
              value={isWorking}
            />
          ) : (
            <View style={[styles.statusBadge, isWorking ? styles.openBadge : styles.closedBadge]}>
              <FontAwesome6 name={isWorking ? "check" : "xmark"} size={10} color={isWorking ? "#4CAF50" : "#FF4D4F"} />
              <Text style={[styles.statusText, isWorking ? styles.openText : styles.closedText]}>
                {isWorking ? "Open" : "Closed"}
              </Text>
            </View>
          )}
        </View>

        {isEditing && isWorking ? (
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                style={[styles.timeSlot, hours === slot.value && styles.selectedTimeSlot]}
                onPress={() => handleSelectTimeSlot(slot.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeSlotText, hours === slot.value && styles.selectedTimeSlotText]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.hoursText}>{isWorking ? hours : "Closed"}</Text>
        )}
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dayName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  closedBadge: {
    backgroundColor: "rgba(255, 77, 79, 0.15)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  openText: {
    color: "#4CAF50",
  },
  closedText: {
    color: "#FF4D4F",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
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
    fontSize: 13,
  },
  selectedTimeSlotText: {
    color: "#000000",
    fontWeight: "500",
  },
  hoursText: {
    color: "#999",
    fontSize: 14,
  },
})

export default DayScheduleCard


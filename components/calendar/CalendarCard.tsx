import type React from "react"
import { View, Text } from "react-native"
import { Calendar } from "react-native-calendars"

interface CalendarCardProps {
  selectedDate: string
  events: Record<string, any[]>
  onDayPress: (day: { dateString: string }) => void
}

const CalendarCard: React.FC<CalendarCardProps> = ({ selectedDate, events, onDayPress }) => {
  // Create marked dates object
  const markedDates = {
    // Selected date
    [selectedDate]: {
      selected: true,
      selectedColor: "#FCA311",
      selectedTextColor: "#000000",
    },

    // Dates with events
    ...Object.entries(events).reduce(
      (acc, [date, dateEvents]) => {
        // If it's the selected date, we still want to show the dots
        const dots = []

        // Check for matches (orange dots)
        if (dateEvents.some((event) => event.type === "match")) {
          dots.push({ key: "match", color: "#FCA311" })
        }

        // Check for events (green dots)
        if (dateEvents.some((event) => event.type === "event")) {
          dots.push({ key: "event", color: "#4ade80" })
        }

        // For the selected date, we want both the selection and the dots
        if (date === selectedDate) {
          acc[date] = {
            ...acc[date],
            dots,
            marked: dots.length > 0,
          }
        } else {
          acc[date] = {
            dots,
            marked: dots.length > 0,
          }
        }

        return acc
      },
      {} as Record<string, any>,
    ),
  }

  return (
    <View className="rounded-xl bg-[#121212] overflow-hidden">
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          calendarBackground: "#121212",
          textSectionTitleColor: "#FFFFFF",
          textSectionTitleDisabledColor: "#666666",
          selectedDayBackgroundColor: "#FCA311",
          selectedDayTextColor: "#000000",
          todayTextColor: "#FCA311",
          dayTextColor: "#FFFFFF",
          textDisabledColor: "#444444",
          dotColor: "#FCA311",
          selectedDotColor: "#FFFFFF",
          arrowColor: "#FCA311",
          disabledArrowColor: "#444444",
          monthTextColor: "#FFFFFF",
          indicatorColor: "#FCA311",
          textDayFontWeight: "300",
          textMonthFontWeight: "500",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          "stylesheet.calendar.header": {
            header: {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 10,
            },
            monthText: {
              fontSize: 18,
              fontWeight: "500",
              color: "#FFFFFF",
              margin: 10,
            },
            arrow: {
              padding: 10,
              backgroundColor: "#222222",
              borderRadius: 15,
            },
          },
          "stylesheet.day.basic": {
            base: {
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            },
            today: {
              borderWidth: 1,
              borderColor: "#FCA311",
              borderRadius: 18,
            },
            selected: {
              borderRadius: 18,
            },
          },
        }}
      />

      {/* Legend */}
      <View className="flex-row justify-end py-2 px-4 bg-[#121212]">
        <View className="flex-row items-center mr-4">
          <View className="w-2 h-2 rounded-full bg-[#FCA311] mr-1" />
          <Text className="text-gray-400 text-xs">Matches</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-[#4ade80] mr-1" />
          <Text className="text-gray-400 text-xs">Events</Text>
        </View>
      </View>
    </View>
  )
}

export default CalendarCard

import React from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";

interface CalendarCardProps {
  selectedDate: string;
  events: Record<string, any[]>;
  onDayPress: (day: { dateString: string }) => void;
}

const CalendarCard: React.FC<CalendarCardProps> = ({ selectedDate, events, onDayPress }) => {
  return (
    <View className="rounded-2xl bg-white/10 p-2 shadow-lg shadow-gold-100">
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: "#FCA311",
            selectedTextColor: "#0C0B0B",
          },
          ...Object.keys(events).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: "#FCA311" };
            return acc;
          }, {}),
        }}
        theme={{
          calendarBackground: "#1D1C1E",
          textSectionTitleColor: "#F0F0F0",
          selectedDayBackgroundColor: "#FCA311",
          selectedDayTextColor: "#0C0B0B",
          todayTextColor: "#FCA311",
          dayTextColor: "#F0F0F0",
          arrowColor: "#FCA311",
          monthTextColor: "#F0F0F0",
          textDayFontSize: 14,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
          textMonthFontWeight: "bold",
          textDayFontWeight: "500",
          textDayHeaderFontWeight: "500",
        }}
      />
    </View>
  );
};

export default CalendarCard;

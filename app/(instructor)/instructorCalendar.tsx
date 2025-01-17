import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { StatusBar } from "expo-status-bar";

const InstructorCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulated event fetching - replace this with your API
      const sampleEvents = {
        "2025-01-31": [
          { id: "1", title: "Math Class", time: "10:00 AM" },
          { id: "2", title: "Physics Lab", time: "1:00 PM" },
        ],
      };
      setEvents(sampleEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventsForSelectedDate = events[selectedDate] || [];

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      {/* Status Bar */}
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="py-5">
        <Text className="text-center text-3xl font-Oswald-SemiBold text-white-100">Instructor Calendar</Text>
      </View>

      {/* Calendar Component with Rounded Corners */}
      <View className="p-5">
        <View className="rounded-2xl overflow-hidden shadow-md">
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#B59422",
                selectedTextColor: "white",
              },
              ...Object.keys(events).reduce((acc, date) => {
                acc[date] = { marked: true, dotColor: "#B59422" };
                return acc;
              }, {}),
            }}
            theme={{
              calendarBackground: "#2D2D2D",
              textSectionTitleColor: "#FFFFFF",
              selectedDayBackgroundColor: "#B59422",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#B59422",
              dayTextColor: "#FFFFFF",
              arrowColor: "#B59422",
              monthTextColor: "#FFFFFF",
              textDayFontWeight: "300",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 14,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
              textMonthFontFamily: "Oswald-Regular", // Change the month font
              textDayFontFamily: "Oswald-Regular", // Change the day number font
              textDayHeaderFontFamily: "Oswald-Regular", // Change the header font (e.g., "Sun", "Mon")
            }}
          />
        </View>
      </View>

      {/* Event List */}
      <View className="flex-1 bg-gray-800 rounded-t-3xl p-5 shadow-lg">
        {loading ? (
          <Text className="text-center text-gray-400">Loading events...</Text>
        ) : (
          <>
            <Text className="text-lg font-Oswald-Bold text-white-100 mb-3">Events on {selectedDate}</Text>
            <FlatList
              data={eventsForSelectedDate}
              keyExtractor={(item, index) => `${selectedDate}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity className="bg-[#444444] rounded-xl p-4 mb-3 shadow-md">
                  <Text className="text-lg font-semibold text-white">{item.title}</Text>
                  <Text className="text-sm text-gray-300 mt-1">{item.time}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="flex items-center justify-center mt-5">
                  <Text className="text-center text-gray-400 text-base">
                    No events for this day.
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default InstructorCalendar;

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AthleteCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const sampleEvents = {
        "2025-02-05": [
          { id: "1", title: "🏋️ Football Training", time: "6:00 AM" },
          { id: "2", title: "⚽ Game vs Rivals", time: "3:00 PM" },
        ],
        "2025-02-10": [{ id: "3", title: "📢 Team Meeting", time: "12:00 PM" }],
      };
      setEvents(sampleEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventsForSelectedDate = events[selectedDate] || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingTop: 10 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* **Header** */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#F0F0F0", fontSize: 24, fontWeight: "800" }}>📅 Calendar</Text>
          <TouchableOpacity>
            <Text style={{ color: "#FCA311", fontWeight: "bold" }}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* **Calendar Component** */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: 8,
              shadowColor: "#FCA311",
              shadowOpacity: 0.6,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
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
        </View>

        {/* **Event List** */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#1D1C1E",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: -3 },
          }}
        >
          {loading ? (
            <Text style={{ textAlign: "center", color: "#F0F0F0", fontSize: 16 }}>Loading events...</Text>
          ) : (
            <>
              <Text style={{ color: "#FCA311", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                Matches & Trainings on {dayjs(selectedDate).format("DD MMM YYYY")}
              </Text>
              <FlatList
                data={eventsForSelectedDate}
                keyExtractor={(item, index) => `${selectedDate}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                      shadowColor: "#FCA311",
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    <Text style={{ color: "#F0F0F0", fontSize: 16, fontWeight: "bold" }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: "#BFBFBF", fontSize: 14, marginTop: 4 }}>{item.time}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Text style={{ color: "#BFBFBF", fontSize: 16 }}>No events scheduled.</Text>
                  </View>
                }
              />
            </>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AthleteCalendar;

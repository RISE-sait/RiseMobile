import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import PageTitle from "@/app/components/PageTitle";
import CalendarCard from "@/app/components/CalendarCard";
import EventListContainer from "@/app/components/EventListContainer";
import EventListItem from "@/app/components/EventListItem";
import { mockEvents } from "@/app/(athlete)/screens/eventsData";
import { mockMatches } from "@/app/(athlete)/screens/matchesData";

const { width } = Dimensions.get("window");

const CoachCalendar = () => {
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
      const eventsData: Record<string, any[]> = {};

      // Add general events for the coach
      mockEvents.forEach((event) => {
        if (!eventsData[event.date]) {
          eventsData[event.date] = [];
        }
        eventsData[event.date].push({
          id: event.id,
          title: event.title,
          time: event.time,
          type: "event",
        });
      });

      // Add matches that the coach's team is involved in
      mockMatches.forEach((match) => {
        if (!eventsData[match.date]) {
          eventsData[match.date] = [];
        }
        eventsData[match.date].push({
          id: match.id,
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          time: match.status === "Upcoming" ? "Scheduled" : match.status,
          type: "match",
        });
      });

      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventsForSelectedDate = events[selectedDate] || [];

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <PageTitle title="Coach Calendar" />

        <View className="px-5 py-4">
          <CalendarCard
            selectedDate={selectedDate}
            events={events}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />
        </View>

        <EventListContainer date={dayjs(selectedDate).format("DD MMM YYYY")}>
          {loading ? (
            <Text className="text-center text-white">Loading events...</Text>
          ) : (
            <FlatList
              data={eventsForSelectedDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EventListItem 
                id={item.id} 
                title={item.title} 
                time={item.time} 
                type={item.type} />
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-300">No events scheduled.</Text>
              }
            />
          )}
        </EventListContainer>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CoachCalendar;

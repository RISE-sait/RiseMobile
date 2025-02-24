import React, { useEffect, useState, useRef } from "react";
import { View, Text, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { mockEvents, Event } from "../eventsData";
import dayjs from "dayjs";
import EventImageHeader from "@/app/components/EventImageHeader";
import BackButton from "@/app/components/BackButton";
import EventInfoRow from "@/app/components/EventInfoRow";

const EventDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const foundEvent = mockEvents.find((e) => e.id === id);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [id]);

  if (loading || !event) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212] items-center justify-center">
        <StatusBar translucent style="light" />
        <Text className="text-gray-300 text-lg">
          {loading ? "Loading event details..." : "Event not found"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <StatusBar translucent style="light" />
      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        <ScrollView>
          <EventImageHeader image={event.image} />
          <BackButton />

          <View className="px-5 py-6 -mt-12 bg-[#121212] rounded-t-3xl">
            <Text className="text-white-100 text-3xl font-bold mb-2">{event.title}</Text>

            <EventInfoRow
              icon="calendar-days"
              text={dayjs(event.date).format("dddd, MMMM D, YYYY")}
            />
            <EventInfoRow icon="clock" text={event.time} />
            <EventInfoRow icon="location-dot" text={event.location} />

            <View className="border-t border-white-100/10 my-5" />

            <Text className="text-white-100 font-semibold text-lg mb-2">About Event</Text>
            <Text className="text-gray-300 text-base leading-6">{event.description}</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default EventDetails;

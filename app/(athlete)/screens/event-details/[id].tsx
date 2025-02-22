import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { mockEvents, Event } from "../eventsData";

const EventDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      const foundEvent = mockEvents.find((e) => e.id === id);
      setEvent(foundEvent || null);
      setLoading(false);
    }, 0);
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212", paddingHorizontal: 15 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#bbb" }}>Loading event details...</Text>
        </View>
      ) : event ? (
        <>
          {/* Event Image */}
          <Image source={{ uri: event.image }} style={{ width: "100%", height: 250, borderRadius: 20, marginTop: 20 }} resizeMode="cover" />

          {/* Event Info */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "white" }}>{event.title}</Text>
            <Text style={{ color: "#bbb", marginTop: 10 }}>{event.date} | {event.time}</Text>
            <Text style={{ color: "#ccc", marginTop: 10 }}>{event.location}</Text>
            <Text style={{ color: "#eee", marginTop: 20, fontSize: 16, lineHeight: 24 }}>{event.description}</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: "#FFD700",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
            onPress={() => router.push("/(athlete)/screens/events")}
          >
            <Text style={{ color: "black", fontWeight: "bold", fontSize: 18 }}>Back to Events</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#bbb" }}>Event not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EventDetails;

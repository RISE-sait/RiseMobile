import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { mockEvents, Event } from "./eventsData";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Simulate API Call
  useEffect(() => {
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    
    if (eventDate < today) return "Past"; 
    if (eventDate.toDateString() === today.toDateString()) return "Ongoing"; 
    return "Upcoming"; 
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 15,
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        backdropFilter: "blur(10px)",
      }}
      onPress={() => router.push({ pathname: "/(athlete)/screens/event-details/[id]", params: { id: item.id } })}
    >
      {/* Event Image */}
      <Image source={{ uri: item.image }} style={{ width: 90, height: 90, borderRadius: 12 }} resizeMode="cover" />
      
      {/* Event Details */}
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
        <Text style={{ color: "#bbb", fontSize: 14, marginTop: 5 }}>{item.date} | {item.time}</Text>
        <Text style={{ color: "#ccc", fontSize: 13, marginTop: 5 }}>{item.location}</Text>
        
        {/* Event Status (Upcoming, Ongoing, Past) */}
        <View style={{
          backgroundColor: getEventStatus(item.date) === "Upcoming" ? "#FFD700" : getEventStatus(item.date) === "Ongoing" ? "#32CD32" : "#FF4500",
          alignSelf: "flex-start",
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 12,
          marginTop: 8,
        }}>
          <Text style={{ color: "black", fontSize: 12, fontWeight: "bold" }}>{getEventStatus(item.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212", paddingHorizontal: 15 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <TouchableOpacity
  onPress={() => router.replace("/(athlete)/(tabs)/home")}
  style={{
    position: "absolute",
    top: 70, // Move down slightly
    left: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10, // Ensures it's above other content
  }}
>
  <Ionicons name="chevron-back" size={28} color="#F0F0F0" />
</TouchableOpacity>

{/* Header (Adjusted for Overlap) */}
<View style={{ marginTop: 90, marginBottom: 20 }}> 
  {/* ⬆️ Increased marginTop to push it below the button */}
  <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center" }}>
    📅 Upcoming Events
  </Text>
</View>


      {/* Loading Skeleton */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: "#bbb", marginTop: 10 }}>Fetching latest events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: "#bbb", fontSize: 16 }}>No upcoming events</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default EventsScreen;

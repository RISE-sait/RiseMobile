import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, Animated, ScrollView, TouchableOpacity, 
  Share, StyleSheet, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { mockEvents, Event } from "@/app/(athlete)/screens/eventsData";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import EventImageHeader from "@/components/EventImageHeader";
import BackButton from "@/components/BackButton";
import EventInfoRow from "@/components/EventInfoRow";

const { width } = Dimensions.get("window");

const EventDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Find the event by ID
    const foundEvent = mockEvents.find((e) => e.id === id);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [id]);

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    
    if (eventDate < today) return "Past"; 
    if (eventDate.toDateString() === today.toDateString()) return "Ongoing"; 
    return "Upcoming"; 
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "#FCA311";
      case "Ongoing":
        return "#4CAF50";
      case "Past":
        return "#9E9E9E";
      default:
        return "#FCA311";
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${dayjs(event.date).format("MMMM D, YYYY")} at ${event.location}. ${event.description}`,
        title: event.title,
      });
    } catch (error) {
      console.error("Error sharing event:", error);
    }
  };

  const handleRegister = () => {
    setRegistered(!registered);
    // In a real app, you would make an API call here
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.loadingText}>
          {loading ? "Loading event details..." : "Event not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const eventStatus = getEventStatus(event.date);
  const statusColor = getStatusColor(eventStatus);
  const isPastEvent = eventStatus === "Past";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Event Image Header */}
          <EventImageHeader image={event.image} />
          {/* Back Button Container */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{eventStatus}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <EventInfoRow
                icon="calendar-days"
                text={dayjs(event.date).format("dddd, MMMM D, YYYY")}
              />
              <EventInfoRow icon="clock" text={event.time} />
              <EventInfoRow icon="location-dot" text={event.location} />
              <EventInfoRow icon="user" text={`Organized by: ${event.organizer}`} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description}</Text>
            
            <View style={styles.divider} />
            
            {/* Additional Information Section */}
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={20} color="#FCA311" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Participants</Text>
                  <Text style={styles.infoValue}>Limited Capacity</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="card-outline" size={20} color="#FCA311" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Entry Fee</Text>
                  <Text style={styles.infoValue}>Free</Text>
                </View>
              </View>
            </View>
            
            {/* Spacer for bottom buttons */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
        
        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={22} color="#FCA311" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.registerButton,
              registered && styles.registeredButton,
              isPastEvent && styles.disabledButton
            ]}
            onPress={handleRegister}
            disabled={isPastEvent}
          >
            <Text style={[
              styles.registerButtonText,
              registered && styles.registeredButtonText,
              isPastEvent && styles.disabledButtonText
            ]}>
              {isPastEvent 
                ? "Event Ended" 
                : registered 
                  ? "Cancel Registration" 
                  : "Register for Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  statusBadge: {
    position: "absolute",
    top: 100,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: -20,
    backgroundColor: "#0C0B0B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: "rgba(252, 163, 17, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: {
    color: "#FCA311",
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
  },
  additionalInfo: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    color: "#999999",
    fontSize: 12,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(12, 11, 11, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(252, 163, 17, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  registerButton: {
    flex: 1,
    backgroundColor: "#FCA311",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  registeredButton: {
    backgroundColor: "rgba(252, 163, 17, 0.3)",
    borderWidth: 1,
    borderColor: "#FCA311",
  },
  disabledButton: {
    backgroundColor: "#333333",
  },
  registerButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  registeredButtonText: {
    color: "#FCA311",
  },
  disabledButtonText: {
    color: "#999999",
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
});

export default EventDetails;

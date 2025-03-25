"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import dayjs from "dayjs"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { FontAwesome5 } from "@expo/vector-icons"
import EventImageHeader from "@/components/events/EventImageHeader"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { API_URL } from "@/utils/api"
import { COLORS } from "@/constants/colors"

const { width } = Dimensions.get("window")

// Define interfaces for our data
interface EventDetails {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string
  organizer: string
  category: string
  status: string
}

const EventDetails: React.FC = () => {
  const { id, type } = useLocalSearchParams()
  const router = useRouter()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

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
      }),
    ]).start()

    fetchEventDetails()
  }, [id])

  // Function to clean the ID by removing any suffix (e.g., "-7")
  const cleanId = (id: string): string => {
    // UUID format is typically 36 characters with hyphens
    // If the ID is longer and has an extra hyphen, strip everything after the last hyphen
    if (id.length > 36 && id.lastIndexOf("-") > 23) {
      return id.substring(0, id.lastIndexOf("-"))
    }
    return id
  }

  // Function to extract the title/name from different API response formats
  const extractTitle = (data: any): string => {
    // Check all possible name fields based on item type
    if (data.title) return data.title
    if (data.name) return data.name
    if (data.practice_name) return data.practice_name
    if (data.course_name) return data.course_name

    // For events with practice_id, the practice_name might be the title
    if (data.practice_id && data.practice_name) return data.practice_name

    // Default fallback
    return type === "practice" ? "Practice Session" : type === "course" ? "Course" : "Event"
  }

  // Function to extract the description from different API response formats
  const extractDescription = (data: any): string => {
    // Check all possible description fields
    if (data.description) return data.description
    if (data.details) return data.details
    if (data.about) return data.about
    if (data.info) return data.info
    if (data.content) return data.content

    // Check for notes or additional information
    if (data.notes) return data.notes
    if (data.additional_info) return data.additional_info

    // For practices, the level and capacity might be useful information
    if (type === "practice" && data.level && data.capacity) {
      return `Level: ${data.level}\nCapacity: ${data.capacity} participants\n\n${data.description || ""}`
    }

    // Default fallback based on type
    if (type === "practice") {
      return "Join us for this practice session. Please arrive 15 minutes early and bring appropriate gear."
    } else if (type === "course") {
      return "This course is designed to help you improve your skills. All skill levels welcome."
    } else {
      return "Join us for this exciting event at RISE Basketball."
    }
  }

  const fetchEventDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get the user's auth token
      const userString = await AsyncStorage.getItem("user")
      if (!userString) {
        setError("Authentication error. Please log in again.")
        setLoading(false)
        return
      }

      const user = JSON.parse(userString)
      const token = user.token

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      // Clean the ID to remove any suffix
      const cleanedId = cleanId(id as string)
      console.log(`Original ID: ${id}, Cleaned ID: ${cleanedId}`)

      // Determine which endpoint to use based on the type
      let endpoint = `/programs/${cleanedId}`
      if (type === "practice" || type === "course" || type === "others") {
        // These are all program types, so we use the programs endpoint
        endpoint = `/programs/${cleanedId}`
      } else if (type === "event") {
        // Use events endpoint for explicit event types
        endpoint = `/events/${cleanedId}`
      } else if (type === "game" || type === "match") {
        // Use games endpoint for game/match types
        endpoint = `/games/${cleanedId}`
      }

      console.log(`Fetching details from ${endpoint}`)

      // Fetch event details
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("API Response:", response.data)

      // Process the data based on the response format
      const eventData = response.data

      // Transform API data to our EventDetails format
      const processedEvent: EventDetails = {
        id: eventData.id || cleanedId,
        title: extractTitle(eventData),
        description: extractDescription(eventData),
        date: processDate(eventData),
        time: processTime(eventData),
        location: eventData.location_name || "RISE Facility",
        image:
          eventData.image ||
          "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        organizer: eventData.organizer || "RISE Basketball",
        category: eventData.category || (type === "practice" ? "Practice" : type === "course" ? "Course" : "Event"),
        status: getEventStatus(eventData.date || new Date().toISOString()),
      }

      setEvent(processedEvent)

      // Check if user is registered for this event
      // This would typically come from the API
      setRegistered(false)
    } catch (err: any) {
      console.error("Error fetching event details:", err.response?.data || err.message)

      // Try to fetch from alternative endpoint if the first one failed
      if (endpoint.includes("/events/")) {
        try {
          console.log(`Retrying with programs endpoint for ID: ${cleanedId}`)
          const programResponse = await axios.get(`${API_URL}/programs/${cleanedId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          console.log("Programs API Response:", programResponse.data)

          // Process the data
          const eventData = programResponse.data
          // Transform API data to our EventDetails format
          const processedEvent: EventDetails = {
            id: eventData.id || cleanedId,
            title: extractTitle(eventData),
            description: extractDescription(eventData),
            date: processDate(eventData),
            time: processTime(eventData),
            location: eventData.location_name || "RISE Facility",
            image:
              eventData.image ||
              "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            organizer: eventData.organizer || "RISE Basketball",
            category: eventData.category || (type === "practice" ? "Practice" : type === "course" ? "Course" : "Event"),
            status: getEventStatus(eventData.date || new Date().toISOString()),
          }

          setEvent(processedEvent)
          setRegistered(false)
          setLoading(false)
          return
        } catch (retryErr) {
          console.error("Programs API retry error:", retryErr)
          // Continue to fallback
        }
      } else if (endpoint.includes("/programs/")) {
        try {
          console.log(`Retrying with events endpoint for ID: ${cleanedId}`)
          const eventsResponse = await axios.get(`${API_URL}/events/${cleanedId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          console.log("Events API Response:", eventsResponse.data)

          // Process the data
          const eventData = eventsResponse.data
          // Transform API data to our EventDetails format
          const processedEvent: EventDetails = {
            id: eventData.id || cleanedId,
            title: extractTitle(eventData),
            description: extractDescription(eventData),
            date: processDate(eventData),
            time: processTime(eventData),
            location: eventData.location_name || "RISE Facility",
            image:
              eventData.image ||
              "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            organizer: eventData.organizer || "RISE Basketball",
            category: eventData.category || (type === "practice" ? "Practice" : type === "course" ? "Course" : "Event"),
            status: getEventStatus(eventData.date || new Date().toISOString()),
          }

          setEvent(processedEvent)
          setRegistered(false)
          setLoading(false)
          return
        } catch (retryErr) {
          console.error("Events API retry error:", retryErr)
          // Continue to fallback
        }
      }

      setError("Failed to load event details. Please try again.")

      // For demo purposes, use mock data if API fails
      fallbackToMockData()
    } finally {
      setLoading(false)
    }
  }

  // Process date from various API formats
  const processDate = (data: any): string => {
    // Check for explicit date field
    if (data.date) {
      return dayjs(data.date).format("YYYY-MM-DD")
    }

    // Check for start_time field
    if (data.start_time) {
      return dayjs(data.start_time).format("YYYY-MM-DD")
    }

    // Check for session_start_at and day fields
    if (data.session_start_at && data.day) {
      const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
      const dayIndex = days.indexOf(data.day.toUpperCase())

      if (dayIndex !== -1) {
        const today = dayjs()
        const todayIndex = today.day()
        const daysUntilNext = (dayIndex - todayIndex + 7) % 7

        return today.add(daysUntilNext, "day").format("YYYY-MM-DD")
      }
    }

    // Default to today's date
    return dayjs().format("YYYY-MM-DD")
  }

  // Process time from various API formats
  const processTime = (data: any): string => {
    // Check for explicit time field
    if (data.time) {
      return data.time
    }

    // Check for start_time and end_time fields
    if (data.start_time && data.end_time) {
      const start = formatTimeString(data.start_time)
      const end = formatTimeString(data.end_time)
      return `${start} - ${end}`
    }

    // Check for session_start_at and session_end_at fields
    if (data.session_start_at && data.session_end_at) {
      const start = formatTimeString(data.session_start_at)
      const end = formatTimeString(data.session_end_at)
      return `${start} - ${end}`
    }

    // Check for just start time
    if (data.start_time) {
      return formatTimeString(data.start_time)
    }

    if (data.session_start_at) {
      return formatTimeString(data.session_start_at)
    }

    // Default
    return "TBD"
  }

  // Format time string from API
  const formatTimeString = (timeString: string): string => {
    if (!timeString) return "TBD"

    // Handle format like "18:30:00+00:00"
    if (timeString.includes(":")) {
      const timeParts = timeString.split(":")
      const hour = Number.parseInt(timeParts[0], 10)
      const minute = timeParts[1] ? Number.parseInt(timeParts[1], 10) : 0

      const ampm = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12

      return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`
    }

    return timeString
  }

  // Fallback to mock data if API fails
  const fallbackToMockData = () => {
    console.log("Using mock data as fallback")

    let title, description, category

    switch (type) {
      case "practice":
        title = "Basketball Practice Session"
        description =
          "Join us for this practice session focused on fundamentals and team play. Please arrive 15 minutes early and bring appropriate gear."
        category = "Practice"
        break
      case "course":
        title = "Basketball Skills Course"
        description =
          "This comprehensive course is designed to help players of all levels improve their basketball skills through structured training and personalized feedback."
        category = "Course"
        break
      default:
        title = "Summer Basketball Tournament"
        description =
          "Join us for our basketball event featuring teams from across the region. Compete for prizes and recognition!"
        category = "Tournament"
    }

    const mockEvent: EventDetails = {
      id: id as string,
      title,
      description,
      date: dayjs().add(3, "day").format("YYYY-MM-DD"),
      time: "9:00 AM - 6:00 PM",
      location: "Main Arena, RISE Facility",
      image:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      organizer: "RISE Basketball",
      category,
      status: "Upcoming",
    }

    setEvent(mockEvent)
  }

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date)
    const today = new Date()

    if (eventDate < today) return "Past"
    if (eventDate.toDateString() === today.toDateString()) return "Ongoing"
    return "Upcoming"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return COLORS.primary
      case "Ongoing":
        return COLORS.success
      case "Past":
        return COLORS.textSecondary
      default:
        return COLORS.primary
    }
  }

  const handleShare = async () => {
    if (!event) return

    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${dayjs(event.date).format("MMMM D, YYYY")} at ${event.location}. ${event.description}`,
        title: event.title,
      })
    } catch (error) {
      console.error("Error sharing event:", error)
    }
  }

  const handleRegister = () => {
    if (!event) return

    if (event.status === "Past") {
      Alert.alert("Cannot Register", "This event has already ended.")
      return
    }

    setRegistered(!registered)
    // In a real app, you would make an API call here
    Alert.alert(
      registered ? "Registration Cancelled" : "Registration Successful",
      registered ? "You have cancelled your registration." : `You are now registered for ${event.title}.`,
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    )
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.errorText}>{error || "Event not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEventDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusColor = getStatusColor(event.status)
  const isPastEvent = event.status === "Past"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
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
            <Text style={[styles.statusText, { color: statusColor }]}>{event.status}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>

            <View style={styles.infoSection}>
              <EventInfoRow icon="calendar" text={dayjs(event.date).format("dddd, MMMM D, YYYY")} />
              <EventInfoRow icon="clock" text={event.time} />
              <EventInfoRow icon="map-marker-alt" text={event.location} />
              <EventInfoRow icon="user" text={`Organized by: ${event.organizer}`} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>About {event.category}</Text>
            <Text style={styles.description}>{event.description}</Text>

            <View style={styles.divider} />

            {/* Additional Information Section */}
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <FontAwesome5 name="users" size={20} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Participants</Text>
                  <Text style={styles.infoValue}>Limited Capacity</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5 name="credit-card" size={20} color={COLORS.primary} />
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
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <FontAwesome5 name="share-alt" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, registered && styles.registeredButton, isPastEvent && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isPastEvent}
          >
            <Text
              style={[
                styles.registerButtonText,
                registered && styles.registeredButtonText,
                isPastEvent && styles.disabledButtonText,
              ]}
            >
              {isPastEvent ? "Event Ended" : registered ? "Cancel Registration" : "Register for Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: {
    color: COLORS.primary,
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  additionalInfo: {
    backgroundColor: COLORS.card,
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
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.text,
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
    backgroundColor: `${COLORS.background}E6`,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  registeredButton: {
    backgroundColor: `${COLORS.primary}30`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.card,
  },
  registerButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  registeredButtonText: {
    color: COLORS.primary,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
})

export default EventDetails


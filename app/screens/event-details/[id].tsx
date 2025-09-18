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
import axios from "axios"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchEventById as fetchEventByIdRedux, selectDetailedEventById } from "@/store/slices/eventsSlice"
import { RootState } from "@/store"
import { FontAwesome5 } from "@expo/vector-icons"
import EventImageHeader from "@/components/events/EventImageHeader"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { API_URL, getMembershipByCustomerId } from "@/utils/api"
import { setMembership } from "@/store/slices/membershipSlice"
import { COLORS } from "@/constants/colors"
import * as WebBrowser from 'expo-web-browser'

const { width } = Dimensions.get("window")

// Define interfaces for our data
interface Location {
  id: string
  name: string
  address: string
}

interface User {
  id: string
  first_name: string
  last_name: string
}

interface EventDetails {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  locationAddress: string
  image: string
  organizer: string
  category: string
  status: string
  capacity: number
}

interface ApiEventResponse {
  id: string
  name?: string
  description?: string
  type?: string
  status?: string // Add status field from API
  created_at?: string
  updated_at?: string
  // Add these only if they exist
  location?: Location
  created_by?: User
  start_at?: string
  end_at?: string
  capacity?: number
  // Practice-specific fields from /secure/events endpoint
  program?: {
    id: string
    name: string
    type?: string
    description?: string
  }
  // Enrollment information
  customers?: Array<{
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string
    gender?: string
    has_cancelled_enrollment?: boolean
  }>
}

const EventDetails: React.FC = () => {
  const { id, type, source } = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.data)
  const membershipData = useAppSelector((state) => state.membership.data)

  // Try to get cached event from Redux first
  const cachedEvent = useAppSelector((state) => selectDetailedEventById(state, id as string))
  const eventsState = useAppSelector((state) => state.events)
  
  // Get practices from Redux store
  const practicesItems = useAppSelector((state: RootState) => state.practices.items)
  const practicesById = useAppSelector((state: RootState) => state.practices.byId)
  
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [credits, setCredits] = useState<number>(0)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Function to fetch user credits
  const fetchUserCredits = async () => {
    try {
      const token = userData?.token
      if (!token) return

      const response = await axios.get(`${API_URL}/secure/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCredits(response.data.balance || 0)
    } catch (error) {
      console.error("Error fetching credits:", error)
    }
  }

  // Function to fetch user membership
  const fetchUserMembership = async () => {
    try {
      if (!userData?.id) return

      const memberships = await getMembershipByCustomerId(userData.id)
      if (memberships?.length > 0) {
        dispatch(setMembership(memberships[0]))
      }
    } catch (error) {
      console.error("❌ Error fetching membership:", error)
    }
  }

  // Function to get practice data from Redux store
  const getPracticeDataFromStore = (practiceId: string): EventDetails | null => {
    // First try to get from byId mapping
    let practice = practicesById[practiceId]
    
    // If not found, try to find in items array
    if (!practice) {
      practice = practicesItems.find(item => item.id === practiceId) || undefined
    }
    
    if (!practice) {
      return null
    }
    
    
    // Transform practice data to EventDetails format
    const eventDetails: EventDetails = {
      id: practice.id,
      title: practice.title || "Practice Session",
      description: practice.description || "Practice session focused on skill development and team coordination.",
      date: practice.date || dayjs().format("YYYY-MM-DD"),
      time: practice.time || "TBD",
      location: practice.location || "RISE Basketball Facility",
      locationAddress: "401, 33 St. NE, Calgary AB", // Default address since not in CalendarItem
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      organizer: "RISE Basketball",
      category: "Practice",
      status: "scheduled",
      capacity: 0, // Default capacity since not in CalendarItem
    }
    
    return eventDetails
  }

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
    fetchUserCredits()
    fetchUserMembership()
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

  const fetchEventDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if event is already cached
      if (cachedEvent) {
        
        // Parse description for date/time info from cached event
        let startDate = null
        let endDate = null
        if (cachedEvent.description) {
          const parsed = parseEventFromDescription(cachedEvent.description, new Date())
          startDate = parsed.startTime || parsed.eventDate
          endDate = parsed.endTime
        }
        
        // Transform cached Redux event to our EventDetails format
        const processedEvent: EventDetails = {
          id: cachedEvent.id,
          title: cachedEvent.name || "RISE Event",
          description: cachedEvent.description || "No description provided.",
          date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          time: formatTimeRange(startDate, endDate),
          location: "RISE Facility",
          locationAddress: "",
          image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          organizer: "RISE Basketball",
          category: cachedEvent.type || "Event",
          status: (cachedEvent as any).status || getEventStatus(startDate, endDate), // Prioritize API status
          capacity: cachedEvent.capacity || 0,
        }
        setEvent(processedEvent)
        setLoading(false)
        return
      }

      // Use the userData from component level
      if (!userData) {
        setError("Authentication error. Please log in again.")
        setLoading(false)
        return
      }

      const token = userData.token

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      // Clean the ID to remove any suffix
      const cleanedId = cleanId(id as string)

      // Skip Redux for events and use direct API call with public endpoint

      // Fallback to direct API call for programs or if Redux fails
      if (type === "practice") {
        // For practices, try to get data from Redux store first
        
        // Try to get practice data from Redux store using the ID
        const practiceFromStore = getPracticeDataFromStore(cleanedId)
        if (practiceFromStore) {
          setEvent(practiceFromStore)
          setLoading(false)
          return
        }
        
        fallbackToMockData()
        return
      }
      
      // Use appropriate endpoint based on source
      let response;
      let url;

      // Always use public endpoint for event details - it contains full event info
      // The secure endpoint only returns enrolled events without full details
      url = `${API_URL}/events/${cleanedId}`;
      response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });


      // Process the data from the API response
      const eventData: ApiEventResponse = response.data

      // First try to get dates from API fields
      let startDate = eventData.start_at ? parseDateTime(eventData.start_at) : null
      let endDate = eventData.end_at ? parseDateTime(eventData.end_at) : null
      
      // If no start_at/end_at, parse from description
      if (!startDate && eventData.description) {
        const fallbackDate = eventData.created_at ? parseDateTime(eventData.created_at) : new Date()
        const parsed = parseEventFromDescription(eventData.description, fallbackDate)
        startDate = parsed.startTime || parsed.eventDate
        endDate = parsed.endTime
        
      }
      
      // Final fallback to created_at if still no dates
      if (!startDate && eventData.created_at) {
        startDate = parseDateTime(eventData.created_at)
      }
      if (!endDate && eventData.created_at) {
        endDate = parseDateTime(eventData.created_at)
      }
    

      // Get the organizer name
      const organizerName = eventData.created_by
        ? `${eventData.created_by.first_name} ${eventData.created_by.last_name}`
        : "RISE Basketball"

      // Transform API data to our EventDetails format
      const processedEvent: EventDetails = {
        id: eventData.id,
        title: eventData.name || eventData.program?.name || (type === "practice" ? "Practice Session" : "RISE Event"),
        description: eventData.program?.description || eventData.description || (type === "practice" ? `${eventData.program?.name || "Practice"} session` : "No description provided."),
        date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        time: formatTimeRange(startDate, endDate),
        location: eventData.location?.name || "RISE Facility",
        locationAddress: eventData.location?.address || "",
        image:
          "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        organizer: organizerName,
        category: eventData.type || "Event",
        status: eventData.status || getEventStatus(startDate, endDate), // Prioritize API status
        capacity: eventData.capacity || 0,
      }

      setEvent(processedEvent)

      // Check if user is already enrolled by looking in customers array
      const isUserEnrolled = eventData.customers?.some(customer =>
        customer.id === userData.id || customer.email === userData.email
      ) || false


      setRegistered(isUserEnrolled)
    } catch (err: any) {
      console.error("Error fetching event details:", err.response?.data || err.message)
      setError("Failed to load event details. Please try again.")

      // Use mock data as fallback
      fallbackToMockData()
    } finally {
      setLoading(false)
    }
  }

  // Parse date time string from API
  const parseDateTime = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null

    try {
      // Handle the double timezone format: "2025-09-05 17:30:00 -0600 -0600"
      // Remove the duplicate timezone and convert to ISO format
      let cleanedDateStr = dateTimeStr.replace(/(-\d{4})\s+(-\d{4})$/, '$1')

      // Convert "2025-09-05 17:30:00 -0600" to ISO format "2025-09-05T17:30:00-06:00"
      cleanedDateStr = cleanedDateStr.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(-\d{2})(\d{2})/, '$1T$2$3:$4')

      const parsedDate = new Date(cleanedDateStr)
      if (isNaN(parsedDate.getTime())) {
        return null
      }

      return parsedDate
    } catch (error) {
      return null
    }
  }

  // Extract event details from description text
  const parseEventFromDescription = (description: string, fallbackDate: Date | null) => {
    // Extract date - look for patterns like "September 5", "Sept 5", etc.
    const dateMatch = description.match(/(?:on\s+)?(\w+(?:ember|ary|ch|il|ay|ust|ober|vember|cember)?\s+\d{1,2})/i)
    let eventDate = fallbackDate
    
    if (dateMatch) {
      try {
        // Try to parse the date with current year
        const dateStr = `${dateMatch[1]} ${new Date().getFullYear()}`
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed
        }
      } catch (e) {
      }
    } else {
    }

    // Extract time range - look for patterns like "7:30-9:30pm", "5:30-7:30pm", "from 7:30-9:30pm"
    const timeMatch = description.match(/(?:from\s+)?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(pm|am)?/i)
    let startTime = null
    let endTime = null
    
    if (timeMatch && eventDate) {
      try {
        const startTimeStr = timeMatch[1]
        const endTimeStr = timeMatch[2] 
        const period = timeMatch[3]?.toLowerCase() || 'pm' // Default to PM for tryouts
        
        // Parse start time
        const [startHour, startMin] = startTimeStr.split(':').map(Number)
        let adjustedStartHour = startHour
        if (period === 'pm' && startHour < 12) adjustedStartHour += 12
        if (period === 'am' && startHour === 12) adjustedStartHour = 0
        
        startTime = new Date(eventDate)
        startTime.setHours(adjustedStartHour, startMin, 0, 0)
        
        // Parse end time  
        const [endHour, endMin] = endTimeStr.split(':').map(Number)
        let adjustedEndHour = endHour
        if (period === 'pm' && endHour < 12) adjustedEndHour += 12
        if (period === 'am' && endHour === 12) adjustedEndHour = 0
        
        endTime = new Date(eventDate)
        endTime.setHours(adjustedEndHour, endMin, 0, 0)
        
      } catch (e) {
      }
    }
    
    return { eventDate, startTime, endTime }
  }
  

  // Format time range from start and end dates
  const formatTimeRange = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate) return "TBD"

    const startTime = formatTime(startDate)

    if (!endDate) return startTime

    const endTime = formatTime(endDate)
    return `${startTime} - ${endTime}`
  }

  // Format time to 12-hour format
  const formatTime = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const ampm = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  // Get event title based on available data
  const getEventTitle = (data: ApiEventResponse, eventType: string): string => {
    // For now, we'll use a generic title since the API response doesn't include a title
    return eventType === "practice"
      ? "Basketball Practice Session"
      : eventType === "course"
        ? "Basketball Skills Course"
        : "Basketball Event"
  }

  // Get event description based on available data
  const getEventDescription = (data: ApiEventResponse, eventType: string): string => {
    // For now, we'll use a generic description since the API response doesn't include a description
    if (eventType === "practice") {
      return "Join us for this practice session focused on fundamentals and team play. Please arrive 15 minutes early and bring appropriate gear."
    } else if (eventType === "course") {
      return "This comprehensive course is designed to help players of all levels improve their basketball skills through structured training and personalized feedback."
    } else {
      return "Join us for our basketball event featuring teams from across the region. Compete for prizes and recognition!"
    }
  }

  // Get category from event type
  const getCategoryFromType = (eventType: string): string => {
    switch (eventType) {
      case "practice":
        return "Practice"
      case "course":
        return "Course"
      case "game":
      case "match":
        return "Game"
      default:
        return "Event"
    }
  }

  // Determine event status based on start and end dates - returns standardized status values
  const getEventStatus = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate) return "scheduled"

    const now = new Date()

    if (endDate && now > endDate) return "completed"
    if (startDate <= now && (!endDate || now <= endDate)) return "in_progress"
    return "scheduled"
  }

  // Fallback to mock data if API fails
  const fallbackToMockData = () => {

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
      locationAddress: "401, 33 St. NE, Calgary AB",
      image:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      organizer: "RISE Basketball",
      category,
      status: "scheduled",
      capacity: 100,
    }

    setEvent(mockEvent)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return COLORS.primary
      case "in_progress":
        return COLORS.success
      case "completed":
        return COLORS.textSecondary
      case "canceled":
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

  // Enhanced enrollment function based on API specification
  const enrollInEvent = async (paymentMethod: 'stripe' | 'credits' = 'stripe') => {
    if (!event || !userData?.token) return

    if (event.status === "completed") {
      Alert.alert("Cannot Register", "This event has already ended.")
      return
    }

    setEnrolling(true)
    try {
      const response = await fetch(
        `${API_URL}/checkout/events/${event.id}/enhanced`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payment_method: paymentMethod })
        }
      )

      const data = await response.json()

      if (response.ok) {
        if (data.payment_link) {
          // Outcome 2: Stripe payment required
          await WebBrowser.openBrowserAsync(data.payment_link)
          Alert.alert(
            "Complete Your Payment",
            "Please complete your payment. Once successful, you'll be automatically enrolled.",
            [{ text: "OK", onPress: () => fetchEventDetails() }]
          )
        } else {
          // Outcome 1 or 3: Free enrollment or credit payment successful
          setRegistered(true)
          Alert.alert(
            "Registration Successful!",
            data.message || "You've been successfully enrolled in this event.",
            [{ text: "OK", onPress: () => fetchEventDetails() }]
          )
          // Refresh credits if used
          if (paymentMethod === 'credits') {
            fetchUserCredits()
          }
        }
        setShowPaymentOptions(false)
      } else {
        // Handle API errors with server message
        const errorMessage = data?.error?.message || data?.message || "Registration failed. Please try again."
        Alert.alert("Registration Failed", errorMessage)
      }
    } catch (error: any) {
      console.error("Enrollment error:", error)
      Alert.alert("Connection Error", "Unable to connect to our servers. Please check your internet connection and try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleRegister = () => {
    if (!event) return

    if (registered) {
      // User is already enrolled - show confirmation message
      Alert.alert(
        "Already Enrolled",
        "You are already registered for this event. We look forward to seeing you there!",
        [{ text: "OK" }]
      )
      return
    }

    // Show payment options if event might require payment
    setShowPaymentOptions(true)
  }

  const handleRetry = () => {
    fetchEventDetails()
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
        <Text style={styles.errorText}>
          {error?.includes("Event not found") 
            ? "This item doesn't have detailed information available.\nTry booking through the main service pages."
            : error || "Unable to load details"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: COLORS.primary, marginTop: 10 }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.retryButtonText, { color: COLORS.background }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusColor = getStatusColor(event.status)
  const isPastEvent = event.status === "completed"

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
              <EventInfoRow
                icon="map-marker-alt"
                text={event.location}
                subText={event.locationAddress ? event.locationAddress : undefined}
              />
              <EventInfoRow icon="user" text={`Organized by: ${event.organizer}`} />
              {event.capacity > 0 && <EventInfoRow icon="users" text={`Capacity: ${event.capacity} participants`} />}
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
                  <Text style={styles.infoValue}>
                    {event.capacity > 0 ? `Capacity: ${event.capacity}` : "Limited Capacity"}
                  </Text>
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
            disabled={isPastEvent || enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text
                style={[
                  styles.registerButtonText,
                  registered && styles.registeredButtonText,
                  isPastEvent && styles.disabledButtonText,
                ]}
              >
                {isPastEvent ? "Event Ended" : registered ? "You're Already Enrolled" : "Register for Event"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enroll in Event</Text>
            <Text style={styles.modalSubtitle}>Choose your payment method</Text>

            {/* Stripe Payment Option (Default) */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => enrollInEvent('stripe')}
              disabled={enrolling}
            >
              <FontAwesome5 name="credit-card" size={20} color={COLORS.primary} />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Enroll</Text>
                <Text style={styles.paymentOptionSubtitle}>Free for members or pay with card</Text>
              </View>
            </TouchableOpacity>

            {/* Credits Option (Only if user has credits) */}
            {credits > 0 && (
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => enrollInEvent('credits')}
                disabled={enrolling}
              >
                <FontAwesome5 name="star" size={20} color={COLORS.primary} />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Use Credits</Text>
                  <Text style={styles.paymentOptionSubtitle}>Balance: {credits} credits</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaymentOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: width - 40,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
})

export default EventDetails

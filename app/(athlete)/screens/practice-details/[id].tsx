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
import { useAppSelector } from "@/store/hooks"
import { FontAwesome5 } from "@expo/vector-icons"
import EventImageHeader from "@/components/events/EventImageHeader"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { API_URL } from "@/utils/api"
import { COLORS } from "@/constants/colors"

const { width } = Dimensions.get("window")

// Practice details interface based on GET /practices/{id} API
interface PracticeDetails {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  locationAddress: string
  image: string
  team_name: string
  coach_name: string
  status: string
  capacity: number
  current_participants: number
}

// API response interface for GET /practices/{id} - Based on practice.ResponseDto from Swagger
interface ApiPracticeResponse {
  id: string
  team_id: string
  team_name: string
  team_logo_url: string
  start_time: string
  end_time: string
  location_id: string
  location_name: string
  court_id: string
  court_name: string
  booked_by: string
  booked_by_name: string
  status: "scheduled" | "completed" | "canceled"
  created_at: string
  updated_at: string
}

const PracticeDetails: React.FC = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const userData = useAppSelector((state) => state.user.data)
  
  const [practice, setPractice] = useState<PracticeDetails | null>(null)
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

    fetchPracticeDetails()
  }, [id])

  const fetchPracticeDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!userData?.token) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      const practiceId = id as string

      // Call the correct API endpoint for practices
      const response = await axios.get(`${API_URL}/practices/${practiceId}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      })


      // Transform API response to our PracticeDetails format
      const apiData: ApiPracticeResponse = response.data
      
      const transformedPractice: PracticeDetails = {
        id: apiData.id,
        title: `${apiData.team_name} Practice`,
        description: `Practice session for ${apiData.team_name}. Focus on skill development, teamwork, and conditioning.`,
        start_time: apiData.start_time,
        end_time: apiData.end_time,
        location: `${apiData.court_name} at ${apiData.location_name}`,
        locationAddress: "401, 33 St. NE, Calgary AB", // Default - could be enhanced with location details API
        image: apiData.team_logo_url || "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        team_name: apiData.team_name,
        coach_name: apiData.booked_by_name || "RISE Basketball",
        status: getStatusFromApi(apiData.status, apiData.start_time),
        capacity: 25, // Default capacity - could be enhanced with actual data
        current_participants: 0, // Would need participant count from API
      }

      setPractice(transformedPractice)
    } catch (err: any) {
      console.warn("⚠️ Error fetching practice details:", err.response?.data || err.message)
      setError("Failed to load practice details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Convert API status to display status - based on practice.ResponseDto status values
  const getStatusFromApi = (apiStatus: string, startTime: string): string => {
    const now = dayjs()
    const practiceStart = dayjs(startTime)
    
    if (apiStatus === "canceled") return "Cancelled"  // API uses "canceled" not "cancelled"
    if (apiStatus === "completed") return "completed"
    
    // For "scheduled" status, check time to determine if ongoing or upcoming
    if (apiStatus === "scheduled") {
      if (practiceStart.isBefore(now)) return "Ongoing"
      return "scheduled"
    }
    
    return "scheduled" // Default fallback
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return COLORS.primary
      case "Ongoing":
        return COLORS.success
      case "completed":
        return COLORS.textSecondary
      case "Cancelled":
        return COLORS.danger
      default:
        return COLORS.primary
    }
  }

  const formatTime = (dateTime: string): string => {
    return dayjs(dateTime).format("h:mm A")
  }

  const formatDate = (dateTime: string): string => {
    return dayjs(dateTime).format("dddd, MMMM D, YYYY")
  }

  const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  const handleShare = async () => {
    if (!practice) return

    try {
      await Share.share({
        message: `Check out this practice: ${practice.title} on ${formatDate(practice.start_time)} at ${practice.location}. ${practice.description}`,
        title: practice.title,
      })
    } catch (error) {
      console.warn("Error sharing practice:", error)
    }
  }

  const handleJoinPractice = () => {
    if (!practice) return

    if (practice.status === "completed" || practice.status === "Cancelled") {
      Alert.alert("Cannot Join", `This practice has been ${practice.status.toLowerCase()}.`)
      return
    }

    setRegistered(!registered)
    // In a real app, you would make an API call here
    Alert.alert(
      registered ? "Left Practice" : "Joined Practice",
      registered ? "You have left this practice session." : `You have joined ${practice.title}.`,
    )
  }

  const handleRetry = () => {
    fetchPracticeDetails()
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading practice details...</Text>
      </SafeAreaView>
    )
  }

  if (error || !practice) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.errorText}>{error || "Practice not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusColor = getStatusColor(practice.status)
  const isPastPractice = practice.status === "completed" || practice.status === "Cancelled"

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
          {/* Practice Image Header */}
          <EventImageHeader image={practice.image} />
          
          {/* Back Button Container */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{practice.status}</Text>
          </View>

          {/* Practice Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{practice.title}</Text>

            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>Practice Session</Text>
            </View>

            <View style={styles.infoSection}>
              <EventInfoRow icon="calendar" text={formatDate(practice.start_time)} />
              <EventInfoRow icon="clock" text={formatTimeRange(practice.start_time, practice.end_time)} />
              <EventInfoRow
                icon="map-marker-alt"
                text={practice.location}
                subText={practice.locationAddress}
              />
              <EventInfoRow icon="user" text={`Coach: ${practice.coach_name}`} />
              <EventInfoRow icon="users" text={`Team: ${practice.team_name}`} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>About This Practice</Text>
            <Text style={styles.description}>{practice.description}</Text>

            <View style={styles.divider} />

            {/* Practice Information Section */}
            <Text style={styles.sectionTitle}>Practice Information</Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <FontAwesome5 name="basketball-ball" size={20} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Sport</Text>
                  <Text style={styles.infoValue}>Basketball</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5 name="clock" size={20} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>
                    {dayjs(practice.end_time).diff(dayjs(practice.start_time), 'hour')} hours
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5 name="credit-card" size={20} color={COLORS.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Cost</Text>
                  <Text style={styles.infoValue}>Included in membership</Text>
                </View>
              </View>
            </View>

            {/* Spacer for bottom buttons */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActionsSingle}>
          <TouchableOpacity style={styles.shareButtonCentered} onPress={handleShare}>
            <FontAwesome5 name="share-alt" size={22} color={COLORS.primary} />
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
    color: COLORS.danger,
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
  bottomActionsSingle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
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
  shareButtonCentered: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  joinButton: {
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
  joinButtonText: {
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

export default PracticeDetails

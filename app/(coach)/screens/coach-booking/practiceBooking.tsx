import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import DateTimeSelector from "@/components/practiceBooking/DateTimeSelector";
import TeamSelector from "@/components/practiceBooking/TeamSelector";
import CourtSelector from "@/components/practiceBooking/CourtSelector";
import ConfirmationModal from "@/components/practiceBooking/ConfirmationModal";
import StepIndicator from "@/components/practiceBooking/StepIndicator";
import { createPracticeThunk, createRecurringPracticeThunk } from "@/store/slices/practicesSlice";
import { useAppDispatch } from "@/store/hooks";
import { API_URL } from "@/utils/api";
import { useSelector } from "react-redux"
import { fetchTeams, selectTeamsForCoach, selectAllTeams } from "@/store/slices/teamsSlice"
import { fetchCourts, forceFetchCourts, selectAllCourts } from "@/store/slices/courtsSlice"
import type { Court } from "@/store/slices/courtsSlice"
import { selectCurrentUser } from "@/store/selectors/userSelectors"
import { RootState } from "@/store"
import type { CreatePracticePayload, CreateRecurringPracticePayload } from "@/types/practice"
import dayjs from "dayjs";
import type { Team } from "@/types/team"
import { TeamDisplay } from "@/types/ui";

// Default booking configuration - extracted from hardcoded values for better maintainability
const DEFAULT_BOOKING_CONFIG = {
  LOCATION_ID: "626d44dd-6a98-42df-8fec-a36179da506f", // Rise Facility- Calgary Central Sportsplex
  COURT_ID: "9dda472d-6176-47b3-ab25-18b17be0c0f5", // Court 1
  LOCATION_NAME: "Rise Facility- Calgary Central Sportsplex",
  COURT_NAME: "Court 1",
} as const;






const CoachPracticeBooking = () => {

  const router = useRouter()
  const dispatch = useAppDispatch();
  const { getValidToken, firebaseUser } = useAuth();



  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  // Form State
  const [date, setDate] = useState(() => new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startTime, setStartTime] = useState(() => new Date())
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [endTime, setEndTime] = useState(() => {
    const now = new Date()
    now.setHours(now.getHours() + 2)
    return now
  })
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamDisplay | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [endDate, setEndDate] = useState(() => {
    const defaultEnd = new Date()
    defaultEnd.setDate(defaultEnd.getDate() + 28) // Default to 4 weeks out
    return defaultEnd
  })
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const user = useSelector(selectCurrentUser)
  const isBooking = useSelector((state: RootState) => state.practices.isBooking)

  // Determine if user is admin
  const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "super_admin"

  // For admins, show all teams; for coaches, show only their teams
  const allTeams = useSelector(selectAllTeams)
  const coachTeams = useSelector((state: RootState) =>
    user?.id ? selectTeamsForCoach(state, user.id) : [],
    (left, right) => {
      if (left.length !== right.length) return false
      return left.every((team, index) => team.id === right[index]?.id)
    }
  )

  const displayTeams = isAdmin ? allTeams : coachTeams
  const courts = useSelector(selectAllCourts)






useEffect(() => {
  const fetchCoachData = async () => {
    try {
      if (!firebaseUser) {
        console.log("No firebase user")
        return
      }

      if (!user?.id) {
        console.log("No user id")
        return
      }

      // Use centralized token management
      const token = await getValidToken()
      if (!token) {
        console.log("No token")
        return
      }

      console.log("Fetching teams and courts...")
      // Fetch both teams and courts
      dispatch(fetchTeams(token))
      dispatch(fetchCourts(token))
    } catch (error) {
      console.error("Error fetching coach data:", error)
    }
  }

  fetchCoachData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dispatch, user?.id])

  

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])



  const validateCurrentStep = () => {
    const errors: {[key: string]: string} = {}

    if (currentStep === 1) {
      if (!selectedCourt) {
        errors.court = "Please select a court"
      }
      if (isRecurring && dayjs(endDate).isBefore(dayjs(date))) {
        errors.endDate = "End date must be after start date"
      }
    }

    if (currentStep === 2) {
      if (!selectedTeam) {
        errors.team = "Please select a team"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (!validateCurrentStep()) {
      // Show first error as an alert
      const firstError = Object.values(formErrors)[0]
      if (firstError) {
        Alert.alert("Error", firstError)
      }
      return
    }

    if (currentStep < 2) {
      setCurrentStep((prevStep) => prevStep + 1)
    } else {
      setShowConfirmation(true)
    }
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1)
    } else {
      router.back()
    }
  }
  
const formatTeamForDisplay = (team: Team) => ({
  ...team,
  players: team.roster?.length ?? team.capacity ?? 0, // Use roster count if available, fallback to capacity, then 0
  icon: "users",
  image: team.logo_url || "https://via.placeholder.com/40x40?text=T", // Use actual team logo or fallback
})

  // Memoize the formatted teams to prevent unnecessary re-renders
  const formattedTeams = useMemo(() => {
    return displayTeams.map(formatTeamForDisplay)
  }, [displayTeams, user?.id])

  
const handleConfirmBooking = async () => {
  // Prevent double booking - check if a booking request is already in progress
  if (isBooking) {
    return
  }

  if (!selectedTeam) {
    Alert.alert("Missing Info", "Please select a team.")
    return
  }

  if (!selectedCourt) {
    Alert.alert("Missing Info", "Please select a court.")
    return
  }

  if (!user?.id) {
    // No user logged in
    Alert.alert("Error", "User not found. Please log in again.")
    return
  }

  try {
    setIsSubmitting(true)

    // Use centralized token management
    const token = await getValidToken()
    if (!token) {
      Alert.alert("Authentication Error", "Failed to get authentication token.")
      return
    }

    // Fix date booking issue: Combine selected date with selected times
    const combinedStartDateTime = dayjs(date)
      .hour(dayjs(startTime).hour())
      .minute(dayjs(startTime).minute())
      .second(0)
      .millisecond(0);

    const combinedEndDateTime = dayjs(date)
      .hour(dayjs(endTime).hour())
      .minute(dayjs(endTime).minute())
      .second(0)
      .millisecond(0);






    // Validate required fields
    if (!user?.id) {
      Alert.alert("Error", "User ID not found. Please log in again.")
      return
    }
    if (!selectedTeam?.id) {
      Alert.alert("Error", "Please select a team.")
      return
    }

    // Create payloads with proper date/time combination and selected court
    const payload: CreatePracticePayload = {
      booked_by: user.id,
      court_id: selectedCourt.id,
      end_time: combinedEndDateTime.toISOString(),
      location_id: selectedCourt.location_id,
      start_time: combinedStartDateTime.toISOString(),
      status: "scheduled",
      team_id: selectedTeam.id,
    };

    // Use user-selected start and end dates for recurring practices
    // Backend creates one practice per week on the specified day between start and end dates
    const recurrenceStartDate = dayjs(date).startOf('day');
    const recurrenceEndDate = dayjs(endDate).startOf('day');

    // Calculate approximate number of occurrences for display
    const weeksDiff = recurrenceEndDate.diff(recurrenceStartDate, 'week') + 1;

    console.log("[PracticeBooking] Recurring calculation:", {
      startDate: recurrenceStartDate.format("YYYY-MM-DD"),
      endDate: recurrenceEndDate.format("YYYY-MM-DD"),
      approximateOccurrences: weeksDiff,
      day: dayjs(date).format("dddd").toUpperCase(),
    });

    const recurringPayload = {
      court_id: selectedCourt.id,
      day: dayjs(date).format("dddd").toUpperCase(), // "MONDAY" (uppercase)
      location_id: selectedCourt.location_id,
      practice_start_at: combinedStartDateTime.format("HH:mm:ssZ"), // "18:00:00+00:00"
      practice_end_at: combinedEndDateTime.format("HH:mm:ssZ"), // "20:00:00+00:00"
      recurrence_start_at: recurrenceStartDate.toISOString(),
      recurrence_end_at: recurrenceEndDate.toISOString(),
      status: "scheduled",
      team_id: selectedTeam.id,
    };

    // Debug logging to verify location_id
    console.log("[PracticeBooking] Selected court:", {
      id: selectedCourt.id,
      name: selectedCourt.name,
      location_id: selectedCourt.location_id,
      location_name: selectedCourt.location_name
    });
    console.log("[PracticeBooking] Practice payload:", isRecurring ? recurringPayload : payload);

    // Create the practice
    try {
      if (isRecurring) {
        const result = await dispatch(createRecurringPracticeThunk(recurringPayload)).unwrap()
        // Recurring practice created successfully
      } else {
        const result = await dispatch(createPracticeThunk(payload)).unwrap()
        // Practice created successfully
      }

      setShowConfirmation(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      Alert.alert(
        "Success",
        `Your ${isRecurring ? 'recurring ' : ''}practice has been scheduled successfully!`,
        [{ text: "OK", onPress: () => router.back() }]
      )
    } catch (thunkError: any) {
      // Thunk error occurred

      // Special handling for 503 errors - they often succeed on server side
      const is503Error = thunkError?.message?.includes('503') ||
                        thunkError?.error?.includes('503') ||
                        (typeof thunkError === 'string' && thunkError.includes('503')) ||
                        thunkError?.message?.includes('status code 503')

      if (is503Error) {
        setShowConfirmation(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)

        Alert.alert(
          "Server Busy",
          "The server is currently busy, but your practice may have been scheduled. Please check your schedule to confirm.",
          [
            { text: "Check Schedule", onPress: () => router.back() },
            { text: "OK" }
          ]
        )
        return
      }

      // Handle other error types
      let errorMessage = "Something went wrong. Please try again."

      if (typeof thunkError === 'string') {
        errorMessage = thunkError
      } else if (thunkError?.message) {
        errorMessage = thunkError.message
      } else if (thunkError?.error) {
        errorMessage = thunkError.error
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert("Booking Failed", errorMessage)

      // Don't close the modal so user can retry
      return
    }

  } catch (error: any) {
    // Unexpected error occurred
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again.")
  } finally {
    setIsSubmitting(false)
  }
}




  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonArrow} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Practice</Text>
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <StepIndicator currentStep={currentStep} />

        <FlatList
          data={[{ key: "content" }]}
          keyExtractor={(item) => item.key}
          renderItem={() => (
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY }] }]}>
              {/* Step 1: Date, Time & Court Selection */}
              {currentStep === 1 && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Schedule Details</Text>
                    <Text style={styles.sectionSubtitle}>Select when and where you want to schedule this practice</Text>
                  </View>

                  {/* Recurring Toggle */}
                  <View style={styles.recurringToggleContainer}>
                    <View style={styles.recurringToggleLeft}>
                      <Ionicons name="repeat" size={22} color={isRecurring ? COLORS.primary : COLORS.textSecondary} />
                      <View style={styles.recurringToggleText}>
                        <Text style={styles.recurringToggleLabel}>Recurring Practice</Text>
                        <Text style={styles.recurringToggleSubtext}>
                          {isRecurring ? "Weekly on " + dayjs(date).format("dddd") + "s" : "One-time practice"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.recurringToggleButton, isRecurring && styles.recurringToggleButtonActive]}
                      onPress={() => setIsRecurring(!isRecurring)}
                    >
                      <Text style={[styles.recurringToggleButtonText, isRecurring && styles.recurringToggleButtonTextActive]}>
                        {isRecurring ? "ON" : "OFF"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Info Box - Only for Admins */}
                  {isAdmin && (
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                      <Text style={styles.infoBoxText}>
                        When selecting a court for practices, please review the facility details
                      </Text>
                    </View>
                  )}

                  {/* Date Selection */}
                  <DateTimeSelector
                    label={isRecurring ? "Start Date" : "Date"}
                    date={date}
                    setDate={setDate}
                    showPicker={showDatePicker}
                    setShowPicker={setShowDatePicker}
                    mode="date"
                    hasError={!!formErrors.date}
                    errorMessage={formErrors.date}
                  />

                  {/* End Date - Only show if recurring */}
                  {isRecurring && (
                    <>
                      <DateTimeSelector
                        label="End Date"
                        date={endDate}
                        setDate={setEndDate}
                        showPicker={showEndDatePicker}
                        setShowPicker={setShowEndDatePicker}
                        mode="date"
                        hasError={!!formErrors.endDate}
                        errorMessage={formErrors.endDate}
                      />
                      <View style={styles.recurringInfoBanner}>
                        <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.recurringInfoText}>
                          This will create a practice every {dayjs(date).format("dddd")} from{" "}
                          {dayjs(date).format("MMM D")} to {dayjs(endDate).format("MMM D, YYYY")}
                          {" "}({Math.max(1, dayjs(endDate).diff(dayjs(date), 'week') + 1)} sessions)
                        </Text>
                      </View>
                    </>
                  )}

                  <View style={styles.timeRangeContainer}>
                    <DateTimeSelector
                      label="Start Time"
                      date={startTime}
                      setDate={setStartTime}
                      showPicker={showStartTimePicker}
                      setShowPicker={setShowStartTimePicker}
                      mode="time"
                      hasError={!!formErrors.time}
                    />
                    <DateTimeSelector
                      label="End Time"
                      date={endTime}
                      setDate={setEndTime}
                      showPicker={showEndTimePicker}
                      setShowPicker={setShowEndTimePicker}
                      mode="time"
                      hasError={!!formErrors.time}
                      errorMessage={formErrors.time}
                    />
                  </View>

                  {/* Court Selection - AFTER Date/Time */}
                  {courts.length === 0 ? (
                    <View style={styles.noCourtsContainer}>
                      <Text style={styles.noCourtsText}>Loading courts...</Text>
                    </View>
                  ) : (
                    <CourtSelector
                      courts={courts}
                      selectedCourt={selectedCourt}
                      setSelectedCourt={setSelectedCourt}
                      selectedDate={date}
                      startTime={startTime}
                      endTime={endTime}
                      hasError={!!formErrors.court}
                      errorMessage={formErrors.court}
                    />
                  )}
                </>
              )}

              {/* Step 2: Team & Practice Type Selection */}
              {currentStep === 2 && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Team Selection</Text>
                    <Text style={styles.sectionSubtitle}>Choose which team this practice is for</Text>
                  </View>
                  {formattedTeams.length === 0 ? (
                    <View style={styles.noTeamsContainer}>
                      <Text style={styles.noTeamsText}>No teams found. Pull down to refresh or check your connection.</Text>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={async () => {
                          const token = await getValidToken()
                          if (token) {
                            dispatch(fetchTeams(token))
                          }
                        }}
                      >
                        <Text style={styles.refreshButtonText}>Refresh Teams</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TeamSelector
                      teams={formattedTeams}
                      selectedTeam={selectedTeam}
                      setSelectedTeam={setSelectedTeam}
                      hasError={!!formErrors.team}
                      errorMessage={formErrors.team}
                    />
                  )}




                </>
              )}

            </Animated.View>
          )}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.backButton]} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>{currentStep === 1 ? "Cancel" : "Back"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.nextButton]}
          onPress={handleNextStep}
        >
          <Text style={styles.nextButtonText}>{currentStep < 2 ? "Next" : "Review"}</Text>
          <Ionicons
            name={currentStep < 2 ? "arrow-forward" : "checkmark-circle"}
            size={20}
            color="#000"
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmBooking}
        date={date.toDateString()}
        startTime={startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        endTime={endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        team={selectedTeam ? selectedTeam.name : undefined}
        facility={selectedCourt ? `${selectedCourt.location_name || 'Court'} - ${selectedCourt.name}` : 'No court selected'}
        notes={undefined}
        isRecurring={isRecurring}
        recurringDetails={isRecurring ?
          `Weekly on ${dayjs(date).format("dddd")}s from ${dayjs(date).format("MMM D")} to ${dayjs(endDate).format("MMM D, YYYY")} (${Math.max(1, dayjs(endDate).diff(dayjs(date), 'week') + 1)} sessions)` :
          undefined
        }
        isSubmitting={isBooking || isSubmitting}
      />
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark,
  },
  backButtonArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginLeft: 16 },
  keyboardAvoidingContainer: { flex: 1 },
  scrollViewContent: { paddingBottom: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardDark,
  },
  footerButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 120,
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "rgba(40, 40, 40, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  nextButtonIcon: {
    marginLeft: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    textAlign: "center",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectorButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "bold",
  },
  timeSelectionContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  timeSelectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  timeRangeContainer: {
    marginTop: 8,
  },
  noTimeSlotsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  errorInput: {
    borderColor: "#ff4d4f",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  noTeamsContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    marginVertical: 10,
  },
  noTeamsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  noCourtsContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    marginVertical: 10,
  },
  noCourtsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.background,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}15`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  recurringToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  recurringToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recurringToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  recurringToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  recurringToggleSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recurringToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
    minWidth: 60,
    alignItems: "center",
  },
  recurringToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  recurringToggleButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  recurringToggleButtonTextActive: {
    color: COLORS.background,
  },
  recurringInfoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primary + "15",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  recurringInfoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 10,
    lineHeight: 18,
  },
})

export default CoachPracticeBooking

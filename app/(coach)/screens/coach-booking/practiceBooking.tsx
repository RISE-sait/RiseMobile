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
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import DateTimeSelector from "@/components/practiceBooking/DateTimeSelector";
import TeamSelector from "@/components/practiceBooking/TeamSelector";
import RecurringOptions from "@/components/practiceBooking/RecurringOptions";
import NotesInput from "@/components/practiceBooking/NotesInput";
import ConfirmationModal from "@/components/practiceBooking/ConfirmationModal";
import StepIndicator from "@/components/practiceBooking/StepIndicator";
import { createPracticeThunk, createRecurringPracticeThunk } from "@/store/slices/practicesSlice";
import { useAppDispatch } from "@/store/hooks";
import { API_URL } from "@/utils/api";
import { useSelector } from "react-redux"
import { fetchTeams, selectTeamsForCoach, selectAllTeams } from "@/store/slices/teamsSlice"
import { RootState } from "@/store"
import type { CreatePracticePayload, CreateRecurringPracticePayload } from "@/types/practice"
import dayjs from "dayjs";
import type { Team } from "@/types/team"
import { TeamDisplay } from "@/types/ui";



interface RecurringOptionsType {
  weekly: boolean
  biweekly: boolean
  monthly: boolean
  occurrences: number
}



const CoachPracticeBooking = () => {

  const router = useRouter()
  const dispatch = useAppDispatch();



  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  // Form State
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 2)))
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamDisplay | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringOptions, setRecurringOptions] = useState<RecurringOptionsType>({
    weekly: true,
    biweekly: false,
    monthly: false,
    occurrences: 4,
  })
  const [notes, setNotes] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  
  const user = useSelector((state: RootState) => state.user.data)

  const coachTeams = useSelector((state: RootState) =>
  user?.id ? selectTeamsForCoach(state, user.id) : []
  )






useEffect(() => {
  const fetchCoachTeams = async () => {
    try {
      const firebaseUser = getAuth().currentUser
      if (!firebaseUser) throw new Error("User not authenticated")

      const firebaseToken = await firebaseUser.getIdToken(true)
      const jwtResponse = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { Authorization: `Bearer ${firebaseToken}` },
        body: JSON.stringify({ email: firebaseUser.email }),
      })

      const jwt = jwtResponse.headers.get("authorization")?.replace("Bearer ", "")
      if (!jwt) throw new Error("Failed to retrieve backend JWT")

      dispatch(fetchTeams(jwt))
    } catch (error) {
      console.error("❌ Failed to fetch coach teams:", error)
    }
  }

  fetchCoachTeams()
}, [dispatch])

  

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])



  const validateCurrentStep = () => {
    const errors: {[key: string]: string} = {}
    
   
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
    
    if (currentStep < 3) {
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
  players: 0, // or estimate if you later add roster
  icon: "users",
  image: `https://source.unsplash.com/random/300x200/?basketball-${team.id}`,
})

const payload: CreatePracticePayload = {
  start_time: startTime.toISOString(),
  end_time: endTime.toISOString(),
  location_id: "e2d1cd76-592f-4c06-89ee-9027cfbbe9de", // replace with real location_id if available
  court_id: "41870572-ecfa-441d-af09-d2d7ad9b654c", // replace with real court_id if available
  status: "scheduled",
  team_id: selectedTeam?.id ?? "",
}



const recurringPayload: CreateRecurringPracticePayload = {
  day: dayjs(date).format("dddd").toUpperCase(), // e.g. "MONDAY"
  event_start_at: startTime.toISOString(),
  event_end_at: endTime.toISOString(),
  location_id: "default",
  team_id: selectedTeam?.id ?? "",
  recurrence_start_at: dayjs(date).toISOString(),
  recurrence_end_at: dayjs(date)
    .add(recurringOptions.occurrences - 1, recurringOptions.weekly ? "week" : recurringOptions.biweekly ? "week" : "month")
    .toISOString(),
}
  
const handleConfirmBooking = async () => {
  if (!selectedTeam) {
    Alert.alert("Missing Info", "Please select a team.")
    return
  }

  try {
    setIsSubmitting(true)

    if (isRecurring) {
      await dispatch(createRecurringPracticeThunk(recurringPayload)).unwrap()
    } else {
      await dispatch(createPracticeThunk(payload)).unwrap()
    }

    setShowConfirmation(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    Alert.alert("Success", "Your practice has been booked!")
    router.back()

  } catch (error) {
    console.error("❌ Booking error:", error)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    Alert.alert("Booking Failed", "Something went wrong. Please try again.")
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
              {/* Step 1: Facility, Date & Time Selection */}
              {currentStep === 1 && (
                <>
                  <DateTimeSelector
                    label="Date"
                    date={date}
                    setDate={setDate}
                    showPicker={showDatePicker}
                    setShowPicker={setShowDatePicker}
                    mode="date"
                    hasError={!!formErrors.date}
                    errorMessage={formErrors.date}
                  />
                  
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
                </>
              )}

              {/* Step 2: Team & Practice Type Selection */}
              {currentStep === 2 && (
                <>
                  <TeamSelector 
                    teams={coachTeams.map(formatTeamForDisplay)}
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    hasError={!!formErrors.team}
                    errorMessage={formErrors.team}
                  />




                </>
              )}

              {/* Step 3: Notes */}
              {currentStep === 3 && (
                <>
                  <RecurringOptions
                    isRecurring={isRecurring}
                    setIsRecurring={setIsRecurring}
                    recurringOptions={recurringOptions}
                    setRecurringOptions={setRecurringOptions}
                  />

                  <NotesInput notes={notes} setNotes={setNotes} />
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
          <Text style={styles.nextButtonText}>{currentStep < 3 ? "Next" : "Review"}</Text>
          <Ionicons
            name={currentStep < 3 ? "arrow-forward" : "checkmark-circle"}
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
        facility={"RISE Basketball Complex"}
        notes={notes}
        isRecurring={isRecurring}
        recurringDetails={isRecurring ? 
          `Repeats ${recurringOptions.weekly ? 'weekly' : recurringOptions.biweekly ? 'biweekly' : 'monthly'} for ${recurringOptions.occurrences} occurrences` : 
          undefined
        }
        isSubmitting={isSubmitting}
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
})

export default CoachPracticeBooking

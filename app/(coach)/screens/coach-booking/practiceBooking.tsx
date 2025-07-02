"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getAuth } from "firebase/auth"
import { createPractice, createRecurringPractice } from "@/utils/api" // adjust path
import { useRouter } from "expo-router"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { COLORS } from "@/constants/colors"
import DateTimeSelector from "@/components/practiceBooking/DateTimeSelector"
import TimeSlotSelector from "@/components/practiceBooking/TimeSlotSelector"
import TeamSelector from "@/components/practiceBooking/TeamSelector"
import PracticeTypeSelector from "@/components/practiceBooking/PracticeTypeSelector"
import EquipmentSelector from "@/components/practiceBooking/EquipmentSelector"
import RecurringOptions from "@/components/practiceBooking/RecurringOptions"
import NotesInput from "@/components/practiceBooking/NotesInput"
import ConfirmationModal from "@/components/practiceBooking/ConfirmationModal"
import StepIndicator from "@/components/practiceBooking/StepIndicator"
import FacilitySelector from "@/components/practiceBooking/FacilitySelector"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import { getPracticePrograms } from "@/utils/api"; // or wherever you placed it


// Define the types
interface Team {
  id: string
  name: string
  players: number
  icon: string
  image: string
}
interface PracticeType {
  id: string;
  name: string;
  description?: string;
  duration: number; // ✅ remove the ?
  visibility?: string;
}



interface Facility {
  id: string
  name: string
  type: string
  icon: string
  availability: string
  image: string
}

interface TimeSlot {
  time: string
  availability: string
  timestamp: number
}

interface RecurringOptionsType {
  weekly: boolean
  biweekly: boolean
  monthly: boolean
  occurrences: number
}

const teams: Team[] = [
  { id: "1", name: "Varsity Team", players: 12, icon: "users", image: "https://source.unsplash.com/random/300x200/?basketball-team" },
  { id: "2", name: "Junior Varsity", players: 10, icon: "users", image: "https://source.unsplash.com/random/300x200/?basketball-youth" },
  { id: "3", name: "Development Squad", players: 8, icon: "child", image: "https://source.unsplash.com/random/300x200/?basketball-training" },
  { id: "4", name: "All-Stars", players: 15, icon: "star", image: "https://source.unsplash.com/random/300x200/?basketball-stars" },
]



const facilities: Facility[] = [
  { id: "1", name: "Main Gym", type: "Indoor Court", icon: "building", availability: "high", image: "https://source.unsplash.com/random/300x200/?basketball-court" },
  { id: "2", name: "Practice Court", type: "Indoor Court", icon: "basketball-ball", availability: "medium", image: "https://source.unsplash.com/random/300x200/?gym" },
  { id: "3", name: "Outdoor Court", type: "Outdoor Court", icon: "cloud-sun", availability: "high", image: "https://source.unsplash.com/random/300x200/?outdoor-basketball" },
  { id: "4", name: "Fitness Center", type: "Training Facility", icon: "dumbbell", availability: "low", image: "https://source.unsplash.com/random/300x200/?fitness-center" },
]

const CoachPracticeBooking = () => {
  const [practiceTypes, setPracticeTypes] = useState<PracticeType[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);

  const router = useRouter()

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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedPracticeType, setSelectedPracticeType] = useState<PracticeType | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<{ id: string; name: string }[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringOptions, setRecurringOptions] = useState<RecurringOptionsType>({
    weekly: true,
    biweekly: false,
    monthly: false,
    occurrences: 4,
  })
  const [notes, setNotes] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Generate time slots based on selected date and facility
  const generateTimeSlots = useMemo(() => {
    // This would normally come from an API based on the selected date and facility
    const slots: TimeSlot[] = []
    const startHour = 6 // Start at 6 AM
    const endHour = 22 // End at 10 PM
    
    // If we have a selected facility, adjust availability based on its general availability
    const availabilityChance = selectedFacility ? 
      (selectedFacility.availability === "high" ? 0.8 : 
       selectedFacility.availability === "medium" ? 0.6 : 0.4) : 0.7
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip times in the past for today
        const slotTime = new Date(date)
        slotTime.setHours(hour, minute)
        
        if (date.toDateString() === new Date().toDateString() && slotTime < new Date()) {
          continue
        }
        
        const time = `${hour % 12 || 12}:${minute === 0 ? "00" : minute} ${hour < 12 ? "AM" : "PM"}`
        const availability = Math.random() > (1 - availabilityChance) ? 
          (Math.random() > 0.5 ? "high" : "medium") : "low"
        
        slots.push({ 
          time, 
          availability,
          timestamp: slotTime.getTime()
        })
      }
    }
    
    return slots
  }, [date, selectedFacility])

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  useEffect(() => {
  const fetchPrograms = async () => {
    try {
      const programs = await getPracticePrograms();
      setPracticeTypes(programs);
    } catch (error: any) {
      setProgramsError(error.message || "Failed to load programs.");
    } finally {
      setLoadingPrograms(false);
    }
  };

  fetchPrograms();
}, []);

  
  useEffect(() => {
    setTimeSlots(generateTimeSlots)
  }, [generateTimeSlots])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  // Update end time when start time or practice type changes
  useEffect(() => {
    if (selectedPracticeType) {
      const newEndTime = new Date(startTime)
      newEndTime.setMinutes(newEndTime.getMinutes() + selectedPracticeType.duration)
      setEndTime(newEndTime)
    }
  }, [startTime, selectedPracticeType])

  const validateCurrentStep = () => {
    const errors: {[key: string]: string} = {}
    
    if (currentStep === 1) {
      if (!selectedFacility) {
        errors.facility = "Please select a facility"
      }
      
      // Check if the selected time range is valid
      if (endTime <= startTime) {
        errors.time = "End time must be after start time"
      }
      
      // Check if the selected date is in the past
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
        errors.date = "Cannot book practice in the past"
      }
    }
    
    if (currentStep === 2) {
      if (!selectedTeam) {
        errors.team = "Please select a team"
      }
      
      if (!selectedPracticeType) {
        errors.practiceType = "Please select a practice type"
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
  
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    const slotDate = new Date(slot.timestamp)
    setStartTime(slotDate)
    
    // If we have a practice type selected, set the end time based on duration
    if (selectedPracticeType) {
      const newEndTime = new Date(slotDate)
      newEndTime.setMinutes(newEndTime.getMinutes() + selectedPracticeType.duration)
      setEndTime(newEndTime)
    } else {
      // Default to 2 hours if no practice type selected
      const newEndTime = new Date(slotDate)
      newEndTime.setHours(newEndTime.getHours() + 2)
      setEndTime(newEndTime)
    }
  }
  
  const handleConfirmBooking = async () => {
  setIsSubmitting(true);

  try {
    // 🔐 Firebase → JWT exchange
    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) throw new Error("No user is logged in.");

    const firebaseToken = await firebaseUser.getIdToken(true);
    const jwtResponse = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firebaseToken}` },
      body: JSON.stringify({ email: firebaseUser.email }),
    });

    const jwt = jwtResponse.headers.get("authorization")?.replace("Bearer ", "");
    if (!jwt) throw new Error("Could not retrieve backend JWT");

    // 🧱 Payload construction helpers
    const getDayOfWeek = (date: Date) =>
      ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];

    const formatTime = (date: Date) => date.toTimeString().split(" ")[0]; // "HH:mm:ss"

    // 🎯 API request
    if (isRecurring) {
      const recurrenceStart = dayjs(startTime);
      const recurrenceEnd = recurrenceStart.add(recurringOptions.occurrences - 1, "week");

      const recurringPayload = {
        day: getDayOfWeek(startTime),
        event_start_at: formatTime(startTime),
        event_end_at: formatTime(endTime),
        location_id: selectedFacility?.id,
        program_id: selectedPracticeType?.id,
        team_id: selectedTeam?.id,
        recurrence_start_at: recurrenceStart.toISOString(),
        recurrence_end_at: recurrenceEnd.toISOString(),
      };

      await createRecurringPractice(recurringPayload, jwt);
    } else {
      const oneTimePayload = {
        start_at: startTime.toISOString(),
        end_at: endTime.toISOString(),
        location_id: selectedFacility?.id,
        program_id: selectedPracticeType?.id,
        team_id: selectedTeam?.id,
      };

      await createPractice(oneTimePayload, jwt);
    }

    // ✅ Success UX
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(false);
    setShowConfirmation(false);

    Alert.alert(
      "Practice Booked Successfully",
      `Your practice has been scheduled for ${date.toDateString()} at ${startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      [
        { text: "View Schedule", onPress: () => router.push("/(coach)/(tabs)/coachCalendar") },
        { text: "Done", onPress: () => router.back() },
      ]
    );
  } catch (error) {
    console.error("❌ Booking error:", error);
    setIsSubmitting(false);
    Alert.alert("Error", (error as Error).message || "Failed to book practice.");
  }
};
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
                  <TouchableOpacity 
                    style={[
                      styles.facilitySelector,
                      selectedFacility ? styles.selectedFacilitySelector : null,
                      formErrors.facility ? styles.errorInput : null
                    ]} 
                    onPress={() => setShowFacilityModal(true)}
                  >
                    <View style={styles.facilitySelectorContent}>
                      {selectedFacility ? (
                        <>
                          <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
                          <View style={styles.facilityInfo}>
                            <Text style={styles.facilityName}>{selectedFacility.name}</Text>
                            <Text style={styles.facilityType}>{selectedFacility.type}</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <MaterialIcons name="add-location-alt" size={24} color={COLORS.primary} />
                          <Text style={styles.facilityPlaceholder}>Select Facility</Text>
                        </>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                  
                  {formErrors.facility && (
                    <Text style={styles.errorText}>{formErrors.facility}</Text>
                  )}

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
                  
                  <View style={styles.timeSelectionContainer}>
                    <Text style={styles.timeSelectionTitle}>Available Time Slots</Text>
                    {timeSlots.length > 0 ? (
                      <TimeSlotSelector 
                        timeSlots={timeSlots} 
                        selectTimeSlot={handleTimeSlotSelect}
                        selectedTime={startTime.getTime()}
                      />
                    ) : (
                      <Text style={styles.noTimeSlotsText}>No available time slots for this date</Text>
                    )}
                  </View>
                  
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
                    teams={teams} 
                    selectedTeam={selectedTeam} 
                    setSelectedTeam={setSelectedTeam}
                    hasError={!!formErrors.team}
                    errorMessage={formErrors.team}
                  />
                  <PracticeTypeSelector
                    practiceTypes={practiceTypes}
                    selectedPracticeType={selectedPracticeType}
                    setSelectedPracticeType={setSelectedPracticeType}
                    hasError={!!formErrors.practiceType}
                    errorMessage={formErrors.practiceType}
                  />
                </>
              )}

              {/* Step 3: Equipment & Notes */}
              {currentStep === 3 && (
                <>
                  <TouchableOpacity style={styles.selectorButton} onPress={() => setShowEquipmentModal(true)}>
                    <Text style={styles.selectorButtonText}>
                      {selectedEquipment.length > 0
                        ? `Selected Equipment (${selectedEquipment.length})`
                        : "Select Equipment"}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
                  </TouchableOpacity>

                  <RecurringOptions
                    isRecurring={isRecurring}
                    setIsRecurring={setIsRecurring}
                    recurringOptions={recurringOptions}
                    setRecurringOptions={setRecurringOptions}
                  />

                  <NotesInput notes={notes} setNotes={setNotes} />
                </>
              )}

              {/* Equipment Selector Modal */}
              <EquipmentSelector
                selectedEquipment={selectedEquipment}
                setSelectedEquipment={setSelectedEquipment}
                showEquipmentModal={showEquipmentModal}
                setShowEquipmentModal={setShowEquipmentModal}
              />
              
              {/* Facility Selector Modal */}
              <FacilitySelector
                facilities={facilities}
                selectedFacility={selectedFacility}
                setSelectedFacility={setSelectedFacility}
                visible={showFacilityModal}
                onClose={() => setShowFacilityModal(false)}
              />
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
        practiceType={selectedPracticeType ? selectedPracticeType.name : undefined}
        facility={selectedFacility ? selectedFacility.name : undefined}
        equipment={selectedEquipment.map((eq) => eq.name)}
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
  facilitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardLight,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedFacilitySelector: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  facilitySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  facilityInfo: {
    marginLeft: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  facilityType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  facilityPlaceholder: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 12,
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

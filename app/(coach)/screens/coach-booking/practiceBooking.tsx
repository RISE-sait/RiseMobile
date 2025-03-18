import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import DateTimeSelector from "@/app/components/practiceBooking/DateTimeSelector";
import TimeSlotSelector from "@/app/components/practiceBooking/TimeSlotSelector";
import TeamSelector from "@/app/components/practiceBooking/TeamSelector";
import PracticeTypeSelector from "@/app/components/practiceBooking/PracticeTypeSelector";
import EquipmentSelector from "@/app/components/practiceBooking/EquipmentSelector";
import RecurringOptions from "@/app/components/practiceBooking/RecurringOptions";
import NotesInput from "@/app/components/practiceBooking/NotesInput";
import ConfirmationModal from "@/app/components/practiceBooking/ConfirmationModal";
import StepIndicator from "@/app/components/practiceBooking/StepIndicator";

const teams: Team[] = [
  { id: "1", name: "Varsity Team", players: 12, icon: "users" },
  { id: "2", name: "Junior Varsity", players: 10, icon: "users" },
  { id: "3", name: "Development Squad", players: 8, icon: "child" },
];

const practiceTypes: PracticeType[] = [
  { id: "1", name: "Full Team Practice", icon: "users", description: "Complete team training session" },
  { id: "2", name: "Shooting Drills", icon: "bullseye", description: "Focus on shooting technique and accuracy" },
  { id: "3", name: "Defense Training", icon: "shield-alt", description: "Defensive strategies and positioning" },
  { id: "4", name: "Conditioning", icon: "running", description: "Physical fitness and endurance training" },
  { id: "5", name: "Game Strategy", icon: "chess", description: "Playbook review and strategic planning" },
  { id: "6", name: "Individual Skills", icon: "user-graduate", description: "One-on-one skill development" },
];

const CoachPracticeBooking = () => {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Form State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 2)));
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPracticeType, setSelectedPracticeType] = useState<PracticeType | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<{ id: string; name: string }[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringOptions, setRecurringOptions] = useState<RecurringOptions>({
    weekly: true,
    biweekly: false,
    monthly: false,
    occurrences: 4,
  });
  const [notes, setNotes] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 6; // Start at 6 AM
    const endHour = 22; // End at 10 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour % 12 || 12}:${minute === 0 ? "00" : minute} ${hour < 12 ? "AM" : "PM"}`;
        const availability = Math.random() > 0.3 ? (Math.random() > 0.5 ? "high" : "medium") : "low";
        slots.push({ time, availability });
      }
    }

    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep < 3) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
    } else {
      router.back();
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
              {/* Step 1: Date & Time Selection */}
              {currentStep === 1 && (
                <>
                  <DateTimeSelector label="Date" date={date} setDate={setDate} showPicker={showDatePicker} setShowPicker={setShowDatePicker} mode="date" />
                  <DateTimeSelector label="Start Time" date={startTime} setDate={setStartTime} showPicker={showStartTimePicker} setShowPicker={setShowStartTimePicker} mode="time" />
                  <DateTimeSelector label="End Time" date={endTime} setDate={setEndTime} showPicker={showEndTimePicker} setShowPicker={setShowEndTimePicker} mode="time" />
                  <TimeSlotSelector timeSlots={timeSlots} selectTimeSlot={(time) => setStartTime(new Date())} />
                </>
              )}

              {/* Step 2: Team & Practice Type Selection */}
              {currentStep === 2 && (
                <>
                  <TeamSelector teams={teams} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
                  <PracticeTypeSelector practiceTypes={practiceTypes} selectedPracticeType={selectedPracticeType} setSelectedPracticeType={setSelectedPracticeType} />
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
        <TouchableOpacity style={[styles.footerButton, styles.nextButton]} onPress={handleNextStep}>
          <Text style={styles.nextButtonText}>{currentStep < 3 ? "Next" : "Review"}</Text>
          <Ionicons name={currentStep < 3 ? "arrow-forward" : "checkmark-circle"} size={20} color="#000" style={styles.nextButtonIcon} />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
  visible={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  onConfirm={() => console.log("Confirmed!")}
  date={date.toDateString()}
  startTime={startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
  endTime={endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
  team={selectedTeam ? selectedTeam.name : undefined}
  practiceType={selectedPracticeType ? selectedPracticeType.name : undefined}
  facility="Main Gym"
  equipment={selectedEquipment.map((eq) => eq.name)} // Map equipment array to string array
  notes={notes}
/>




    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.cardDark },
  backButtonArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0, 0, 0, 0.5)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginLeft: 16 },
  keyboardAvoidingContainer: { flex: 1 },
  scrollViewContent: { paddingBottom: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
  footer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: COLORS.cardDark },
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
});

export default CoachPracticeBooking;
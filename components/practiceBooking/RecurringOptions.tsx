import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface RecurringOptions {
  weekly: boolean;
  biweekly: boolean;
  monthly: boolean;
  occurrences: number;
}

interface RecurringOptionsProps {
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  recurringOptions?: RecurringOptions; // Optional to prevent crashes
  setRecurringOptions: (options: RecurringOptions) => void;
}

const RecurringOptions: React.FC<RecurringOptionsProps> = ({
  isRecurring,
  setIsRecurring,
  recurringOptions = { weekly: true, biweekly: false, monthly: false, occurrences: 4 },
  setRecurringOptions,
}) => {
  // Calculate the frequency text for display
  const getFrequencyText = () => {
    if (recurringOptions.weekly) return "weekly";
    if (recurringOptions.biweekly) return "every 2 weeks";
    if (recurringOptions.monthly) return "monthly";
    return "weekly";
  };

  return (
    <View style={styles.container}>
      {/* Header with Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.label}>Recurring Practice</Text>
          <Text style={styles.headerSubtext}>Automatically schedule multiple sessions</Text>
        </View>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: COLORS.cardDark, true: COLORS.primary + '40' }}
          thumbColor={isRecurring ? COLORS.primary : COLORS.textSecondary}
          ios_backgroundColor={COLORS.cardDark}
        />
      </View>

      {isRecurring && (
        <View style={styles.optionsContainer}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              This will create {recurringOptions.occurrences} practice sessions {getFrequencyText()} at the same time
            </Text>
          </View>

          {/* Repeat Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Repeat Every</Text>
            <View style={styles.frequencyButtons}>
              <TouchableOpacity
                style={[styles.frequencyOption, recurringOptions?.weekly && styles.frequencySelected]}
                onPress={() => setRecurringOptions({ ...recurringOptions, weekly: true, biweekly: false, monthly: false })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={recurringOptions?.weekly ? COLORS.background : COLORS.textSecondary}
                />
                <Text style={[styles.frequencyText, recurringOptions?.weekly && styles.frequencySelectedText]}>
                  Week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.frequencyOption, recurringOptions?.biweekly && styles.frequencySelected]}
                onPress={() => setRecurringOptions({ ...recurringOptions, weekly: false, biweekly: true, monthly: false })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={recurringOptions?.biweekly ? COLORS.background : COLORS.textSecondary}
                />
                <Text style={[styles.frequencyText, recurringOptions?.biweekly && styles.frequencySelectedText]}>
                  2 Weeks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.frequencyOption, recurringOptions?.monthly && styles.frequencySelected]}
                onPress={() => setRecurringOptions({ ...recurringOptions, weekly: false, biweekly: false, monthly: true })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={recurringOptions?.monthly ? COLORS.background : COLORS.textSecondary}
                />
                <Text style={[styles.frequencyText, recurringOptions?.monthly && styles.frequencySelectedText]}>
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Number of Occurrences */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Number of Sessions</Text>
            <View style={styles.occurrencesContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() =>
                  setRecurringOptions({
                    ...recurringOptions,
                    occurrences: Math.max(1, recurringOptions.occurrences - 1),
                  })
                }
                disabled={recurringOptions.occurrences <= 1}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove-circle"
                  size={32}
                  color={recurringOptions.occurrences <= 1 ? COLORS.cardDark : COLORS.primary}
                />
              </TouchableOpacity>

              <View style={styles.countDisplay}>
                <Text style={styles.countNumber}>{recurringOptions?.occurrences}</Text>
                <Text style={styles.countLabel}>sessions</Text>
              </View>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={() =>
                  setRecurringOptions({
                    ...recurringOptions,
                    occurrences: Math.min(12, recurringOptions.occurrences + 1),
                  })
                }
                disabled={recurringOptions.occurrences >= 12}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add-circle"
                  size={32}
                  color={recurringOptions.occurrences >= 12 ? COLORS.cardDark : COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.occurrenceHint}>Max 12 sessions per recurring schedule</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  optionsContainer: {
    marginTop: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 10,
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  frequencyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.cardDark,
    borderWidth: 2,
    borderColor: COLORS.cardDark,
  },
  frequencySelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  frequencyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginTop: 6,
  },
  frequencySelectedText: {
    color: COLORS.background,
    fontWeight: "bold",
  },
  occurrencesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardDark,
    borderRadius: 10,
    padding: 16,
  },
  counterButton: {
    padding: 4,
  },
  countDisplay: {
    alignItems: "center",
    marginHorizontal: 30,
    minWidth: 80,
  },
  countNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    lineHeight: 36,
  },
  countLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  occurrenceHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default RecurringOptions;

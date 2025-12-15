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
  // Calculate the frequency text for display (currently only weekly is supported)
  const getFrequencyText = () => {
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

          {/* Repeat Frequency - Currently only weekly is supported by the backend */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Repeat Every</Text>
            <View style={styles.frequencyButtons}>
              <TouchableOpacity
                style={[styles.frequencyOption, styles.frequencySelected]}
                activeOpacity={1}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={COLORS.background}
                />
                <Text style={[styles.frequencyText, styles.frequencySelectedText]}>
                  Week
                </Text>
              </TouchableOpacity>

              {/* Biweekly - Disabled (not supported by backend) */}
              <TouchableOpacity
                style={[styles.frequencyOption, styles.frequencyDisabled]}
                activeOpacity={1}
                disabled={true}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={COLORS.textSecondary + "50"}
                />
                <Text style={[styles.frequencyText, styles.frequencyDisabledText]}>
                  2 Weeks
                </Text>
                <Text style={styles.comingSoonBadge}>Soon</Text>
              </TouchableOpacity>

              {/* Monthly - Disabled (not supported by backend) */}
              <TouchableOpacity
                style={[styles.frequencyOption, styles.frequencyDisabled]}
                activeOpacity={1}
                disabled={true}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={COLORS.textSecondary + "50"}
                />
                <Text style={[styles.frequencyText, styles.frequencyDisabledText]}>
                  Month
                </Text>
                <Text style={styles.comingSoonBadge}>Soon</Text>
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
  frequencyDisabled: {
    backgroundColor: COLORS.cardDark + "50",
    borderColor: COLORS.cardDark + "50",
    opacity: 0.6,
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
  frequencyDisabledText: {
    color: COLORS.textSecondary + "80",
  },
  comingSoonBadge: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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

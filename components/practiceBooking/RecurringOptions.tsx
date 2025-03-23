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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Make this a recurring practice?</Text>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: COLORS.cardLight, true: COLORS.primary }}
          thumbColor={isRecurring ? COLORS.primaryDark : COLORS.textSecondary}
        />
      </View>

      {isRecurring && (
        <View style={styles.options}>
          <Text style={styles.subLabel}>Repeat Every:</Text>
          <View style={styles.frequency}>
            <TouchableOpacity
              style={[styles.option, recurringOptions?.weekly && styles.selected]}
              onPress={() => setRecurringOptions({ ...recurringOptions, weekly: true, biweekly: false, monthly: false })}
            >
              <Text style={[styles.optionText, recurringOptions?.weekly && styles.selectedText]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, recurringOptions?.biweekly && styles.selected]}
              onPress={() => setRecurringOptions({ ...recurringOptions, weekly: false, biweekly: true, monthly: false })}
            >
              <Text style={[styles.optionText, recurringOptions?.biweekly && styles.selectedText]}>2 Weeks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, recurringOptions?.monthly && styles.selected]}
              onPress={() => setRecurringOptions({ ...recurringOptions, weekly: false, biweekly: false, monthly: true })}
            >
              <Text style={[styles.optionText, recurringOptions?.monthly && styles.selectedText]}>Month</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subLabel}>Number of Occurrences:</Text>
          <View style={styles.occurrences}>
            <TouchableOpacity
              onPress={() =>
                setRecurringOptions(prev => ({
                  ...prev,
                  occurrences: Math.max(1, prev?.occurrences - 1),
                }))
              }
            >
              <Ionicons name="remove-circle" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.count}>{recurringOptions?.occurrences}</Text>
            <TouchableOpacity
              onPress={() =>
                setRecurringOptions(prev => ({
                  ...prev,
                  occurrences: Math.min(12, prev?.occurrences + 1),
                }))
              }
            >
              <Ionicons name="add-circle" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 8, padding: 16, marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 16, color: COLORS.text },
  subLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12 },
  frequency: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  option: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: COLORS.cardLight },
  selected: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary },
  optionText: { fontSize: 14, color: COLORS.text },
  selectedText: { color: COLORS.primary, fontWeight: "bold" },
  occurrences: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  count: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginHorizontal: 16 },
});

export default RecurringOptions;

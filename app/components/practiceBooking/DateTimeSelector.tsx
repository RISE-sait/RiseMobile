import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@/constants/colors";

interface DateTimeSelectorProps {
  label: string;
  date: Date;
  setDate: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  mode: "date" | "time";
}

const formatDate = (date: Date) => date.toDateString();
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ label, date, setDate, showPicker, setShowPicker, mode }) => {
  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{mode === "date" ? formatDate(date) : formatTime(date)}</Text>
        <Ionicons name={mode === "date" ? "calendar" : "time"} size={24} color={COLORS.primary} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24, marginTop: 12 },
  label: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 8 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  buttonText: { fontSize: 16, color: COLORS.text },
});

export default DateTimeSelector;

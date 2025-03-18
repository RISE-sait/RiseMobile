import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface TimeSlot {
  time: string;
  availability: "high" | "medium" | "low";
}

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectTimeSlot: (time: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ timeSlots, selectTimeSlot }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Time Slots</Text>
      <FlatList
        data={timeSlots.slice(0, 8)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.timeSlot, { backgroundColor: COLORS.cardLight }]}
            onPress={() => {
              console.log("Selected Time:", item.time);
              selectTimeSlot(item.time);
            }}
          >
            <Text style={styles.timeText}>{item.time}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.time}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 12 },
  list: { paddingVertical: 8 },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  timeText: { fontSize: 14, color: COLORS.text },
});

export default TimeSlotSelector;

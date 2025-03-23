import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface NotesInputProps {
  notes: string;
  setNotes: (text: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ notes, setNotes }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Practice Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Add any additional notes or instructions..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 12 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
});

export default NotesInput;

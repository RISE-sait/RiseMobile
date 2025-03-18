import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface PracticeType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PracticeTypeSelectorProps {
    practiceTypes: PracticeType[];
    selectedPracticeType: PracticeType | null;
    setSelectedPracticeType: (practiceType: PracticeType | null) => void; // Allow `null`
  }
  

const PracticeTypeSelector: React.FC<PracticeTypeSelectorProps> = ({ practiceTypes, selectedPracticeType, setSelectedPracticeType }) => {
  return (
    <View>
      <Text style={styles.title}>Practice Focus</Text>
      <FlatList
        data={practiceTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selectedPracticeType?.id === item.id && styles.selected]}
            onPress={() => setSelectedPracticeType(item)}
          >
            <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            {selectedPracticeType?.id === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 12 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 16, borderRadius: 8, marginBottom: 12 },
  selected: { borderWidth: 1, borderColor: COLORS.primary },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  description: { fontSize: 14, color: COLORS.textSecondary },
});

export default PracticeTypeSelector;

import React from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface Facility {
  id: string;
  name: string;
  type: string;
  icon: string;
  availability: "high" | "medium" | "low";
}

interface FacilitySelectorProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  setSelectedFacility: (facility: Facility) => void;
  visible: boolean;
  onClose: () => void;
}

const FacilitySelector: React.FC<FacilitySelectorProps> = ({ facilities, selectedFacility, setSelectedFacility, visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Facility</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={facilities}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.facilityItem, selectedFacility?.id === item.id && styles.selected]} onPress={() => { setSelectedFacility(item); onClose(); }}>
                <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} />
                <Text style={styles.facilityName}>{item.name}</Text>
                {selectedFacility?.id === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  facilityItem: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 16, borderRadius: 8, marginVertical: 8 },
  selected: { borderWidth: 1, borderColor: COLORS.primary },
  facilityName: { fontSize: 16, color: COLORS.text, marginLeft: 12, flex: 1 }
});

export default FacilitySelector;

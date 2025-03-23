import React from "react";
import { View, Modal, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface EquipmentItem {
  id: string;
  name: string;
}

interface EquipmentSelectorProps {
  selectedEquipment: EquipmentItem[];
  setSelectedEquipment: (equipment: EquipmentItem[]) => void;
  showEquipmentModal: boolean;
  setShowEquipmentModal: (show: boolean) => void;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  selectedEquipment,
  setSelectedEquipment,
  showEquipmentModal,
  setShowEquipmentModal,
}) => {
  const equipmentList: EquipmentItem[] = [
    { id: "1", name: "Basketballs" },
    { id: "2", name: "Cones" },
    { id: "3", name: "Agility Ladders" },
    { id: "4", name: "Resistance Bands" },
    { id: "5", name: "Shooting Machine" },
  ];

  // Toggle Selection Function
  const toggleEquipment = (equipment: EquipmentItem) => {
    if (selectedEquipment.some((item) => item.id === equipment.id)) {
      setSelectedEquipment(selectedEquipment.filter((item) => item.id !== equipment.id));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  return (
    <Modal
      visible={showEquipmentModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowEquipmentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Equipment</Text>
            <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={equipmentList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, selectedEquipment.some((eq) => eq.id === item.id) && styles.selectedItem]}
                onPress={() => toggleEquipment(item)}
              >
                <Text style={styles.itemText}>{item.name}</Text>
                {selectedEquipment.some((eq) => eq.id === item.id) && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          />

          {/* Close Modal Button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowEquipmentModal(false)}>
            <Text style={styles.closeButtonText}>Save Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark,
  },
  selectedItem: {
    backgroundColor: COLORS.primaryLight,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default EquipmentSelector;

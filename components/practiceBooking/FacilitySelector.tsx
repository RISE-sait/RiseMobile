import type React from "react"
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Image } from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"

// Update the Facility interface to match exactly with practiceBooking.tsx
interface Facility {
  id: string
  name: string
  type: string
  icon: string
  availability: string
  image: string // Changed from string | undefined to string to match practiceBooking.tsx
}

// Update the props interface to accept the setState function
interface FacilitySelectorProps {
  facilities: Facility[]
  selectedFacility: Facility | null
  setSelectedFacility: React.Dispatch<React.SetStateAction<Facility | null>> // Changed to match React's setState type
  visible: boolean
  onClose: () => void
}

const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  facilities,
  selectedFacility,
  setSelectedFacility,
  visible,
  onClose,
}) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "high":
        return "#4CAF50" // Green
      case "medium":
        return "#FFC107" // Amber
      case "low":
        return "#F44336" // Red
      default:
        return COLORS.textSecondary
    }
  }

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
              <TouchableOpacity
                style={[styles.facilityItem, selectedFacility?.id === item.id && styles.selected]}
                onPress={() => {
                  setSelectedFacility(item)
                  onClose()
                }}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.facilityImage} />
                ) : (
                  <View style={styles.facilityIconContainer}>
                    <FontAwesome5 name={item.icon} size={24} color={COLORS.primary} />
                  </View>
                )}

                <View style={styles.facilityDetails}>
                  <Text style={styles.facilityName}>{item.name}</Text>
                  <Text style={styles.facilityType}>{item.type}</Text>

                  <View style={styles.availabilityContainer}>
                    <View
                      style={[
                        styles.availabilityIndicator,
                        { backgroundColor: getAvailabilityColor(item.availability) },
                      ]}
                    />
                    <Text style={styles.availabilityText}>
                      {item.availability === "high"
                        ? "High Availability"
                        : item.availability === "medium"
                          ? "Medium Availability"
                          : "Low Availability"}
                    </Text>
                  </View>
                </View>

                {selectedFacility?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  facilityImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 16,
  },
  facilityIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  facilityDetails: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
})

export default FacilitySelector


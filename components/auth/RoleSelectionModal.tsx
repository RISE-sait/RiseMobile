import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Platform } from "react-native"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface RoleSelectionModalProps {
  visible: boolean
  onClose: () => void
  onSelectRole: (role: string) => void
  currentRole: string
}

export const RoleSelectionModal = ({ visible, onClose, onSelectRole, currentRole }: RoleSelectionModalProps) => {
  const handleRoleSelect = (role: string) => {
    onSelectRole(role)
    // Trigger haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Your Role</Text>

              <TouchableOpacity style={styles.roleOption} onPress={() => handleRoleSelect("athlete")}>
                <View style={styles.roleIconContainer}>
                  <FontAwesome5 name="basketball-ball" size={24} color="#FCA311" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Athlete</Text>
                  <Text style={styles.roleDescription}>Players looking to improve their game</Text>
                </View>
                {currentRole === "athlete" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FCA311" style={styles.checkIcon} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.roleOption} onPress={() => handleRoleSelect("coach")}>
                <View style={styles.roleIconContainer}>
                  <FontAwesome5 name="chalkboard-teacher" size={24} color="#FCA311" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Coach</Text>
                  <Text style={styles.roleDescription}>Team coaches and trainers</Text>
                </View>
                {currentRole === "coach" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FCA311" style={styles.checkIcon} />
                )}
              </TouchableOpacity>


              <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                <Text style={styles.closeModalButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 3,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  roleDescription: {
    fontSize: 12,
    color: "#9EA0A4",
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 10,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: "#FCA311",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeModalButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
})


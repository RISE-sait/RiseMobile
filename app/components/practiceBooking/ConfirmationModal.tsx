import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  date: string;
  startTime: string;
  endTime: string;
  team?: string;
  practiceType?: string;
  facility?: string;
  equipment?: string[];
  notes?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ visible, onClose, onConfirm, date, startTime, endTime, team, practiceType, facility, equipment, notes }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Booking</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.details}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.row}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.text}>{date}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text style={styles.text}>{startTime} - {endTime}</Text>
            </View>

            {team && (
              <>
                <Text style={styles.sectionTitle}>Team & Practice</Text>
                <View style={styles.row}>
                  <FontAwesome5 name="users" size={20} color={COLORS.primary} />
                  <Text style={styles.text}>{team}</Text>
                </View>
                {practiceType && (
                  <View style={styles.row}>
                    <FontAwesome5 name="chalkboard-teacher" size={20} color={COLORS.primary} />
                    <Text style={styles.text}>{practiceType}</Text>
                  </View>
                )}
              </>
            )}

            {facility && (
              <>
                <Text style={styles.sectionTitle}>Facility</Text>
                <View style={styles.row}>
                  <FontAwesome5 name="building" size={20} color={COLORS.primary} />
                  <Text style={styles.text}>{facility}</Text>
                </View>
              </>
            )}

            {equipment && equipment.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Equipment</Text>
                {equipment.map((item, index) => (
                  <View key={index} style={styles.row}>
                    <FontAwesome5 name="tools" size={20} color={COLORS.primary} />
                    <Text style={styles.text}>{item}</Text>
                  </View>
                ))}
              </>
            )}

            {notes && (
              <>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.text}>{notes}</Text>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
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
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.text,
    },
    details: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.text,
      marginTop: 12,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.cardLight,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
    },
    text: {
      fontSize: 14,
      color: COLORS.text,
      marginLeft: 10,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: COLORS.cardDark,
      borderRadius: 8,
      alignItems: "center",
      marginRight: 8,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.text,
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      alignItems: "center",
      marginLeft: 8,
    },
    confirmText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },
  });
  

export default ConfirmationModal;

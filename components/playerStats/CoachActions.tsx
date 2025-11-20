import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";

const CoachActions = ({ playerId }) => {
  const router = useRouter();

  return (
    <View style={styles.coachActionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Coach Actions</Text>
      </View>

      <View style={styles.coachActionsRow}>
        <TouchableOpacity
          style={styles.coachActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/screens/comingSoon");
          }}
        >
          <View style={styles.coachActionIcon}>
            <FontAwesome5 name="clipboard" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.coachActionText}>Add Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.coachActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/screens/comingSoon");
          }}
        >
          <View style={styles.coachActionIcon}>
            <FontAwesome5 name="dumbbell" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.coachActionText}>Training Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.coachActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/screens/comingSoon");
          }}
        >
          <View style={styles.coachActionIcon}>
            <Feather name="message-circle" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.coachActionText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  coachActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  coachActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coachActionButton: {
    width: "31%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  coachActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  coachActionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CoachActions;

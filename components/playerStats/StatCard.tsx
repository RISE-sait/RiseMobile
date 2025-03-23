import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <Text style={styles.statCardTitle}>{title}</Text>
      {icon && (
        <View style={[styles.statCardIcon, { backgroundColor: color + "20" }]}>
          <FontAwesome5 name={icon} size={14} color={color} />
        </View>
      )}
    </View>
    <Text style={[styles.statCardValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    width: "31%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statCardTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  statCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statCardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});

export default StatCard;

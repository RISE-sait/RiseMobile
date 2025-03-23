import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

const StrengthsWeaknesses = ({ strengths, weaknesses }) => (
  <View style={styles.container}>
    <View style={styles.section}>
      <View style={styles.header}>
        <FontAwesome5 name="check-circle" size={14} color={COLORS.success} />
        <Text style={styles.title}>Strengths</Text>
      </View>
      {strengths.map((item, index) => (
        <Text key={index} style={styles.text}>• {item}</Text>
      ))}
    </View>

    <View style={styles.section}>
      <View style={styles.header}>
        <FontAwesome5 name="exclamation-circle" size={14} color={COLORS.danger} />
        <Text style={styles.title}>Areas to Improve</Text>
      </View>
      {weaknesses.map((item, index) => (
        <Text key={index} style={styles.text}>• {item}</Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 24 },
  section: { width: "48%", backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  text: { color: COLORS.text, fontSize: 14, marginBottom: 4 },
});

export default StrengthsWeaknesses;

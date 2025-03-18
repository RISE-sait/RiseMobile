import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";

const ContractInfo = ({ contract }) => {
  if (!contract) return null;

  const contractProgress = `${((new Date().getFullYear() - parseInt(contract.signed.split('-')[0])) / contract.years) * 100}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contract Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Contract Length</Text>
          <Text style={styles.value}>{contract.years} years</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total Value</Text>
          <Text style={styles.value}>${contract.amount.toFixed(1)}M</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Signed</Text>
          <Text style={styles.value}>{contract.signed}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Expires</Text>
          <Text style={styles.value}>{contract.expires}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Contract Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: contractProgress }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 24 },
  header: { marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 16, fontWeight: "bold" },
  progressContainer: { marginTop: 16 },
  progressLabel: { color: COLORS.text, fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 4 },
});

export default ContractInfo;

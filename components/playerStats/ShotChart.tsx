import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

const ShotChart = ({ shotChartData }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Shooting Efficiency</Text>
      <Text style={styles.subtitle}>By Zone (%)</Text>
    </View>

    <BarChart
      data={shotChartData}
      width={width - 40}
      height={220}
      chartConfig={{
        backgroundColor: COLORS.card,
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 16 },
        barPercentage: 0.7,
      }}
      style={styles.chart}
      fromZero
      showValuesOnTopOfBars
    />
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  subtitle: { color: COLORS.textSecondary, fontSize: 14 },
  chart: { borderRadius: 16, paddingVertical: 8, paddingRight: 16 },
});

export default ShotChart;

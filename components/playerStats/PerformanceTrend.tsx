import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

const PerformanceTrend = ({ performanceTrendData }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Scoring Trend</Text>
      <Text style={styles.subtitle}>Last 5 Games</Text>
    </View>

    <LineChart
      data={performanceTrendData}
      width={width - 40}
      height={220}
      chartConfig={{
        backgroundColor: COLORS.card,
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: COLORS.primary,
        },
      }}
      bezier
      style={styles.chart}
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

export default PerformanceTrend;

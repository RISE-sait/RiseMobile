import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { COLORS } from "../../../constants/colors";

const { width } = Dimensions.get("window");

const ComparisonChart = ({ comparisonData }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Player vs. League Average</Text>
    </View>

    <BarChart
      data={{
        labels: comparisonData.labels,
        datasets: [
          { data: comparisonData.data[0] }, // Player stats
          { data: comparisonData.data[1] }, // League average
        ],
      }}
      width={width - 40}
      height={220}
      chartConfig={{
        backgroundColor: COLORS.card,
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        decimalPlaces: 1,
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
  chart: { borderRadius: 16, paddingVertical: 8, paddingRight: 16 },
});

export default ComparisonChart;

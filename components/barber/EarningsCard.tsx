import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface EarningsCardProps {
  title: string
  amount: number
  period: string
  trend?: {
    percentage: number
    isPositive: boolean
  }
}

const EarningsCard: React.FC<EarningsCardProps> = ({ title, amount, period, trend }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>${amount.toFixed(2)}</Text>
      <Text style={styles.period}>{period}</Text>

      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isPositive ? "arrow-up" : "arrow-down"}
            size={16}
            color={trend.isPositive ? "#4CAF50" : "#FF4D4F"}
          />
          <Text style={[styles.trendText, { color: trend.isPositive ? "#4CAF50" : "#FF4D4F" }]}>
            {trend.percentage}% from last {period.toLowerCase()}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  period: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 14,
    marginLeft: 4,
  },
})

export default EarningsCard


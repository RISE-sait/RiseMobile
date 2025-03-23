"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import BackButton from "@/components/BackButton"
import * as Haptics from "expo-haptics"

import DateRangePicker from "@/components/barber/DateRangePicker"
import AnimatedStatsCard from "@/components/barber/AnimatedStatsCard"
import AnimatedTransactionItem from "@/components/barber/AnimatedTransactionItem"
import AnimatedChart from "@/components/barber/AnimatedChart"
import GradientBackground from "@/components/barber/GradientBackground"

// Mock data
const mockEarningsData = {
  daily: {
    amount: 175,
    period: "Today",
    trend: {
      percentage: 15,
      isPositive: true,
    },
  },
  weekly: {
    amount: 1250,
    period: "This Week",
    trend: {
      percentage: 8,
      isPositive: true,
    },
  },
  monthly: {
    amount: 4800,
    period: "This Month",
    trend: {
      percentage: 5,
      isPositive: false,
    },
  },
}

const mockTransactions = [
  {
    id: "1",
    type: "payment",
    amount: 25,
    date: "Today, 2:30 PM",
    description: "Fade Haircut - Michael Johnson",
  },
  {
    id: "2",
    type: "payment",
    amount: 35,
    date: "Today, 11:45 AM",
    description: "Fade & Beard - James Wilson",
  },
  {
    id: "3",
    type: "fee",
    amount: 6,
    date: "Today, 11:45 AM",
    description: "Platform Fee",
  },
  {
    id: "4",
    type: "payout",
    amount: 450,
    date: "Yesterday, 5:00 PM",
    description: "Weekly Payout",
  },
  {
    id: "5",
    type: "payment",
    amount: 25,
    date: "Yesterday, 3:15 PM",
    description: "Kids Haircut - Kevin Durant",
  },
  {
    id: "6",
    type: "refund",
    amount: 15,
    date: "May 12, 2023",
    description: "Refund - Lineup",
  },
]

const mockChartData = {
  weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [150, 200, 175, 225, 175, 250, 175],
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  },
  monthly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [850, 1200, 950, 1100],
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  },
}

export default function EarningsScreen() {
  const [dateRange, setDateRange] = useState({
    startDate: "2023-05-01",
    endDate: "2023-05-31",
  })
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }, [])

  const handleTransactionPress = (id: string) => {
    // Handle transaction press
    console.log(`Transaction pressed: ${id}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" colors={["#FFD700"]} />
            }
          >
            <DateRangePicker range={dateRange} onRangeChange={setDateRange} />

            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <AnimatedStatsCard
                  title="Daily Earnings"
                  value={mockEarningsData.daily.amount}
                  icon="sack-dollar"
                  trend={mockEarningsData.daily.trend}
                  index={0}
                />

                <AnimatedStatsCard
                  title="Weekly Earnings"
                  value={mockEarningsData.weekly.amount}
                  icon="calendar-week"
                  trend={mockEarningsData.weekly.trend}
                  index={1}
                />
              </View>

              <AnimatedStatsCard
                title="Monthly Earnings"
                value={mockEarningsData.monthly.amount}
                icon="chart-line"
                trend={mockEarningsData.monthly.trend}
                index={2}
                actionText="View Details"
              />
            </View>

            <AnimatedChart type="line" title="Weekly Earnings" data={mockChartData.weekly} yAxisPrefix="$" index={0} />

            <AnimatedChart
              type="bar"
              title="Monthly Breakdown"
              data={mockChartData.monthly}
              yAxisPrefix="$"
              index={1}
            />

            <View style={styles.transactionsContainer}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>

              {mockTransactions.map((transaction, index) => (
                <AnimatedTransactionItem
                  key={transaction.id}
                  type={transaction.type as any}
                  amount={transaction.amount}
                  date={transaction.date}
                  description={transaction.description}
                  index={index}
                  onPress={() => handleTransactionPress(transaction.id)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </GradientBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  transactionsContainer: {
    marginBottom: 40,
  },
})


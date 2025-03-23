import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart, BarChart } from "react-native-chart-kit"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

type ChartType = "line" | "bar"

interface AnimatedChartProps {
  type: ChartType
  title: string
  data: {
    labels: string[]
    datasets: {
      data: number[]
      color?: (opacity: number) => string
      strokeWidth?: number
    }[]
  }
  height?: number
  width?: number
  yAxisSuffix?: string
  yAxisPrefix?: string
  formatYLabel?: (value: string) => string
  formatXLabel?: (value: string) => string
  index?: number
}

const { width } = Dimensions.get("window")

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  type,
  title,
  data,
  height = 220,
  width: propWidth = width - 40,
  yAxisSuffix = "",
  yAxisPrefix = "",
  formatYLabel,
  formatXLabel,
  index = 0,
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)
  const scale = useSharedValue(0.95)

  useEffect(() => {
    // Staggered animation for charts
    opacity.value = withDelay(300 + index * 200, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }))

    translateY.value = withDelay(300 + index * 200, withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }))

    scale.value = withDelay(300 + index * 200, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }
  })

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "#1A1A1A",
    backgroundGradientTo: "#252525",
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#FFD700",
    },
    propsForBackgroundLines: {
      stroke: "rgba(255, 255, 255, 0.1)",
      strokeDasharray: "5, 5",
    },
    formatYLabel: formatYLabel || ((value) => value),
    formatXLabel: formatXLabel || ((value) => value),
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.chartContainer}>
        <LinearGradient
          colors={["#1A1A1A", "#252525"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {type === "line" ? (
            <LineChart
              data={data}
              width={propWidth - 32}
              height={height}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix={yAxisSuffix}
              yAxisPrefix={yAxisPrefix}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          ) : (
            <BarChart
              data={data}
              width={propWidth - 32}
              height={height}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisSuffix={yAxisSuffix}
              yAxisPrefix={yAxisPrefix}
              showValuesOnTopOfBars
              withInnerLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
})

export default AnimatedChart


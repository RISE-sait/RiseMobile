import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

interface AnimatedStatsCardProps {
  title: string
  value: string | number
  icon: string
  iconColor?: string
  actionText?: string
  onPress?: () => void
  index?: number
  trend?: {
    percentage: number
    isPositive: boolean
  }
}

const { width } = Dimensions.get("window")

const AnimatedStatsCard: React.FC<AnimatedStatsCardProps> = ({
  title,
  value,
  icon,
  iconColor = "#FFD700",
  actionText,
  onPress,
  index = 0,
  trend,
}) => {
  const router = useRouter()
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)
  const scale = useSharedValue(0.95)
  const valueScale = useSharedValue(1)

  useEffect(() => {
    // Staggered animation for cards
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }))

    translateY.value = withDelay(index * 100, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }))

    scale.value = withDelay(index * 100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }
  })

  const valueAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: valueScale.value }],
    }
  })

  const handlePress = () => {
    // Animate value on press
    valueScale.value = withSequence(
      withTiming(1.1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
    )

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (onPress) {
      onPress()
    }
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity style={styles.touchable} onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={["#1A1A1A", "#252525"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
              <FontAwesome6 name={icon as any} size={16} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Animated.Text style={[styles.value, valueAnimatedStyle]}>
            {typeof value === "number" && value.toString().includes(".")
              ? `$${value.toFixed(2)}`
              : typeof value === "number"
                ? `$${value}`
                : value}
          </Animated.Text>

          {trend && (
            <View style={styles.trendContainer}>
              <FontAwesome6
                name={trend.isPositive ? "arrow-trend-up" : "arrow-trend-down"}
                size={12}
                color={trend.isPositive ? "#4CAF50" : "#FF4D4F"}
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color: trend.isPositive ? "#4CAF50" : "#FF4D4F",
                  },
                ]}
              >
                {trend.percentage}%
              </Text>
            </View>
          )}

          {actionText && onPress && (
            <View style={styles.actionContainer}>
              <Text style={styles.actionText}>{actionText}</Text>
              <FontAwesome6 name="chevron-right" size={10} color="#FFD700" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  touchable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  actionText: {
    color: "#FFD700",
    fontSize: 12,
    marginRight: 4,
  },
})

export default AnimatedStatsCard


import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

type TransactionType = "payment" | "payout" | "fee" | "refund"

interface AnimatedTransactionItemProps {
  type: TransactionType
  amount: number
  date: string
  description: string
  index?: number
  onPress?: () => void
}

const AnimatedTransactionItem: React.FC<AnimatedTransactionItemProps> = ({
  type,
  amount,
  date,
  description,
  index = 0,
  onPress,
}) => {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(20)

  useEffect(() => {
    // Staggered animation for list items
    opacity.value = withDelay(100 + index * 50, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }))

    translateX.value = withDelay(100 + index * 50, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    }
  })

  const getTypeIcon = () => {
    switch (type) {
      case "payment":
        return { name: "money-bill-wave", color: "#4CAF50", background: "rgba(76, 175, 80, 0.1)" }
      case "payout":
        return { name: "credit-card", color: "#2196F3", background: "rgba(33, 150, 243, 0.1)" }
      case "fee":
        return { name: "circle-minus", color: "#FF9800", background: "rgba(255, 152, 0, 0.1)" }
      case "refund":
        return { name: "rotate-left", color: "#FF4D4F", background: "rgba(255, 77, 79, 0.1)" }
      default:
        return { name: "ellipsis", color: "#999", background: "rgba(153, 153, 153, 0.1)" }
    }
  }

  const icon = getTypeIcon()
  const isNegative = type === "fee" || type === "refund"

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onPress) onPress()
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity style={styles.touchable} onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.iconContainer, { backgroundColor: icon.background }]}>
          <FontAwesome6 name={icon.name} size={18} color={icon.color} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, isNegative && styles.negativeAmount]}>
            {isNegative ? "-" : "+"} ${Math.abs(amount).toFixed(2)}
          </Text>
          <FontAwesome6 name="chevron-right" size={12} color="#666" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  date: {
    color: "#999",
    fontSize: 13,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  negativeAmount: {
    color: "#FF4D4F",
  },
  chevron: {
    marginLeft: 8,
  },
})

export default AnimatedTransactionItem


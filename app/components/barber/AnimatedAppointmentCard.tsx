import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"

interface AnimatedAppointmentCardProps {
  id: string
  clientName: string
  service: string
  time: string
  duration: number
  price: number
  status: AppointmentStatus
  index?: number
}

const AnimatedAppointmentCard: React.FC<AnimatedAppointmentCardProps> = ({
  id,
  clientName,
  service,
  time,
  duration,
  price,
  status,
  index = 0,
}) => {
  const router = useRouter()
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)
  const scale = useSharedValue(0.95)

  useEffect(() => {
    // Staggered animation for cards
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }))

    translateY.value = withDelay(index * 100, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }))

    scale.value = withDelay(index * 100, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }
  })

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "#FFD700"
      case "pending":
        return "#3498db"
      case "completed":
        return "#2ecc71"
      case "cancelled":
        return "#e74c3c"
      default:
        return "#FFD700"
    }
  }

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "pending":
        return "Pending"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Confirmed"
    }
  }

  const statusColor = getStatusColor(status)
  const statusText = getStatusText(status)

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Navigate to appointment details
    router.push(`/screens/appointment-details/${id}`)
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
          <View style={styles.content}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName} numberOfLines={1}>
                {clientName}
              </Text>
              <Text style={styles.service} numberOfLines={1}>
                {service}
              </Text>
              <View style={styles.timeContainer}>
                <FontAwesome6 name="clock" size={12} color="#999" />
                <Text style={styles.time}>
                  {time} • {duration} min
                </Text>
              </View>
            </View>

            <View style={styles.priceInfo}>
              <Text style={styles.price}>${price}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  touchable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  service: {
    color: "#FFD700",
    fontSize: 15,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    color: "#999",
    fontSize: 13,
    marginLeft: 6,
  },
  priceInfo: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  price: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
})

export default AnimatedAppointmentCard


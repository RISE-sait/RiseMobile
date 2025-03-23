import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

interface AnimatedServiceCardProps {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  index?: number
}

const AnimatedServiceCard: React.FC<AnimatedServiceCardProps> = ({
  id,
  name,
  description,
  price,
  duration,
  isActive,
  onToggle,
  onEdit,
  index = 0,
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)
  const scale = useSharedValue(0.95)

  useEffect(() => {
    // Staggered animation for cards
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }))

    translateY.value = withDelay(index * 80, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }))

    scale.value = withDelay(index * 80, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }
  })

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggle(id)
  }

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onEdit(id)
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, !isActive && styles.inactiveContainer]}>
      <LinearGradient
        colors={isActive ? ["#1A1A1A", "#252525"] : ["#1A1A1A", "#1A1A1A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.serviceInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>

            <View style={styles.metaContainer}>
              <View style={styles.metaBadge}>
                <FontAwesome6 name="dollar-sign" size={10} color="#FFD700" />
                <Text style={styles.metaText}>{price}</Text>
              </View>

              <View style={styles.metaBadge}>
                <FontAwesome6 name="clock" size={10} color="#FFD700" />
                <Text style={styles.metaText}>{duration} min</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Switch
              trackColor={{ false: "#333", true: "#FFD700" }}
              thumbColor={isActive ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#333"
              onValueChange={handleToggle}
              value={isActive}
            />

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <FontAwesome6 name="pen" size={14} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  metaText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  actions: {
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
})

export default AnimatedServiceCard


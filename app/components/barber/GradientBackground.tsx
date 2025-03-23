import React, { type ReactNode } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated"

interface GradientBackgroundProps {
  children: ReactNode
  intensity?: "low" | "medium" | "high"
}

const { width, height } = Dimensions.get("window")

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, intensity = "medium" }) => {
  // Animation for the gradient orbs
  const translateY1 = useSharedValue(0)
  const translateY2 = useSharedValue(0)
  const translateX1 = useSharedValue(0)
  const translateX2 = useSharedValue(0)

  // Set intensity values
  const getIntensityValue = () => {
    switch (intensity) {
      case "low":
        return 0.15
      case "high":
        return 0.35
      default:
        return 0.25
    }
  }

  const opacityValue = getIntensityValue()

  // Start animations
  React.useEffect(() => {
    translateY1.value = withRepeat(withTiming(-50, { duration: 15000, easing: Easing.inOut(Easing.ease) }), -1, true)
    translateY2.value = withRepeat(withTiming(50, { duration: 20000, easing: Easing.inOut(Easing.ease) }), -1, true)
    translateX1.value = withRepeat(withTiming(30, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, true)
    translateX2.value = withRepeat(withTiming(-30, { duration: 22000, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [])

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY1.value }, { translateX: translateX1.value }],
    }
  })

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY2.value }, { translateX: translateX2.value }],
    }
  })

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient colors={["#0C0B0B", "#121212", "#0C0B0B"]} style={styles.background} />

      {/* Animated gradient orbs */}
      <Animated.View style={[styles.gradientOrb1, animatedStyle1]}>
        <LinearGradient
          colors={["rgba(255, 215, 0, 0)", `rgba(255, 215, 0, ${opacityValue})`]}
          style={styles.orb}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        />
      </Animated.View>

      <Animated.View style={[styles.gradientOrb2, animatedStyle2]}>
        <LinearGradient
          colors={["rgba(255, 140, 0, 0)", `rgba(255, 140, 0, ${opacityValue})`]}
          style={styles.orb}
          start={{ x: 0.9, y: 0.1 }}
          end={{ x: 0.1, y: 0.9 }}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    width: width,
    height: height,
  },
  gradientOrb1: {
    position: "absolute",
    top: -100,
    right: -100,
    opacity: 0.8,
  },
  gradientOrb2: {
    position: "absolute",
    bottom: -150,
    left: -100,
    opacity: 0.8,
  },
  orb: {
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
})

export default GradientBackground


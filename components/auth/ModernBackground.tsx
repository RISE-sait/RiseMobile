import { useEffect } from "react"
import { View, StyleSheet, Dimensions, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

interface ModernBackgroundProps {
  animationEnabled?: boolean
}

export const ModernBackground = ({ animationEnabled = true }: ModernBackgroundProps) => {
  // Animation values
  const circle1Opacity = new Animated.Value(0)
  const circle2Opacity = new Animated.Value(0)
  const circle3Opacity = new Animated.Value(0)

  const circle1Scale = new Animated.Value(0.8)
  const circle2Scale = new Animated.Value(0.8)
  const circle3Scale = new Animated.Value(0.8)

  useEffect(() => {
    if (animationEnabled) {
      // Animate circles
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(circle1Opacity, {
            toValue: 0.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1Scale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(circle2Opacity, {
            toValue: 0.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circle2Scale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(circle3Opacity, {
            toValue: 0.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circle3Scale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    } else {
      // Set static values if animation is disabled
      circle1Opacity.setValue(0.1)
      circle2Opacity.setValue(0.1)
      circle3Opacity.setValue(0.1)
      circle1Scale.setValue(1)
      circle2Scale.setValue(1)
      circle3Scale.setValue(1)
    }
  }, [animationEnabled])

  return (
    <View style={styles.container}>
      {/* Gradient overlay */}
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]} style={styles.gradient} />

      {/* Animated circles */}
      <Animated.View
        style={[
          styles.circle,
          styles.circle1,
          {
            opacity: circle1Opacity,
            transform: [{ scale: circle1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.circle2,
          {
            opacity: circle2Opacity,
            transform: [{ scale: circle2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.circle3,
          {
            opacity: circle3Opacity,
            transform: [{ scale: circle3Scale }],
          },
        ]}
      />

      {/* Subtle pattern overlay */}
      <View style={styles.pattern}>
        <View style={styles.diagonalLine} />
        <View style={[styles.diagonalLine, { top: height * 0.3 }]} />
        <View style={[styles.diagonalLine, { top: height * 0.6 }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.3,
    right: -width * 0.3,
  },
  circle3: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.4,
    left: -width * 0.2,
  },
  pattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.05,
  },
  diagonalLine: {
    position: "absolute",
    width: width * 2,
    height: 1,
    backgroundColor: "#FFD700",
    transform: [{ rotate: "-30deg" }],
    left: -width * 0.5,
  },
})


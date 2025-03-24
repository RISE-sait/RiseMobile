import type React from "react"
import { useEffect, useState } from "react"
import { View, Image, StyleSheet } from "react-native"
import { isTablet } from "@/utils/device-info"

interface CustomSplashScreenProps {
  onFinish: () => void
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onFinish, 500) // Wait for fade out animation
    }, 2000)

    return () => clearTimeout(timer)
  }, [onFinish])

  // Choose the appropriate splash image based on device type
  const splashImage = isTablet()
    ? require("../../assets/images/riseSplashTablet.png")
    : require("../../assets/images/riseSplash.png")

  return (
    <View style={[styles.container, fadeOut && styles.fadeOut]}>
      <Image source={splashImage} style={styles.image} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  image: {
    width: "80%",
    height: "30%",
  },
})

export default CustomSplashScreen


"use client"

import { useRef } from "react"
import { Image, StyleSheet, Animated, Dimensions } from "react-native"
import images from "@/constants/images"

const { width } = Dimensions.get("window")

interface SignupLogoProps {
  fadeAnim: Animated.Value
}

export const SignupLogo = ({ fadeAnim }: SignupLogoProps) => {
  const logoSize = useRef(new Animated.Value(1)).current

  return (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          transform: [{ scale: logoSize }],
        },
      ]}
    >
      <Image source={images.onboarding} style={styles.logo} resizeMode="contain" />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: width * 0.5,
    height: 80,
  },
})


import { useRef, useEffect } from "react"
import { Animated, Image, StyleSheet, Dimensions } from "react-native"
import images from "@/constants/images"

const { width } = Dimensions.get("window")

interface AnimatedLogoProps {
  fadeAnim: Animated.Value
}

export const AnimatedLogo = ({ fadeAnim }: AnimatedLogoProps) => {
  const logoSize = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoSize, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoSize, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

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
    marginTop: 50,
    marginBottom: 60,
  },
  logo: {
    width: width * 0.8,
    height: 220,
    resizeMode: "contain",
  },
})


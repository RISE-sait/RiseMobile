import { useRef, useEffect } from "react"
import { Animated } from "react-native"

export const useSignupAnimations = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const successAnim = useRef(new Animated.Value(0)).current
  const checkmarkScale = useRef(new Animated.Value(0)).current
  const logoSize = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animate elements when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoSize, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoSize, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [])

  // Animation for success screen
  const animateSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return {
    fadeAnim,
    slideAnim,
    successAnim,
    checkmarkScale,
    logoSize,
    animateSuccess,
  }
}


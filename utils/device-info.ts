import { Dimensions, Platform } from "react-native"

export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get("window")
  const aspectRatio = height / width

  // iOS detection
  if (Platform.OS === "ios") {
    return Platform.isPad
  }

  // Android detection based on screen size
  // Tablets typically have aspect ratios closer to 1.6 or lower
  return aspectRatio <= 1.6
}


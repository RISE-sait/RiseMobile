import type React from "react"
import { ActivityIndicator, View, Text } from "react-native"

interface LoadingIndicatorProps {
  size?: "small" | "large"
  color?: string
  message?: string
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = "large", color = "#FCA311", message }) => {
  return (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {message && <Text className="text-gray-400 mt-2">{message}</Text>}
    </View>
  )
}

export default LoadingIndicator


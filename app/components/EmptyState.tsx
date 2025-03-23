import type React from "react"
import { View, Text } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  iconSize?: number
  iconColor?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, iconSize = 48, iconColor = "#666" }) => {
  return (
    <View className="bg-[#1A1A1A] rounded-xl p-6 items-center">
      <FontAwesome6 name={icon as any} size={iconSize} color={iconColor} />
      <Text className="text-white text-lg mt-2">{title}</Text>
      <Text className="text-gray-400 text-center mt-1">{message}</Text>
    </View>
  )
}

export default EmptyState


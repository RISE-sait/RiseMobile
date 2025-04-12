import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { MotiView } from "moti"

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  iconSize?: number
  iconColor?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  iconSize = 48,
  iconColor = "#666",
  actionLabel,
  onAction,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="bg-[#1A1A1A] rounded-xl p-6 items-center max-w-[90%]"
    >
      <View className="bg-[#2A2A2A] p-4 rounded-full mb-3">
        <FontAwesome6 name={icon as any} size={iconSize} color={iconColor} />
      </View>
      <Text className="text-white-100 text-lg font-semibold mb-1">{title}</Text>
      <Text className="text-gray-400 text-center mb-4">{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-gold-100 px-4 py-2 rounded-lg mt-2"
          activeOpacity={0.8}
        >
          <Text className="text-black font-semibold text-sm">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  )
}

export default EmptyState

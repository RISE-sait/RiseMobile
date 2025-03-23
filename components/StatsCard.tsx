import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  iconColor?: string
  actionText?: string
  onPress?: () => void
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, iconColor = "#FCA311", actionText, onPress }) => {
  return (
    <View className="bg-[#1A1A1A] rounded-xl p-4 flex-1">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-black items-center justify-center mr-2">
          <FontAwesome6 name={icon as any} size={16} color={iconColor} />
        </View>
        <Text className="text-gray-400 text-sm">{title}</Text>
      </View>
      <Text className="text-gold-100 text-2xl font-bold">{value}</Text>
      {actionText && onPress && (
        <TouchableOpacity className="flex-row items-center mt-2" onPress={onPress}>
          <Text className="text-white text-xs">{actionText}</Text>
          <FontAwesome6 name="chevron-right" size={10} color="#666" className="ml-1" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default StatsCard


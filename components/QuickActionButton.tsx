import type React from "react"
import { TouchableOpacity, Text, View } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"

interface QuickActionButtonProps {
  icon: string
  label: string
  onPress: () => void
  iconColor?: string
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onPress, iconColor = "#FCA311" }) => {
  return (
    <TouchableOpacity className="bg-[#1A1A1A] rounded-xl p-4 items-center flex-1" onPress={onPress}>
      <View className="w-10 h-10 rounded-full bg-black items-center justify-center mb-2">
        <FontAwesome6 name={icon as any} size={20} color={iconColor} />
      </View>
      <Text className="text-white text-center">{label}</Text>
    </TouchableOpacity>
  )
}

export default QuickActionButton


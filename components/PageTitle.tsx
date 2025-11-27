import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface PageTitleProps {
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  onButtonPress?: () => void
  showRefreshIcon?: boolean
  isRefreshing?: boolean
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, align = "left", onButtonPress, showRefreshIcon = false, isRefreshing = false }) => (
  <View className="px-5 pb-3 border-b border-white-100/10 flex-row items-center justify-between">
    <Text className="text-white-100 text-3xl font-extrabold">{title}</Text>
    {showRefreshIcon && onButtonPress ? (
      <TouchableOpacity onPress={onButtonPress} disabled={isRefreshing} activeOpacity={0.7}>
        <Ionicons
          name="refresh"
          size={24}
          color={isRefreshing ? "#AAAAAA" : "#FFD700"}
        />
      </TouchableOpacity>
    ) : subtitle && (
      <TouchableOpacity onPress={onButtonPress} disabled={!onButtonPress} activeOpacity={onButtonPress ? 0.7 : 1}>
        <Text className={`text-gray-400 text-base ${onButtonPress ? "underline" : ""}`}>{subtitle}</Text>
      </TouchableOpacity>
    )}
  </View>
)

export default PageTitle


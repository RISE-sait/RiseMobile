import type React from "react"
import { View, Text } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

interface EventListContainerProps {
  date: string
  children: React.ReactNode
}

const EventListContainer: React.FC<EventListContainerProps> = ({ date, children }) => {
  return (
    <View className="flex-1">
      <LinearGradient colors={["#1A1A1A", "#121212"]} className="flex-1 rounded-t-3xl overflow-hidden shadow-lg">
        {/* Date header */}
        <View className="px-5 pt-5 pb-3 border-b border-gray-800">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center mr-3">
              <FontAwesome6 name="calendar-day" size={16} color="#FCA311" />
            </View>
            <Text className="text-[#FCA311] text-lg font-bold">{date}</Text>
          </View>
        </View>

        {/* Content area */}
        <View className="flex-1 p-5">{children}</View>

        {/* Legend */}
        <View className="flex-row justify-center items-center pb-4 pt-2 px-5 border-t border-gray-800">
          <View className="flex-row items-center mr-4">
            <View className="w-3 h-3 rounded-full bg-[#FCA311] mr-2" />
            <Text className="text-gray-400 text-xs">Matches</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#4ade80] mr-2" />
            <Text className="text-gray-400 text-xs">Events</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

export default EventListContainer


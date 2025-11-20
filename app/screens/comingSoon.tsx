import React from "react"
import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { router } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"

const ComingSoonScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]" edges={["top", "left", "right"]}>
      <StatusBar translucent style="light" />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white-100/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={20} color="#FCA311" />
        </TouchableOpacity>
        <Text className="text-white-100 text-xl font-bold">Coming Soon</Text>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-gold-100/20 rounded-full w-24 h-24 items-center justify-center mb-6">
          <FontAwesome6 name="rocket" size={48} color="#FCA311" />
        </View>

        <Text className="text-white-100 text-2xl font-bold text-center mb-3">
          Coming Soon
        </Text>

        <Text className="text-gray-200 text-base text-center mb-8">
          We're working hard to bring you this feature. Stay tuned for updates!
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gold-100 px-8 py-3 rounded-lg"
        >
          <Text className="text-black font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ComingSoonScreen

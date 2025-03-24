"use client"

import type React from "react"
import { TouchableOpacity, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"

interface EventListItemProps {
  id: string
  title: string
  time: string
  location?: string
  type: "event" | "match" | "practice" | "course"
}

const getEventIcon = (title: string, type: string): keyof typeof FontAwesome6.glyphMap => {
  const lowerTitle = title.toLowerCase()

  // Handle by type first
  if (type === "match") return "trophy"
  if (type === "practice") return "person-running"
  if (type === "course") return "book"

  // Then check title content for event type
  if (lowerTitle.includes("basketball")) return "basketball"
  if (lowerTitle.includes("training") || lowerTitle.includes("gym")) return "dumbbell"
  if (lowerTitle.includes("meeting")) return "users"
  if (lowerTitle.includes("nutrition")) return "apple-whole"
  if (lowerTitle.includes("speed") || lowerTitle.includes("agility")) return "stopwatch"

  return "calendar"
}

const EventListItem: React.FC<EventListItemProps> = ({ id, title, time, location, type = "event" }) => {
  const router = useRouter()
  const iconName = getEventIcon(title, type)

  const handlePress = () => {
    console.log(`Navigating to event: ${id}, type: ${type}`)

    switch (type) {
      case "match":
        router.push(`/screens/match-details/${id}`)
        break
      case "practice":
        // For now, practices also go to event details
        router.push(`/screens/event-details/${id}?type=practice`)
        break
      case "course":
        router.push(`/screens/event-details/${id}?type=course`)
        break
      case "event":
      default:
        router.push(`/screens/event-details/${id}`)
    }
  }

  // Determine background and text colors based on type
  const getBgColor = () => {
    switch (type) {
      case "match":
        return "bg-gold-100/10"
      case "practice":
        return "bg-blue-500/10"
      case "course":
        return "bg-purple-500/10"
      default:
        return "bg-[#4ade80]/10"
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case "match":
        return "bg-gold-100/40"
      case "practice":
        return "bg-blue-500/20"
      case "course":
        return "bg-purple-500/20"
      default:
        return "bg-[#4ade80]/20"
    }
  }

  const getIconColor = () => {
    switch (type) {
      case "match":
        return "#FCA311"
      case "practice":
        return "#3b82f6"
      case "course":
        return "#8b5cf6"
      default:
        return "#4ade80"
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={`rounded-xl p-5 mb-4 flex-row items-center shadow-lg shadow-black ${getBgColor()}`}
    >
      <View className={`p-3 rounded-lg mr-4 ${getIconBgColor()}`}>
        <FontAwesome6 name={iconName} size={20} color={getIconColor()} />
      </View>

      <View className="flex-1">
        <Text className="text-white-100 text-lg font-semibold tracking-wide">{title}</Text>
        <View className="flex-row flex-wrap items-center mt-1">
          <Text className="text-gray-400 text-sm">{time}</Text>
          {location && (
            <View className="flex-row items-center ml-2">
              <FontAwesome6 name="location-dot" size={12} color="#a0a0a0" style={{ marginRight: 4 }} />
              <Text className="text-gray-400 text-sm">{location}</Text>
            </View>
          )}
        </View>
      </View>

      <FontAwesome6 name="chevron-right" size={16} color={getIconColor()} />
    </TouchableOpacity>
  )
}

export default EventListItem


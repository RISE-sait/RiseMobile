import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"

interface AppointmentCardProps {
  id: string
  clientName: string
  service: string
  time: string
  duration: number
  price: number
  status: AppointmentStatus
}

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return "#FCA311" // Gold
    case "pending":
      return "#3498db" // Blue
    case "completed":
      return "#2ecc71" // Green
    case "cancelled":
      return "#e74c3c" // Red
    default:
      return "#FCA311"
  }
}

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return "Confirmed"
    case "pending":
      return "Pending"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return "Confirmed"
  }
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  clientName,
  service,
  time,
  duration,
  price,
  status,
}) => {
  const router = useRouter()
  const statusColor = getStatusColor(status)
  const statusText = getStatusText(status)

  return (
    <TouchableOpacity
      className="bg-[#1A1A1A] rounded-xl p-4 mb-3"
      onPress={() => router.push(`/screens/appointment-details/${id}`)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{clientName}</Text>
          <Text className="text-gold-100">{service}</Text>
          <View className="flex-row items-center mt-1">
            <FontAwesome6 name="clock" size={12} color="#666" />
            <Text className="text-gray-400 ml-1">
              {time} • {duration} min
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-white font-bold">${price}</Text>
          <View
            className="px-3 py-1 rounded-full mt-1"
            style={{ backgroundColor: `${statusColor}20` }} // 20% opacity of status color
          >
            <Text style={{ color: statusColor }} className="text-xs font-medium">
              {statusText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default AppointmentCard


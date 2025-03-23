import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"

interface AppointmentDetailCardProps {
  clientName: string
  clientPhone?: string
  service: string
  date: string
  time: string
  duration: number
  price: number
  status: AppointmentStatus
  notes?: string
  onStatusChange?: (status: AppointmentStatus) => void
  onSendMessage?: () => void
}

const AppointmentDetailCard: React.FC<AppointmentDetailCardProps> = ({
  clientName,
  clientPhone,
  service,
  date,
  time,
  duration,
  price,
  status,
  notes,
  onStatusChange,
  onSendMessage,
}) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "#FFD700"
      case "pending":
        return "#2196F3"
      case "completed":
        return "#4CAF50"
      case "cancelled":
        return "#FF4D4F"
      default:
        return "#FFD700"
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

  const statusColor = getStatusColor(status)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{clientName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{getStatusText(status)}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="cut-outline" size={20} color="#FFD700" />
        <Text style={styles.detailText}>{service}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={20} color="#999" />
        <Text style={styles.detailText}>{date}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={20} color="#999" />
        <Text style={styles.detailText}>
          {time} • {duration} min
        </Text>
      </View>

      {clientPhone && (
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color="#999" />
          <Text style={styles.detailText}>{clientPhone}</Text>
        </View>
      )}

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.priceValue}>${price.toFixed(2)}</Text>
      </View>

      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {onStatusChange && status !== "completed" && status !== "cancelled" && (
        <View style={styles.actionsContainer}>
          {status !== "completed" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => onStatusChange("completed")}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}

          {status !== "cancelled" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF4D4F" }]}
              onPress={() => onStatusChange("cancelled")}
            >
              <Ionicons name="close-circle-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {onSendMessage && (
        <TouchableOpacity style={styles.messageButton} onPress={onSendMessage}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFD700" />
          <Text style={styles.messageButtonText}>Message Client</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clientName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    color: "white",
    fontSize: 16,
    marginLeft: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  priceLabel: {
    color: "#999",
    fontSize: 16,
  },
  priceValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  notesContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 4,
  },
  notesText: {
    color: "white",
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
  },
  messageButtonText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default AppointmentDetailCard


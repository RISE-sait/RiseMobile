import type React from "react"
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"

interface ServiceCardProps {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
  onToggle: (id: string) => void
  onEdit: (id: string) => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  price,
  duration,
  isActive,
  onToggle,
  onEdit,
}) => {
  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      <View style={styles.content}>
        <View style={styles.serviceInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaBadge}>
              <FontAwesome6 name="dollar-sign" size={10} color="#FFD700" />
              <Text style={styles.metaText}>{price}</Text>
            </View>

            <View style={styles.metaBadge}>
              <FontAwesome6 name="clock" size={10} color="#FFD700" />
              <Text style={styles.metaText}>{duration} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Switch
            trackColor={{ false: "#333", true: "#FFD700" }}
            thumbColor={isActive ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#333"
            onValueChange={() => onToggle(id)}
            value={isActive}
          />

          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(id)}>
            <FontAwesome6 name="pen" size={14} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  metaText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
  },
})

export default ServiceCard


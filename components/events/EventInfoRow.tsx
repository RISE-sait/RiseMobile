import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"

interface EventInfoRowProps {
  icon: string
  text: string
}

const EventInfoRow: React.FC<EventInfoRowProps> = ({ icon, text }) => {
  return (
    <View style={styles.container}>
      <FontAwesome5 name={icon} size={16} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
})

export default EventInfoRow


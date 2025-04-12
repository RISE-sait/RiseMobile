import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"

interface EventInfoRowProps {
  icon: string
  text: string
  subText?: string
}

const EventInfoRow: React.FC<EventInfoRowProps> = ({ icon, text, subText }) => {
  return (
    <View style={styles.container}>
      <FontAwesome5 name={icon} size={16} color={COLORS.primary} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
        {subText && <Text style={styles.subText}>{subText}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  icon: {
    marginTop: 2,
    width: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
})

export default EventInfoRow

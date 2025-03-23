import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ErrorToastProps {
    message?: string  // Optional string
  }

export const ErrorToast = ({ message }: ErrorToastProps) => {
  if (!message) return null

  return (
    <View style={styles.errorToast}>
      <Ionicons name="alert-circle" size={24} color="#FFF" />
      <Text style={styles.errorToastText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  errorToast: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FF4D4F",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  errorToastText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
})


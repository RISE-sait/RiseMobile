import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { MotiView } from "moti"

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  iconSize?: number
  iconColor?: string
  actionLabel?: string
  onAction?: () => void
  containerStyle?: any
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  iconSize = 60,
  iconColor = "#FFD700",
  actionLabel,
  onAction,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <FontAwesome6 name={icon as any} size={iconSize} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },
  content: {
    alignItems: "center",
    maxWidth: "90%",
  },
  iconContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default EmptyState

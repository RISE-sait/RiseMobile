import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export interface FeedbackDialogButton {
  text: string;
  onPress: () => void;
  style?: "default" | "primary" | "danger";
}

interface FeedbackDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons?: FeedbackDialogButton[];
  onDismiss?: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  visible,
  title,
  message,
  icon = "circle-info",
  iconColor = COLORS.primary,
  buttons = [{ text: "OK", onPress: () => {}, style: "primary" }],
  onDismiss,
}) => {
  const handleButtonPress = (button: FeedbackDialogButton) => {
    button.onPress();
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case "primary":
        return { backgroundColor: COLORS.primary, color: COLORS.background };
      case "danger":
        return { backgroundColor: COLORS.danger, color: COLORS.text };
      default:
        return { backgroundColor: COLORS.cardLight, color: COLORS.text };
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <LinearGradient
            colors={["#1A1A1A", "#2D2D2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dialog}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: iconColor + "20" },
                ]}
              >
                <FontAwesome6 name={icon} size={32} color={iconColor} />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => {
                const buttonStyle = getButtonStyle(button.style);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      { backgroundColor: buttonStyle.backgroundColor },
                      buttons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.buttonText, { color: buttonStyle.color }]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dialog: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FeedbackDialog;

import { View, Text, StyleSheet, Animated, Platform } from "react-native"

interface LoginHeaderProps {
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
}

export const LoginHeader = ({ fadeAnim, slideAnim }: LoginHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <Animated.Text
        style={[
          styles.welcomeText,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        WELCOME BACK
      </Animated.Text>

      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Completely separate text components */}
        <Text style={styles.titleText}>READY TO CONTINUE</Text>
        <Text style={styles.highlightText}>YOUR JOURNEY?</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
    headerContainer: {
      alignItems: "center",
      marginTop: 10,
      marginBottom: 40,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FCA311",
      letterSpacing: 1,
      marginTop: -30,
    },
    titleContainer: {
      marginTop: 5,
      alignItems: "center",
    },
    titleText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: 5, // Add space between the two lines
    },
    highlightText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FCA311",
      textAlign: "center",
    },
  })

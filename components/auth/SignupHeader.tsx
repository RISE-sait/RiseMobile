import { View, Text, StyleSheet, Animated } from "react-native"

interface SignupHeaderProps {
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
}

export const SignupHeader = ({ fadeAnim, slideAnim }: SignupHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <Animated.Text
        style={[
          styles.joinText,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        JOIN RISE TODAY
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
        <Text style={styles.titleText}>
          LET'S GET YOU STARTED{"\n"}
          <Text style={styles.highlightText}>ON YOUR JOURNEY</Text>
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  joinText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
    letterSpacing: 1,
  },
  titleContainer: {
    marginTop: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 30,
  },
  highlightText: {
    color: "#FFD700",
  },
})


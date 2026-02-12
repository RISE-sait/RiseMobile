import { TouchableOpacity, Text, StyleSheet } from "react-native"

interface SignupLinkProps {
  onPress: () => void
}

export const SignupLink = ({ onPress }: SignupLinkProps) => {
  return (
    <TouchableOpacity style={styles.signupLink} onPress={onPress}>
      <Text style={styles.signupText}>
        DON'T HAVE AN ACCOUNT? <Text style={styles.signupHighlight}>SIGN UP</Text>
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  signupLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  signupHighlight: {
    color: "#FCA311",
    fontWeight: "bold",
  },
})


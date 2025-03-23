import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import icons from "@/constants/icons"


interface SocialLoginProps {
  onGoogleLogin: () => Promise<void>
  onAppleLogin?: () => Promise<void>
  onFacebookLogin?: () => Promise<void>
}

export const SocialLogin = ({
  onGoogleLogin,
  onAppleLogin = () => {},
  onFacebookLogin = () => {},
}: SocialLoginProps) => {
  return (
    <View style={styles.socialContainer}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR LOGIN WITH</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onGoogleLogin}>
          <Image source={icons.google} style={styles.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onAppleLogin}>
          <Image source={icons.apple} style={styles.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onFacebookLogin}>
          <Image source={icons.facebook} style={styles.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  socialContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#9EA0A4",
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
})


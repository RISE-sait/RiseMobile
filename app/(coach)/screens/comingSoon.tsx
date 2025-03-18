import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { COLORS } from "@/constants/colors"

const { width, height } = Dimensions.get("window")


const ComingSoon = () => {
  const router = useRouter()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Implement subscription logic here
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feature Preview</Text>
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Animated Basketball */}
        <View style={styles.basketballContainer}>
          <Animated.View style={[styles.gearContainer, { transform: [{ rotate: spin }] }]}>
            <MaterialCommunityIcons name="cog" size={40} color={COLORS.primary} />
          </Animated.View>
          <View style={styles.basketballIconContainer}>
            <FontAwesome5 name="basketball-ball" size={60} color={COLORS.primary} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.description}>
          We're building something amazing for you. This feature will be available in the next update.
        </Text>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineCompleted]}>
              <FontAwesome5 name="check" size={12} color="#000" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Planning</Text>
              <Text style={styles.timelineDate}>Completed</Text>
            </View>
          </View>

          <View style={styles.timelineConnector} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineCompleted]}>
              <FontAwesome5 name="check" size={12} color="#000" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Development</Text>
              <Text style={styles.timelineDate}>Completed</Text>
            </View>
          </View>

          <View style={styles.timelineConnector} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineActive]}>
              <View style={styles.timelinePulse} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Testing</Text>
              <Text style={styles.timelineDate}>In Progress</Text>
            </View>
          </View>

          <View style={styles.timelineConnector} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Release</Text>
              <Text style={styles.timelineDate}>Coming Soon</Text>
            </View>
          </View>
        </View>

      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Expected Release: April 2025</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  basketballContainer: {
    position: "relative",
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  basketballIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  gearContainer: {
    position: "absolute",
    top: 0,
    right: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  timelineContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineActive: {
    borderColor: COLORS.primary,
    position: "relative",
  },
  timelinePulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  timelineConnector: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.textSecondary,
    marginLeft: 11,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  subscribeButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  subscribeIcon: {
    marginLeft: 4,
  },
  footer: {
    padding: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
})

export default ComingSoon


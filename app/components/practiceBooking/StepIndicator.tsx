import React from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { FontAwesome6 } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"

interface Step {
  label: string
  icon: string
}

interface StepIndicatorProps {
  currentStep: number
  steps?: Step[]
}

const defaultSteps: Step[] = [
  { label: "When & Where", icon: "calendar" },
  { label: "Team & Focus", icon: "users" },
  { label: "Equipment & Notes", icon: "clipboard" },
]

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps = defaultSteps }) => {
  const progressAnimation = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: (currentStep - 1) / (steps.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [currentStep, steps.length])

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View
                style={[
                  styles.step,
                  currentStep > index + 1 && styles.stepCompleted,
                  currentStep === index + 1 && styles.stepActive,
                ]}
              >
                {currentStep > index + 1 ? (
                  <FontAwesome6 name="check" size={14} color={COLORS.background} />
                ) : (
                  <FontAwesome6
                    name={step.icon}
                    size={14}
                    color={currentStep === index + 1 ? COLORS.primary : COLORS.textSecondary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === index + 1 && styles.stepLabelActive,
                  currentStep > index + 1 && styles.stepLabelCompleted,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.cardLight,
    borderRadius: 2,
    marginBottom: 16,
    position: "relative",
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.cardLight,
  },
  progressFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: -14,
    left: 0,
    right: 0,
  },
  stepContainer: {
    alignItems: "center",
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  stepCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 80,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  stepLabelCompleted: {
    color: COLORS.text,
  },
})

export default StepIndicator


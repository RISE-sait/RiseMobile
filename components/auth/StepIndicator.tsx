import React from "react"
import { View, StyleSheet } from "react-native"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <View style={[styles.stepDot, currentStep >= index + 1 && styles.activeStepDot]} />
          {index < totalSteps - 1 && <View style={styles.stepLine} />}
        </React.Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
  },
  activeStepDot: {
    backgroundColor: "#FCA311",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#333",
    marginHorizontal: 5,
  },
})


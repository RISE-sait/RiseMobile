import { StyleSheet, View } from "react-native"

const TouchLogger = () => {
  if (!__DEV__) return null

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      onTouchStartCapture={(event) => {
        const { pageX, pageY, target } = event.nativeEvent
        console.log(
          `[TouchCapture] start at ${new Date().toISOString()} (x=${pageX?.toFixed?.(1) ?? "?"}, y=${pageY?.toFixed?.(1) ?? "?"}, target=${target ?? "unknown"})`,
        )
      }}
    />
  )
}

export default TouchLogger

import { StyleSheet, View } from "react-native"

const TouchLogger = () => {
  if (!__DEV__) return null

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      onTouchStartCapture={(event) => {
        console.log(`[TouchCapture] start at ${new Date().toISOString()}`)
      }}
    />
  )
}

export default TouchLogger

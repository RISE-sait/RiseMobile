import { useEffect } from "react"

const JsHeartbeat = () => {
  useEffect(() => {
    if (!__DEV__) return

    const interval = setInterval(() => {
      console.log(`[Heartbeat] JS thread alive at ${new Date().toISOString()}`)
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return null
}

export default JsHeartbeat

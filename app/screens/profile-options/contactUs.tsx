import { useState } from "react"
import { View, Text, ScrollView, Alert, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faEnvelope, faPhone, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BackButton from "@/components/buttons/BackButton"
import { useAppSelector } from "@/store/hooks"
import { API_URL } from "@/utils/api/core/constants"

const SUPPORT_EMAIL = "info@risesportscomplex.com"
const SUPPORT_PHONE = "(587) 899-7473"

export default function ContactUs() {
  const router = useRouter()
  const user = useAppSelector((state) => state.user.data)
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : "")
  const [email, setEmail] = useState(user?.email || "")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert("Missing Information", "Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Send via backend API
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          phone: user?.phoneNumber || "",
          token: user?.token || "",
        }),
      })

      if (response.ok) {
        Alert.alert("Message Sent", "Thank you for your message. We'll get back to you soon.", [
          {
            text: "OK",
            onPress: () => {
              setMessage("")
            },
          },
        ])
      } else {
        // Fallback to mailto if API fails
        throw new Error("API not available")
      }
    } catch (error) {
      // Fallback: Open email client with pre-filled message
      const subject = encodeURIComponent(`Contact from ${name} (RISE App)`)
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nUser ID: ${user?.id || "Not logged in"}\n\nMessage:\n${message}`
      )
      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`

      const canOpen = await Linking.canOpenURL(mailtoUrl)
      if (canOpen) {
        await Linking.openURL(mailtoUrl)
        Alert.alert("Email Client Opened", "Please send the email from your email app.", [
          {
            text: "OK",
            onPress: () => {
              setMessage("")
            },
          },
        ])
      } else {
        Alert.alert("Error", "Unable to send message. Please email us directly at " + SUPPORT_EMAIL)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView showsVerticalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingBottom: 80 }}>
        <BackButton />
        <View className="pt-4 pb-6">
          <Text className="text-[#F0F0F0] text-2xl font-bold mb-2">Contact Us</Text>
          <Text className="text-[#999999] text-base mb-6">Get in touch with us for any questions or concerns</Text>
        </View>

        <View className="bg-[#1A1A1A] rounded-xl p-5 mb-6">
          <View className="flex-row items-center mb-4">
            <FontAwesomeIcon icon={faEnvelope} color="#FCA311" size={20} />
            <Text className="text-[#F0F0F0] text-base ml-3">{SUPPORT_EMAIL}</Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faPhone} color="#FCA311" size={20} />
            <Text className="text-[#F0F0F0] text-base ml-3">{SUPPORT_PHONE}</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-[#F0F0F0] text-base mb-2">Name</Text>
          <Input
            placeholder="Enter your name"
            className="bg-[#1A1A1A] border-[#333333] border rounded-lg text-[#F0F0F0] p-3 mb-4"
            placeholderTextColor="#666666"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-[#F0F0F0] text-base mb-2">Email</Text>
          <Input
            placeholder="Enter your email"
            className="bg-[#1A1A1A] border-[#333333] border rounded-lg text-[#F0F0F0] p-3 mb-4"
            placeholderTextColor="#666666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-[#F0F0F0] text-base mb-2">Message</Text>
          <Input
            placeholder="How can we help you?"
            className="bg-[#1A1A1A] border-[#333333] border rounded-lg text-[#F0F0F0] p-3 h-32"
            multiline
            textAlignVertical="top"
            numberOfLines={4}
            placeholderTextColor="#666666"
            value={message}
            onChangeText={setMessage}
          />

          <Button
            onPress={handleSubmit}
            style={{ backgroundColor: "#FCA311", borderRadius: 8, marginTop: 24, paddingVertical: 16 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>Sending...</Text>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} color="#000000" size={16} style={{ marginRight: 8 }} />
                <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>Send Message</Text>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


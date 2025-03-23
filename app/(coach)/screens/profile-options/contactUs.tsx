import { useState } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faEnvelope, faPhone, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BackButton from "@/components/BackButton"

export default function ContactUs() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert("Missing Information", "Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert("Message Sent", "Thank you for your message. We'll get back to you soon.", [
        {
          text: "OK",
          onPress: () => {
            setName("")
            setEmail("")
            setMessage("")
          },
        },
      ])
    }, 1500)
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
            <FontAwesomeIcon icon={faEnvelope} color="#F0F0F0" size={20} />
            <Text className="text-[#F0F0F0] text-base ml-3">support@rise.com</Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesomeIcon icon={faPhone} color="#F0F0F0" size={20} />
            <Text className="text-[#F0F0F0] text-base ml-3">1-800-RISE-APP</Text>
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
            className="bg-[#007AFF] rounded-lg mt-6 py-4 flex-row justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text className="text-[#F0F0F0] text-base font-semibold">Sending...</Text>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} color="#F0F0F0" size={16} style={{ marginRight: 8 }} />
                <Text className="text-[#F0F0F0] text-base font-semibold">Send Message</Text>
              </>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


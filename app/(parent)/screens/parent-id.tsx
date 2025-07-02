"use client"

import { View, Text, TouchableOpacity, Alert,ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import * as Clipboard from "expo-clipboard"
import { Ionicons } from "@expo/vector-icons"
import { useAppSelector } from "@/store/hooks"
import BackButton from "@/components/buttons/BackButton"
import PageTitle from "@/components/PageTitle"
import QRCodeModal from "@/components/QRCodeModal"

export default function ParentIdScreen() {
  const user = useAppSelector((state) => state.user.data)
  const parentId = user?.id ?? ""
  const parentName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

const [copied, setCopied] = useState(false)
const [showQRModal, setShowQRModal] = useState(false)
const [showParentId, setShowParentId] = useState(false) // NEW

const maskedId = "*".repeat(8)

const handleToggleId = () => {
  setShowParentId((prev) => !prev)
}


  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(parentId)
      setCopied(true)
      Alert.alert("Copied!", "Parent ID copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      Alert.alert("Error", "Failed to copy to clipboard")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
        <BackButton />
        <PageTitle title="Parent ID" />
        <View className="w-10" />
      </View>

    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Main ID Card */}
        <View className="bg-black-200 rounded-2xl border border-gray-800 p-8 mb-6">
          {/* Profile Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-gold-100 items-center justify-center mb-4 shadow-lg">
              <Ionicons name="person" size={48} color="#000" />
            </View>
            <Text className="text-white-100 text-2xl font-Outfit-Bold mb-2 text-center">
              {parentName || "Parent Account"}
            </Text>
            <View className="bg-gold-100/20 px-4 py-2 rounded-full">
              <Text className="text-gold-100 text-sm font-Outfit-SemiBold">PARENT</Text>
            </View>
          </View>

          {/* ID Display Section */}
            <View className="bg-black-300 p-6 rounded-xl mb-6 border border-gray-700">
            <Text className="text-gray-400 text-sm font-Outfit-Medium mb-3 text-center">YOUR PARENT ID</Text>
            <Text className="text-white-100 text-3xl font-Outfit-Bold text-center tracking-widest mb-4">
                {showParentId ? parentId : maskedId}
            </Text>

            <TouchableOpacity onPress={handleToggleId} activeOpacity={0.8}>
                <Text className="text-gold-100 text-center text-sm font-Outfit-SemiBold">
                {showParentId ? "Hide ID" : "Show Full ID"}
                </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs font-Outfit-Regular text-center mt-3">
                Use this ID to connect with your children's accounts
            </Text>
            </View>


          {/* Action Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={handleCopy}
              className={`${
                copied ? "bg-green-500" : "bg-gold-100"
              } rounded-xl py-4 px-6 flex-row items-center justify-center shadow-sm mb-5`}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={22}
                color="#000"
                style={{ marginRight: 10 }}
              />
              <Text className="text-black-100 font-Outfit-Bold text-lg">
                {copied ? "Copied to Clipboard!" : "Copy Parent ID"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              className="bg-black-300 rounded-xl py-4 px-6 flex-row items-center justify-center border border-gray-600"
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={22} color="#FCA311" style={{ marginRight: 10 }} />
              <Text className="text-white-100 font-Outfit-Bold text-lg">Show QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions Card */}
        <View className="bg-black-200 rounded-2xl border border-gray-800 p-6">
          <View className="flex-row items-center mb-6">
            <View className="bg-gold-100/20 p-3 rounded-full mr-4">
              <Ionicons name="information-circle-outline" size={24} color="#FCA311" />
            </View>
            <Text className="text-white-100 text-xl font-Outfit-Bold">How to Use</Text>
          </View>

          <View className="space-y-5">
            {[
              {
                icon: "people-outline",
                title: "Share with Coaches",
                desc: "Provide this ID when registering your child for programs and activities",
              },
              {
                icon: "link-outline",
                title: "Link Children's Accounts",
                desc: "Connect your children's profiles to monitor their progress and activities",
              },
              {
                icon: "stats-chart-outline",
                title: "Track Development",
                desc: "Access detailed reports on your children's athletic development and achievements",
              },
            ].map((step, index) => (
              <View key={index} className="flex-row items-start">
                <View className="bg-gold-100 w-10 h-10 rounded-full items-center justify-center mr-4 mt-1">
                  <Text className="text-black-100 text-sm font-Outfit-Bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name={step.icon as any} size={18} color="#FCA311" style={{ marginRight: 8 }} />
                    <Text className="text-white-100 font-Outfit-Bold text-base">{step.title}</Text>
                  </View>
                  <Text className="text-gray-400 text-sm font-Outfit-Regular leading-5">{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Security Note */}
          <View className="mt-6 pt-6 border-t border-gray-700">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
              <Text className="text-gray-400 text-sm font-Outfit-Regular">
                Your Parent ID is secure and unique to your account
              </Text>
            </View>
          </View>
        </View>
          </ScrollView>
    </SafeAreaView>
  )
}

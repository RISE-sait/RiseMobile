"use client"

import { useState } from "react"
import { Text, View, ScrollView, TouchableOpacity, TextInput, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// Mock services data
const initialServices = [
  {
    id: "1",
    name: "Fade Haircut",
    description: "Classic fade haircut with clipper and scissors",
    price: 25,
    duration: 30,
    isActive: true,
  },
  {
    id: "2",
    name: "Lineup",
    description: "Clean up edges and neckline",
    price: 15,
    duration: 20,
    isActive: true,
  },
  {
    id: "3",
    name: "Beard Trim",
    description: "Shape and trim beard",
    price: 15,
    duration: 15,
    isActive: true,
  },
  {
    id: "4",
    name: "Fade & Beard Combo",
    description: "Fade haircut with beard trim",
    price: 35,
    duration: 45,
    isActive: true,
  },
  {
    id: "5",
    name: "Kids Haircut",
    description: "Haircut for children under 12",
    price: 20,
    duration: 25,
    isActive: true,
  },
  {
    id: "6",
    name: "Shampoo & Style",
    description: "Wash hair and style",
    price: 20,
    duration: 20,
    isActive: false,
  },
]

export default function ServicesScreen() {
  const router = useRouter()
  const [services, setServices] = useState(initialServices)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)

  // Filter services based on search query and active status
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = showInactive ? true : service.isActive
    return matchesSearch && matchesStatus
  })

  // Toggle service active status
  const toggleServiceStatus = (id) => {
    setServices(services.map((service) => (service.id === id ? { ...service, isActive: !service.isActive } : service)))
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <View className="px-5 pt-12 pb-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Services</Text>
        <TouchableOpacity
          className="bg-gold-100 rounded-full p-2"
          onPress={() => router.push("/screens/service-management")}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-4">
        <View className="bg-[#1A1A1A] rounded-xl px-4 py-2 flex-row items-center">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search services..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="px-5 mb-4 flex-row items-center">
        <Text className="text-white mr-2">Show Inactive Services</Text>
        <Switch
          trackColor={{ false: "#333", true: "#FFD700" }}
          thumbColor={showInactive ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#333"
          onValueChange={setShowInactive}
          value={showInactive}
        />
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <View
              key={service.id}
              className={`bg-[#1A1A1A] rounded-xl p-4 mb-3 ${!service.isActive ? "opacity-60" : ""}`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">{service.name}</Text>
                  <Text className="text-gray-400">{service.description}</Text>
                  <View className="flex-row mt-2">
                    <View className="bg-[#2A2A2A] px-3 py-1 rounded-full mr-2">
                      <Text className="text-gold-100 text-xs">${service.price}</Text>
                    </View>
                    <View className="bg-[#2A2A2A] px-3 py-1 rounded-full">
                      <Text className="text-gold-100 text-xs">{service.duration} min</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Switch
                    trackColor={{ false: "#333", true: "#FFD700" }}
                    thumbColor={service.isActive ? "#FFFFFF" : "#f4f3f4"}
                    ios_backgroundColor="#333"
                    onValueChange={() => toggleServiceStatus(service.id)}
                    value={service.isActive}
                  />
                  <TouchableOpacity
                    className="ml-2"
                    onPress={() => router.push(`/screens/service-management?id=${service.id}`)}
                  >
                    <Ionicons name="pencil" size={20} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-[#1A1A1A] rounded-xl p-6 items-center">
            <Ionicons name="cut-outline" size={48} color="#666" />
            <Text className="text-white text-lg mt-2">No services found</Text>
            <Text className="text-gray-400 text-center mt-1">
              {searchQuery ? `No services match "${searchQuery}"` : "You haven't added any services yet"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}


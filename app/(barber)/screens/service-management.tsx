"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import ServiceForm from "@/components/barber/ServiceForm"
import GradientBackground from "@/components/barber/GradientBackground"

// Mock API functions
const saveService = async (service: any) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("Service saved:", service)
      resolve()
    }, 1000)
  })
}

const deleteService = async (id: string) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("Service deleted:", id)
      resolve()
    }, 1000)
  })
}

const getService = async (id: string) => {
  // Simulate API call to get service details
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data for different services
      const services = {
        "1": {
          id: "1",
          name: "Fade Haircut",
          description: "Classic fade haircut with clipper and scissors",
          price: 25,
          duration: 30,
          isActive: true,
        },
        "2": {
          id: "2",
          name: "Lineup",
          description: "Clean up edges and neckline",
          price: 15,
          duration: 20,
          isActive: true,
        },
        "3": {
          id: "3",
          name: "Beard Trim",
          description: "Shape and trim beard",
          price: 15,
          duration: 15,
          isActive: true,
        },
        "4": {
          id: "4",
          name: "Fade & Beard Combo",
          description: "Fade haircut with beard trim",
          price: 35,
          duration: 45,
          isActive: true,
        },
        "5": {
          id: "5",
          name: "Kids Haircut",
          description: "Haircut for children under 12",
          price: 20,
          duration: 25,
          isActive: true,
        },
        "6": {
          id: "6",
          name: "Shampoo & Style",
          description: "Wash hair and style",
          price: 20,
          duration: 20,
          isActive: false,
        },
      }

      resolve(services[id] || null)
    }, 500)
  })
}

export default function ServiceManagementScreen() {
  const params = useLocalSearchParams()
  const serviceId = params.id as string | undefined

  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(!!serviceId)

  useEffect(() => {
    if (serviceId) {
      loadService(serviceId)
    }
  }, [serviceId])

  const loadService = async (id: string) => {
    try {
      setIsLoading(true)
      const serviceData = await getService(id)
      setService(serviceData)
    } catch (error) {
      Alert.alert("Error", "Failed to load service details.")
      console.error("Error loading service:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveService = async (serviceData: any) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await saveService(serviceData)
      return true
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      console.error("Error saving service:", error)
      throw error
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      await deleteService(id)
      return true
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      console.error("Error deleting service:", error)
      throw error
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground intensity="low">
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ServiceForm initialData={service} onSave={handleSaveService} onDelete={handleDeleteService} />
        )}
      </GradientBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})


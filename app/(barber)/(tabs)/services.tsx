import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesome6 } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated"

import GradientBackground from "@/app/components/barber/GradientBackground"

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
  const [isLoading, setIsLoading] = useState(true)

  // Animation values
  const headerOpacity = useSharedValue(0)
  const headerTranslateY = useSharedValue(-20)
  const searchOpacity = useSharedValue(0)
  const searchTranslateY = useSharedValue(-20)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Start animations
      headerOpacity.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) })
      headerTranslateY.value = withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) })

      searchOpacity.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) })
      searchTranslateY.value = withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    }
  })

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: searchOpacity.value,
      transform: [{ translateY: searchTranslateY.value }],
    }
  })

  // Filter services based on search query and active status
  const [recentlyToggled, setRecentlyToggled] = useState<string[]>([])

  // Filter services based on search query and active status, but keep recently toggled items
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const shouldShow = showInactive || service.isActive || recentlyToggled.includes(service.id)
    return matchesSearch && shouldShow
  })

  // Toggle service active status without removing it from view
  const toggleServiceStatus = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Add to recently toggled list to keep it visible
    if (!recentlyToggled.includes(id)) {
      setRecentlyToggled([...recentlyToggled, id])
    }

    // After 1 seconds, remove from recently toggled list
    setTimeout(() => {
      setRecentlyToggled((current) => current.filter((itemId) => itemId !== id))
    }, 1000)

    setServices(services.map((service) => (service.id === id ? { ...service, isActive: !service.isActive } : service)))
  }

  const handleAddService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push("/screens/service-management")
  }

  const handleEditService = (id) => {
    router.push(`/screens/service-management?id=${id}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <GradientBackground>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.headerTitle}>Services</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddService} activeOpacity={0.8}>
            <FontAwesome6 name="plus" size={20} color="#000" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <View style={styles.searchBar}>
            <FontAwesome6 name="magnifying-glass" size={16} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <FontAwesome6 name="times-circle" size={16} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Show Inactive</Text>
            <Switch
              trackColor={{ false: "#333", true: "#FFD700" }}
              thumbColor={showInactive ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#333"
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowInactive(value)
              }}
              value={showInactive}
            />
          </View>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <Animated.View
                  key={service.id}
                  entering={FadeIn.delay(index * 100).duration(300)}
                  exiting={FadeOut.duration(300)}
                  style={[styles.serviceCard, !service.isActive && styles.inactiveService]}
                >
                  <View style={styles.serviceContent}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      <View style={styles.serviceMetaContainer}>
                        <View style={styles.serviceMeta}>
                          <FontAwesome6 name="dollar-sign" size={12} color="#FFD700" style={styles.metaIcon} />
                          <Text style={styles.serviceMetaText}>{service.price}</Text>
                        </View>
                        <View style={styles.serviceMeta}>
                          <FontAwesome6 name="clock" size={12} color="#FFD700" style={styles.metaIcon} />
                          <Text style={styles.serviceMetaText}>{service.duration} min</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.serviceActions}>
                      <Switch
                        trackColor={{ false: "#333", true: "#FFD700" }}
                        thumbColor={service.isActive ? "#FFFFFF" : "#f4f3f4"}
                        ios_backgroundColor="#333"
                        onValueChange={() => toggleServiceStatus(service.id)}
                        value={service.isActive}
                      />
                      <TouchableOpacity style={styles.editButton} onPress={() => handleEditService(service.id)}>
                        <FontAwesome6 name="pen" size={16} color="#FFD700" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome6 name="scissors" size={48} color="#666" />
                <Text style={styles.emptyStateTitle}>No services found</Text>
                <Text style={styles.emptyStateMessage}>
                  {searchQuery ? `No services match "${searchQuery}"` : "You haven't added any services yet"}
                </Text>

                {!searchQuery && (
                  <TouchableOpacity style={styles.addServiceButton} onPress={handleAddService}>
                    <Text style={styles.addServiceButtonText}>Add Your First Service</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FFD700",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: "white",
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  filterLabel: {
    color: "white",
    marginRight: 8,
    fontSize: 14,
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveService: {
    opacity: 0.7,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#222",
  },
  serviceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  serviceName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  serviceDescription: {
    color: "#999",
    marginVertical: 4,
    fontSize: 14,
  },
  serviceMetaContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  serviceMeta: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 4,
  },
  serviceMetaText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginLeft: 12,
    backgroundColor: "#2A2A2A",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  emptyStateTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyStateMessage: {
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  addServiceButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  addServiceButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
})


"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useFocusEffect } from "expo-router"
import { FontAwesome5, Ionicons, Feather, AntDesign } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"
import { useAppSelector } from "@/store/hooks"
import { getUpcomingBookings } from "@/utils/api"

const { width } = Dimensions.get("window")
const cardWidth = width * 0.85

// Define color constants
const COLORS = {
  primary: "#FFD700",
  primaryDark: "#E6C200",
  background: "#0C0B0B",
  card: "#1A1A1A",
  cardDark: "#141414",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  success: "#4CAF50",
  warning: "#FFC107",
  danger: "#FF5252",
  info: "#2196F3",
}

// Upcoming bookings are now loaded from API - removed unused constant

// Featured facilities - filtered to show only Basketball Court and Courtside Kutz
const featuredFacilities = [
  {
    id: "1",
    title: "Drop-In Sessions",
    description: "Join open basketball sessions with other athletes",
    image:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    route: "/screens/booking-options/DropIn",
  },
  {
    id: "2",
    title: "Courtside Kutz",
    description: "Book your next haircut with our professional barbers",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    route: "/screens/booking-options/CourtsideKutz",
  },
]

// Booking options with availability status - filtered to show only Basketball Court and Courtside Kutz
const bookingOptions = [
  {
    title: "Basketball Court",
    icon: "basketball-ball",
    route: "/screens/booking-options/DropIn",
    availability: "High",
    color: "#FF7043",
  },
  {
    title: "Courtside Kutz",
    icon: "cut",
    route: "/screens/booking-options/CourtsideKutz",
    availability: "High",
    color: "#FFA726",
  },
]

const AthleteBook = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(bookingOptions)
  const scrollX = useRef(new Animated.Value(0)).current
  
  // Real upcoming bookings state
  const [realUpcomingBookings, setRealUpcomingBookings] = useState<any[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current
  
  // Get user from Redux store
  const user = useAppSelector((state) => state.user.data)

  // Fetch real upcoming bookings function
  const fetchUpcomingBookings = useCallback(async () => {
    if (!user?.token || !user?.id) {
      console.log("📢 No user authentication available for fetching bookings", { 
        hasToken: !!user?.token, 
        hasId: !!user?.id 
      })
      setIsLoadingBookings(false)
      return
    }

    // Check if Firebase auth is ready to avoid timing issues
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (!auth.currentUser) {
        console.log("🔄 Firebase auth not ready yet, will retry when user navigates to this tab");
        setIsLoadingBookings(false);
        return;
      }
    } catch (authError) {
      console.warn("⚠️ Could not check Firebase auth state:", authError);
      // Continue anyway, the API call will handle auth issues
    }
    
    try {
      setIsLoadingBookings(true)
      setBookingsError(null)
      
      console.log("🔄 Fetching upcoming bookings for user:", user.id)
      const bookings = await getUpcomingBookings(user.token, user.email)
      console.log("📢 Fetched upcoming bookings:", bookings)
      console.log("📢 Bookings data type:", typeof bookings)
      console.log("📢 Bookings structure:", Object.keys(bookings || {}))
      
      // Transform API data to match the expected format
      // API returns: { haircuts: [...], playground: [...] }
      let allBookings: any[] = []
      
      if (bookings && typeof bookings === 'object') {
        // Extract haircut bookings
        if (Array.isArray(bookings.haircuts)) {
          console.log("📢 Found haircut bookings:", bookings.haircuts.length)
          allBookings = [...allBookings, ...bookings.haircuts]
        }
        
        // Extract playground bookings  
        if (Array.isArray(bookings.playground)) {
          console.log("📢 Found playground bookings:", bookings.playground.length)
          allBookings = [...allBookings, ...bookings.playground]
        }
      } else if (Array.isArray(bookings)) {
        // Fallback for array format (old assumption)
        console.log("📢 Bookings is array format (unexpected)")
        allBookings = bookings
      }
      
      console.log("📢 Total bookings to process:", allBookings.length)
      
      if (allBookings.length > 0) {
        const transformedBookings = allBookings.map((booking: any, index: number) => {
          // Helper function to format datetime string to date and time
          const parseDateTime = (dateTimeStr: string) => {
            if (!dateTimeStr) return { date: "TBD", time: "TBD" }
            
            try {
              // Parse "2025-08-30 09:30:00 -0600 -0600" format
              const cleanDateStr = dateTimeStr.split(' -0600')[0] // Remove timezone part
              const dateObj = new Date(cleanDateStr)
              
              if (isNaN(dateObj.getTime())) {
                console.warn("📅 Invalid date format:", dateTimeStr)
                return { date: "TBD", time: "TBD" }
              }
              
              const date = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }) // "Aug 30"
              
              const time = dateObj.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }) // "9:30 AM"
              
              return { date, time }
            } catch (error) {
              console.error("📅 Error parsing date:", dateTimeStr, error)
              return { date: "TBD", time: "TBD" }
            }
          }
          
          const { date, time } = parseDateTime(booking.start_at)
          
          return {
            id: booking.id || `booking-${index}`,
            type: booking.barber_name ? "Haircut" : booking.service_name || booking.type || "Appointment",
            location: booking.location || "Courtside Kutz", 
            date: date,
            time: time,
            status: booking.status || "Confirmed",
            icon: booking.barber_name || booking.service_name?.toLowerCase().includes('haircut') || booking.service_name?.toLowerCase().includes('cut') 
                  ? "cut" 
                  : booking.type?.toLowerCase().includes('basketball')
                  ? "basketball-ball"
                  : "calendar"
          }
        })
        
        console.log("📢 Transformed bookings:", transformedBookings)
        setRealUpcomingBookings(transformedBookings)
      } else {
        console.log("📢 No bookings found")
        setRealUpcomingBookings([])
      }
    } catch (error) {
      console.error("❌ Error fetching upcoming bookings:", error)
      setBookingsError("Failed to load upcoming bookings")
      setRealUpcomingBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }, [user?.token, user?.id, user?.email])

  // Fetch bookings on component mount and user changes
  useEffect(() => {
    fetchUpcomingBookings()
  }, [fetchUpcomingBookings])
  
  // Refresh bookings when tab gains focus (user returns from booking flow)
  useFocusEffect(
    useCallback(() => {
      console.log("📋 Book tab focused - refreshing upcoming bookings")
      fetchUpcomingBookings()
    }, [fetchUpcomingBookings])
  )

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Filter options based on search query
    if (searchQuery.trim() === "") {
      setFilteredOptions(bookingOptions)
    } else {
      const filtered = bookingOptions.filter((option) => option.title.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredOptions(filtered)
    }
  }, [searchQuery])

  const handleOptionPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (route) {
      router.push(route)
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "High":
        return COLORS.success
      case "Medium":
        return COLORS.warning
      case "Low":
        return COLORS.danger
      default:
        return COLORS.textSecondary
    }
  }

  const renderFeaturedItem = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth]

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleOptionPress(item.route)}>
        <Animated.View
          style={{
            width: cardWidth,
            height: 180,
            marginHorizontal: 10,
            borderRadius: 16,
            overflow: "hidden",
            opacity,
            transform: [{ scale }],
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>{item.description}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    )
  }

  const renderUpcomingBooking = ({ item }: { item: any }) => {
    const statusColor = item.status === "Confirmed" ? COLORS.success : COLORS.warning

    return (
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        activeOpacity={0.8}
        onPress={() => {}}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: COLORS.cardDark,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <FontAwesome5 name={item.icon} size={24} color={COLORS.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "bold" }}>{item.type}</Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: statusColor + "20",
              }}
            >
              <Text style={{ color: statusColor, fontSize: 12, fontWeight: "600" }}>{item.status}</Text>
            </View>
          </View>

          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 2 }}>{item.location}</Text>

          <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 }}>{item.date}</Text>
            <View style={{ width: 1, height: 12, backgroundColor: COLORS.textSecondary, marginHorizontal: 8 }} />
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 }}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />

      {/* Header containing title */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <View>
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "bold" }}>Athlete Bookings</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>Book courts and services</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.card,
              borderRadius: 12,
              paddingHorizontal: 16,
              marginHorizontal: 20,
              marginBottom: 20,
              height: 50,
            }}
          >
            <Feather name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 10,
                color: COLORS.text,
                fontSize: 16,
              }}
              placeholder="Search facilities..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <AntDesign name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Featured Facilities */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>Featured</Text>
              <TouchableOpacity>
                <Text style={{ color: COLORS.primary, fontSize: 14 }}>See All</Text>
              </TouchableOpacity>
            </View>

            <Animated.FlatList
              data={featuredFacilities}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + 20}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 10 }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
            />
          </View>

          {/* Upcoming Bookings */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>Upcoming Bookings</Text>
              {realUpcomingBookings.length > 0 && (
                <TouchableOpacity>
                  <Text style={{ color: COLORS.primary, fontSize: 14 }}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              {isLoadingBookings ? (
                <View style={{ 
                  backgroundColor: COLORS.card, 
                  borderRadius: 12, 
                  padding: 20, 
                  alignItems: 'center' 
                }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Loading your bookings...</Text>
                </View>
              ) : bookingsError ? (
                <View style={{ 
                  backgroundColor: COLORS.card, 
                  borderRadius: 12, 
                  padding: 20, 
                  alignItems: 'center' 
                }}>
                  <FontAwesome5 name="exclamation-triangle" size={24} color={COLORS.warning} />
                  <Text style={{ color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                    {bookingsError}
                  </Text>
                </View>
              ) : realUpcomingBookings.length > 0 ? (
                <FlatList
                  data={realUpcomingBookings}
                  renderItem={renderUpcomingBooking}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={{ 
                  backgroundColor: COLORS.card, 
                  borderRadius: 12, 
                  padding: 20, 
                  alignItems: 'center' 
                }}>
                  <FontAwesome5 name="calendar-times" size={32} color={COLORS.textSecondary} />
                  <Text style={{ color: COLORS.text, fontWeight: 'bold', marginTop: 12, fontSize: 16 }}>
                    No Upcoming Bookings
                  </Text>
                  <Text style={{ 
                    color: COLORS.textSecondary, 
                    marginTop: 4, 
                    textAlign: 'center',
                    lineHeight: 20 
                  }}>
                    You don't have any upcoming appointments.{'\n'}Book a service below to get started!
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* All Booking Options */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>All Facilities</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                paddingHorizontal: 20,
              }}
            >
              {filteredOptions.map((option) => (
                <TouchableOpacity
                  key={option.title}
                  style={{
                    width: "48%",
                    height: 100,
                    backgroundColor: COLORS.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    justifyContent: "space-between",
                  }}
                  activeOpacity={0.8}
                  onPress={() => handleOptionPress(option.route)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: option.color + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesome5 name={option.icon} size={18} color={option.color} />
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: getAvailabilityColor(option.availability) + "20",
                      }}
                    >
                      <Text
                        style={{
                          color: getAvailabilityColor(option.availability),
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                      >
                        {option.availability}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "600" }}>{option.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AthleteBook


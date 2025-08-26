import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FontAwesome5, Ionicons, Feather, AntDesign } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"

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

// Mock data for upcoming bookings
const upcomingBookings = [
  {
    id: "1",
    type: "Court",
    location: "Main Basketball Court",
    date: "Today",
    time: "3:00 PM - 5:00 PM",
    status: "Confirmed",
    icon: "basketball-ball",
  },
  {
    id: "2",
    type: "Barber",
    location: "Courtside Kutz",
    date: "Tomorrow",
    time: "10:30 AM - 11:15 AM",
    status: "Pending",
    icon: "cut",
  },
  {
    id: "3",
    type: "Recovery Room",
    location: "Recovery Center",
    date: "Fri, Jun 14",
    time: "2:00 PM - 3:00 PM",
    status: "Confirmed",
    icon: "bed",
  },
]

// Mock data for featured facilities
const featuredFacilities = [

  {
    id: "1",
    title: "Practice Sessions",
    description: "Check open slots for practice sessions",
    image:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      route: "/screens/coach-booking/practiceBooking",
    },
]

// Booking options with availability status
const bookingOptions = [
  {
    title: "Practices",
    icon: "basketball-ball",
    route: "/screens/coach-booking/practiceBooking",
    availability: "High",
    color: "#FF7043",
  }
  
]

const CoachBook = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(bookingOptions)
  const scrollX = useRef(new Animated.Value(0)).current

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

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

  const handleOptionPress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (route) {
      router.push(route)
    }
  }



  const renderFeaturedItem = ({ item, index }) => {
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



  const renderUpcomingBooking = ({ item }) => {
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
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "bold" }}>Coach Bookings</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>Book facilities and services</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}>
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
          {upcomingBookings.length > 0 && (
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
                <TouchableOpacity>
                  <Text style={{ color: COLORS.primary, fontSize: 14 }}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={{ paddingHorizontal: 20 }}>
                <FlatList
                  data={upcomingBookings}
                  renderItem={renderUpcomingBooking}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}

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
                      }}
                    >
                      <Text
                        style={{
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

export default CoachBook


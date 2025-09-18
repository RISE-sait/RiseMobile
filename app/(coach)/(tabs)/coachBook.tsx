import { useState, useRef, useEffect, useMemo, useCallback } from "react"
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
import { useRouter } from "expo-router"
import { FontAwesome5, Ionicons, Feather, AntDesign } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/store"
import { fetchPractices, clearPractices } from "@/store/slices/practicesSlice"
import { fetchEvents } from "@/store/slices/eventsSlice"
import { selectPracticesItems, selectPracticesStatus, selectUpcomingPractices } from "@/store/selectors/practicesSelectors"
import { selectCurrentUser } from "@/store/selectors/userSelectors"
import { useAuth } from "@/utils/auth"
import { API_URL } from "@/utils/api"
import { navigateToDetails } from "@/utils/navigation"
import dayjs from "dayjs"
import EmptyBookingsState from "@/components/feedback/EmptyBookingState"

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

// upcomingBookings now comes from Redux API data - see useMemo below

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
    color: "#FF7043",
  }
  
]

const CoachBook = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { getValidToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(bookingOptions)
  const scrollX = useRef(new Animated.Value(0)).current

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current
  const hasInitializedData = useRef(false)

  // Redux state with memoized selectors
  const practicesItems = useSelector(selectPracticesItems)
  const practicesStatus = useSelector(selectPracticesStatus)
  const upcomingPractices = useSelector(selectUpcomingPractices)
  const eventsItems = useSelector((state: RootState) => state.events.items)
  const eventsStatus = useSelector((state: RootState) => state.events.status)
  const currentUser = useSelector(selectCurrentUser)

  // Get upcoming practices directly from API data without unnecessary transformations
  const upcomingBookings = useMemo(() => {
    
    const today = dayjs();
    
    // Filter for upcoming practices only - use date field from CalendarItem
    const upcomingPractices = practicesItems.filter(practice => {
      // Use date and time from CalendarItem format
      const practiceDateTime = dayjs(`${practice.date} ${practice.time}`, 'YYYY-MM-DD HH:mm');
      const isUpcoming = practiceDateTime.isAfter(today, 'day') || practiceDateTime.isSame(today, 'day');
      




      
      return isUpcoming && practice.id; // Only include practices with valid IDs
    }).sort((a, b) => {
      // Sort by date and time (earliest first)
      const dateA = dayjs(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
      const dateB = dayjs(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
      return dateA.valueOf() - dateB.valueOf();
    }).slice(0, 5); // Limit to 5 most recent

    return upcomingPractices;
  }, [practicesItems, currentUser, practicesStatus]);

  //Function to refresh practices for coaches 
  const refreshPractices = useCallback(async () => {
  if (!currentUser?.token) return
  
  const today = dayjs().format("YYYY-MM-DD")
  const futureDate = dayjs().add(2, "months").format("YYYY-MM-DD")
  
  dispatch(fetchPractices({ token: currentUser.token, after: today, before: futureDate }))
}, [dispatch, currentUser?.token])

  // Force refresh function for debugging
  const forceRefreshData = async () => {
    try {
      
      // Clear existing data
      dispatch(clearPractices());
      
      const token = await getValidToken();
      if (!token) {
        console.error("❌ Failed to get authentication token");
        return;
      }

      const today = dayjs().format("YYYY-MM-DD");
      const futureDate = dayjs().add(2, "months").format("YYYY-MM-DD");
      
      
      dispatch(fetchPractices({ token, after: today, before: futureDate }));
      
      // Reset initialization flag
      hasInitializedData.current = false;
    } catch (error) {
      console.error("❌ Error in force refresh:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchBookingData = async () => {
      // Prevent multiple fetches
      if (hasInitializedData.current) {
        return;
      }

      try {
        // Use centralized token management
        const token = await getValidToken();
        if (!token) {
          console.error("❌ Failed to get authentication token");
          return;
        }

        
        // Only fetch practices for coach booking page if not already loaded
        const today = dayjs().format("YYYY-MM-DD");
        const futureDate = dayjs().add(2, "months").format("YYYY-MM-DD");

        // Only fetch if we haven't loaded practices yet or if it's been idle for too long
        if (practicesStatus === "idle" || practicesItems.length === 0) {
          dispatch(fetchPractices({ token, after: today, before: futureDate }));
        }
        
        // Mark as initialized to prevent repeated fetches
        hasInitializedData.current = true;
        
        // Note: Removed fetchEvents() - coach booking page should only show practices
        // Future: Add haircut bookings or other coach-specific booking fetches here

      } catch (error) {
        console.error("❌ Error fetching booking data:", error);
      }
    };

    fetchBookingData();
  }, [dispatch]); // Only depend on dispatch which is stable

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
      router.push(route as any)
    }
  }



  const renderFeaturedItem = ({ item, index }: { item: any, index: number }) => {
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
    // Use CalendarItem data format - item comes from Redux store
    
    // Format date from CalendarItem format
    const practiceDate = dayjs(item.date);
    const today = dayjs();
    
    // Date display
    let dateDisplay = "Unknown";
    if (practiceDate.isValid()) {
      if (practiceDate.isSame(today, 'day')) {
        dateDisplay = "Today";
      } else if (practiceDate.isSame(today.add(1, 'day'), 'day')) {
        dateDisplay = "Tomorrow";
      } else {
        dateDisplay = practiceDate.format("ddd, MMM DD");
      }
    }
    
    // Time display from CalendarItem
    const timeDisplay = item.time || "TBD";
    
    // Use CalendarItem title and location
    const displayTitle = item.title || "Practice Session";
    const displayLocation = item.location;

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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          // Navigate to appropriate detail page using robust navigation
          const success = navigateToDetails(router, item.type, item.id, currentUser?.role);
          
          if (!success) {
            console.warn("⚠️ Navigation failed, used fallback route");
          }
        }}
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
          <FontAwesome5 name="basketball-ball" size={24} color={COLORS.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "bold" }}>
              {displayTitle}
            </Text>
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: "600" }}>
              Scheduled
            </Text>
          </View>

          {displayLocation && (
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 2 }}>
              {displayLocation}
            </Text>
          )}

          <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 }}>{dateDisplay}</Text>
            <View style={{ width: 1, height: 12, backgroundColor: COLORS.textSecondary, marginHorizontal: 8 }} />
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 }}>{timeDisplay}</Text>
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
{/* Upcoming Practices */}
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
    <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>Upcoming Practices</Text>
    {upcomingBookings.length > 0 && (
      <TouchableOpacity>
        <Text style={{ color: COLORS.primary, fontSize: 14 }}>View All</Text>
      </TouchableOpacity>
    )}
  </View>

  <View style={{ paddingHorizontal: 20 }}>
    {practicesStatus === 'loading' ? (
      <View style={{ 
        backgroundColor: COLORS.card, 
        borderRadius: 12, 
        padding: 20, 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Loading your practices...</Text>
      </View>
    ) : practicesStatus === 'failed' ? (
      <View style={{ 
        backgroundColor: COLORS.card, 
        borderRadius: 12, 
        padding: 20, 
        alignItems: 'center' 
      }}>
        <FontAwesome5 name="exclamation-triangle" size={24} color={COLORS.warning} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
          Failed to load practices
        </Text>
      </View>
    ) : upcomingBookings.length > 0 ? (
      <FlatList
        data={upcomingBookings}
        renderItem={renderUpcomingBooking}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    ) : (
      <EmptyBookingsState 
        userType="coach" 
        onRefresh={refreshPractices}
        isRefreshing={practicesStatus !== 'idle' && practicesStatus !== 'succeeded'}
        colors={{
          card: COLORS.card,
          text: COLORS.text,
          textSecondary: COLORS.textSecondary,
          primary: COLORS.primary
        }}
      />
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
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                      >
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


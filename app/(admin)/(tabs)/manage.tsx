import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react"
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FontAwesome5, Feather, AntDesign } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"
import images from "@/constants/images"
import { resolveImageSource } from "@/utils/imageSource"

const { width } = Dimensions.get("window")
const cardWidth = width * 0.85

// Define color constants
const COLORS = {
  primary: "#FCA311",
  primaryDark: "#D4890E",
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

// Featured management options for admins
const featuredOptions = [
  {
    id: "1",
    title: "Create Practice",
    description: "Schedule practice sessions for teams",
    image:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    route: "/(coach)/screens/coach-booking/practiceBooking",
  },
  {
    id: "2",
    title: "Create Game",
    description: "Schedule and manage team matches",
    image:
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    route: "/(coach)/screens/createMatch",
  },
  {
    id: "3",
    title: "Manage Teams",
    description: "Create teams and manage rosters",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    route: "/(coach)/screens/selectTeamForRoster",
  },
]

// Management options grid - focused on scheduling/team management only (static, defined outside component)
const MANAGEMENT_OPTIONS = [
  {
    title: "Practices",
    icon: "basketball-ball",
    route: "/(coach)/screens/coach-booking/practiceBooking",
    description: "Schedule practices",
    color: "#FF7043",
  },
  {
    title: "Games",
    icon: "trophy",
    route: "/(coach)/screens/createMatch",
    description: "Create matches",
    color: "#8E44AD",
  },
  {
    title: "Teams",
    icon: "users",
    route: "/(coach)/screens/selectTeamForRoster",
    description: "Manage rosters",
    color: "#4CAF50",
  },
  {
    title: "Facilities & Courts",
    icon: "map-marker-alt",
    route: "/(admin)/screens/manage-facilities",
    description: "Manage locations",
    color: "#2196F3",
  },
  {
    title: "Schedule",
    icon: "calendar",
    route: "/(admin)/(tabs)/schedule",
    description: "View calendar",
    color: "#FCA311",
  },
] as const

// Memoized Management Option Card Component
const ManagementOptionCard = memo(({
  option,
  onPress,
}: {
  option: typeof MANAGEMENT_OPTIONS[number]
  onPress: () => void
}) => (
  <TouchableOpacity
    style={{
      width: "48%",
      height: 120,
      backgroundColor: COLORS.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      justifyContent: "space-between",
    }}
    activeOpacity={0.8}
    onPress={onPress}
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
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: option.color + "20",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome5 name={option.icon} size={20} color={option.color} />
      </View>
    </View>

    <View>
      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "600" }}>{option.title}</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>
        {option.description}
      </Text>
    </View>
  </TouchableOpacity>
))

const AdminManage = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const scrollX = useRef(new Animated.Value(0)).current

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  // Start animations when component mounts (only once)
  useEffect(() => {
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
  }, [])

  // Memoized filtered options - only recalculates when searchQuery changes
  const filteredOptions = useMemo(() => {
    if (searchQuery.trim() === "") {
      return MANAGEMENT_OPTIONS
    }
    return MANAGEMENT_OPTIONS.filter((option) =>
      option.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Memoized handler to prevent recreation on every render
  const handleOptionPress = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (route) {
      router.push(route as any)
    }
  }, [router])

  // Memoized render function for featured items
  const renderFeaturedItem = useCallback(({ item, index }: { item: any; index: number }) => {
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
            source={resolveImageSource(item.image, images.events)}
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
  }, [scrollX, handleOptionPress])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />

      {/* Header */}
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
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "bold" }}>Manage</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>
            Teams, games, and schedules
          </Text>
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
              placeholder="Search management options..."
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

          {/* Featured Management Options */}
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
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>Quick Actions</Text>
            </View>

            <Animated.FlatList
              data={featuredOptions}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + 20}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 10 }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
            />
          </View>

          {/* All Management Options Grid */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "bold" }}>All Options</Text>
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
                <ManagementOptionCard
                  key={option.title}
                  option={option}
                  onPress={() => handleOptionPress(option.route)}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AdminManage

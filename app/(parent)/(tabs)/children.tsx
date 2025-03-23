

import { useState, useEffect, useRef } from "react"
import { Text, View, TouchableOpacity, Image, StyleSheet, Animated, Dimensions, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import images from "@/constants/images"
import PageTitle from "@/components/PageTitle"
import LoadingIndicator from "@/components/LoadingIndicator"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9

// Mock children data - in a real app, this would come from an API
const mockChildren = [
  {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    age: 12,
    sport: "Basketball",
    profileImage: null,
    jerseyNumber: "23",
    team: "Rising Stars",
    position: "Point Guard",
    upcomingEvents: 3,
    teamColors: ["#C8102E", "#1D428A"], // Red and blue (basketball team colors)
    stats: {
      gamesPlayed: 14,
      avgPoints: 18.5,
      attendance: 92,
    },
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 14,
    sport: "Volleyball",
    profileImage: null,
    jerseyNumber: "7",
    team: "Elite Spikers",
    position: "Outside Hitter",
    upcomingEvents: 2,
    teamColors: ["#4B2E83", "#85754D"], // Purple and gold (volleyball team colors)
    stats: {
      gamesPlayed: 12,
      avgPoints: 14.2,
      attendance: 96,
    },
  },
]

// Sport-specific icons
const sportIcons = {
  Basketball: "basketball",
  Volleyball: "volleyball",
  Soccer: "soccer",
  Football: "football",
  Baseball: "baseball",
  Tennis: "tennis",
  Swimming: "swim",
  Track: "run-fast",
  Golf: "golf",
  Hockey: "hockey-sticks",
}

export default function ChildrenScreen() {
  const router = useRouter()
  const [children, setChildren] = useState(mockChildren)
  const [loading, setLoading] = useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scrollY = useRef(new Animated.Value(0)).current

  // Animation values for each card
  const cardAnimations = useRef(children.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setLoading(false)

      // Fade in the entire screen
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()

      // Staggered animation for each card
      children.forEach((_, index) => {
        Animated.timing(cardAnimations[index], {
          toValue: 1,
          duration: 500,
          delay: 100 * index,
          useNativeDriver: true,
        }).start()
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleAddChild = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }

    console.log("🔄 Navigating to add-child screen")

    // Use a try-catch block to catch any navigation errors
    try {
      router.push("/(parent)/screens/add-child")
    } catch (error) {
      console.error("❌ Navigation error:", error)
      Alert.alert("Navigation Error", "Could not navigate to the Add Child screen. Please try again.")
    }
  }

  const handleChildPress = (childId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    router.push(`/screens/child-details/${childId}`)
  }

  const handleSchedulePress = (childId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    router.push(`/screens/child-schedule/${childId}`)
  }

  if (loading) {
    return <LoadingIndicator />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Main content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Page Title */}
        <PageTitle title="Your Children" />

        {children.map((child, index) => {
          // Calculate card animation values
          const translateY = cardAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })

          const opacity = cardAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          })

          return (
            <Animated.View key={child.id} style={[styles.cardContainer, { opacity, transform: [{ translateY }] }]}>
              <TouchableOpacity
                onPress={() => handleChildPress(child.id)}
                activeOpacity={0.9}
                style={styles.cardTouchable}
              >
                <LinearGradient
                  colors={["#1A1A1A", "#252525"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  {/* Card Header with Team Colors */}
                  <LinearGradient
                    colors={child.teamColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cardHeader}
                  >
                    <View style={styles.sportIconContainer}>
                      <MaterialCommunityIcons name={sportIcons[child.sport] || "trophy"} size={18} color="#FFF" />
                    </View>
                    <Text style={styles.sportText}>{child.sport}</Text>
                    <View style={styles.teamBadge}>
                      <Text style={styles.teamText}>{child.team}</Text>
                    </View>
                  </LinearGradient>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.profileSection}>
                      <View style={styles.imageContainer}>
                        <Image
                          source={child.profileImage ? { uri: child.profileImage } : images.headshot}
                          style={styles.childImage}
                        />
                        <View style={styles.jerseyBadge}>
                          <Text style={styles.jerseyNumber}>#{child.jerseyNumber}</Text>
                        </View>
                      </View>

                      <View style={styles.infoContainer}>
                        <Text style={styles.nameText}>
                          {child.firstName} {child.lastName}
                        </Text>
                        <Text style={styles.positionText}>{child.position}</Text>
                        <View style={styles.ageBadge}>
                          <Text style={styles.ageText}>{child.age} years</Text>
                        </View>
                      </View>
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{child.stats.gamesPlayed}</Text>
                        <Text style={styles.statLabel}>Games</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{child.stats.avgPoints}</Text>
                        <Text style={styles.statLabel}>Avg Pts</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{child.stats.attendance}%</Text>
                        <Text style={styles.statLabel}>Attendance</Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionContainer}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleSchedulePress(child.id)}>
                        <LinearGradient
                          colors={["rgba(255,215,0,0.15)", "rgba(255,215,0,0.05)"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.actionButtonGradient}
                        >
                          <Ionicons name="calendar-outline" size={18} color="#FFD700" />
                          <Text style={styles.actionButtonText}>{child.upcomingEvents} Upcoming</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionButton} onPress={() => handleChildPress(child.id)}>
                        <LinearGradient
                          colors={["rgba(255,215,0,0.15)", "rgba(255,215,0,0.05)"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.actionButtonGradient}
                        >
                          <Text style={styles.actionButtonText}>Profile</Text>
                          <Ionicons name="chevron-forward" size={18} color="#FFD700" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )
        })}

        {/* Add Child Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            marginTop: 15,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity style={styles.addChildCardContainer} onPress={handleAddChild} activeOpacity={0.8}>
            <LinearGradient
              colors={["#1A1A1A", "#252525"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addChildCard}
            >
              <View style={styles.addChildContent}>
                <View style={styles.addIconContainer}>
                  <LinearGradient
                    colors={["#FFD700", "#FFA500"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addIconGradient}
                  >
                    <Ionicons name="add" size={30} color="#000" />
                  </LinearGradient>
                </View>
                <View style={styles.addChildTextContainer}>
                  <Text style={styles.addChildTitle}>Add Another Athlete</Text>
                  <Text style={styles.addChildSubtitle}>Register your child to track their progress</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTouchable: {
    borderRadius: 20,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sportIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  sportText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  teamBadge: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  teamText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  cardContent: {
    padding: 10,
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 15,
  },
  imageContainer: {
    position: "relative",
    marginRight: 15,
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  jerseyBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FFD700",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#0C0B0B",
  },
  jerseyNumber: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  positionText: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 8,
  },
  ageBadge: {
    backgroundColor: "#333333",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageText: {
    color: "#FFD700",
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#333333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  actionButtonText: {
    color: "#FFD700",
    marginHorizontal: 5,
    fontWeight: "500",
  },
  addChildCardContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  addChildCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderStyle: "dashed",
  },
  addChildContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  addIconContainer: {
    marginRight: 15,
    borderRadius: 25,
    overflow: "hidden",
  },
  addIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addChildTextContainer: {
    flex: 1,
  },
  addChildTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  addChildSubtitle: {
    color: "#AAAAAA",
    fontSize: 14,
  },
})


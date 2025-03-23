import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Animated, Modal, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { LineChart } from "react-native-chart-kit"
import BackButton from "@/app/components/BackButton"
import LoadingIndicator from "@/app/components/LoadingIndicator"
import images from "@/constants/images"
import { mockMatches } from "@/app/(athlete)/screens/matchesData"
import dayjs from "dayjs"

// Get screen dimensions
const { width, height } = Dimensions.get("window")

// Mock child data - in a real app, this would come from an API
const mockChildren = {
  "1": {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    age: 12,
    sport: "Basketball",
    profileImage: null,
    jerseyNumber: "23",
    team: "Rising Stars",
    position: "Point Guard",
    height: "5'2\"",
    weight: "110 lbs",
    coach: "Coach Williams",
    stats: {
      points: 12.5,
      rebounds: 3.2,
      assists: 4.8,
      steals: 1.5,
      lastGames: [8, 14, 10, 16, 15, 12],
    },
    achievements: ["MVP - Summer League 2023", "All-Star Team Selection", "Most Improved Player"],
    sportIcon: "basketball",
    teamColors: ["#C9082A", "#17408B"],
  },
  "2": {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 14,
    sport: "Volleyball",
    profileImage: null,
    jerseyNumber: "7",
    team: "Elite Spikers",
    position: "Outside Hitter",
    height: "5'6\"",
    weight: "125 lbs",
    coach: "Coach Martinez",
    stats: {
      kills: 8.3,
      blocks: 2.1,
      aces: 3.5,
      digs: 6.2,
      lastGames: [7, 9, 8, 10, 7, 11],
    },
    achievements: ["Best Server Award", "Regional Championship Winner", "Team Captain"],
    sportIcon: "volleyball-ball",
    teamColors: ["#FF6B00", "#004D98"],
  },
}

// Custom Alert Modal Component
const CustomAlert = ({ visible, title, message, onClose }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} style={styles.blurContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalMessage}>{message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  )
}


// Stat Card Component
const StatCard = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <LinearGradient colors={["#1A1A1A", "#252525"]} style={styles.statCardGradient}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <FontAwesome5 name={icon} size={16} color="#FFF" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  </View>
)

export default function ChildDetailsScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [child, setChild] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerHeight = useRef(new Animated.Value(0)).current

  // Animation for tab indicator
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // In a real app, fetch child data from API
    setTimeout(() => {
      setChild(mockChildren[id as string])
      setLoading(false)

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerHeight, {
          toValue: 220,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start()
    }, 500)
  }, [id])

  useEffect(() => {
    // Animate tab indicator
    let position = 0
    if (activeTab === "stats") position = width / 3
    else if (activeTab === "documents") position = (width / 3) * 2

    Animated.spring(tabIndicatorPosition, {
      toValue: position,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start()
  }, [activeTab])

  const showAlert = (title, message) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertVisible(true)
  }

  const handleTabChange = (tab) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    setActiveTab(tab)
  }

  const handleSchedulePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    router.push(`/screens/child-schedule/${id}`)
  }

  const handleEditPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    showAlert("Coming Soon", "Edit functionality will be available soon.")
  }

  if (loading) {
    return <LoadingIndicator />
  }

  if (!child) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
        <Text className="text-white">Child not found</Text>
      </SafeAreaView>
    )
  }

  // Get upcoming events for this child
  const today = dayjs().format("YYYY-MM-DD")
  const upcomingEvents = mockMatches
    .filter(
      (match) =>
        dayjs(match.date).isAfter(today) &&
        // In a real app, filter by childId
        (child.sport === "Basketball" ? match.type === "match" : match.type === "practice"),
    )
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
    .slice(0, 3)

  // Chart data for performance
  const chartData = {
    labels: ["Game 1", "Game 2", "Game 3", "Game 4", "Game 5", "Game 6"],
    datasets: [
      {
        data: child.stats.lastGames,
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Points per Game"],
  }

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  }

  // Get sport-specific stats
  const sportStats =
    child.sport === "Basketball"
      ? [
          { label: "PPG", value: child.stats.points, icon: "basketball-ball", color: child.teamColors[0] },
          { label: "RPG", value: child.stats.rebounds, icon: "hand-rock", color: child.teamColors[1] },
          { label: "APG", value: child.stats.assists, icon: "hands-helping", color: "#4CAF50" },
          { label: "SPG", value: child.stats.steals, icon: "running", color: "#9C27B0" },
        ]
      : [
          { label: "Kills", value: child.stats.kills, icon: "fist-raised", color: child.teamColors[0] },
          { label: "Blocks", value: child.stats.blocks, icon: "hand-paper", color: child.teamColors[1] },
          { label: "Aces", value: child.stats.aces, icon: "bolt", color: "#4CAF50" },
          { label: "Digs", value: child.stats.digs, icon: "diving-helmet", color: "#9C27B0" },
        ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* Header Section */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[...child.teamColors, "#0C0B0B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <BackButton />

            <View style={styles.profileContainer}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={child.profileImage ? { uri: child.profileImage } : images.headshot}
                  style={styles.profileImage}
                />
                <View style={styles.jerseyBadgeContainer}>
                  <LinearGradient colors={child.teamColors} style={styles.jerseyBadge}>
                    <Text style={styles.jerseyNumber}>#{child.jerseyNumber}</Text>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.nameContainer}>
                <Text style={styles.playerName}>
                  {child.firstName} {child.lastName}
                </Text>
                <View style={styles.infoRow}>
                  <FontAwesome5 name={child.sportIcon} size={14} color="#FFD700" />
                  <Text style={styles.playerInfo}>{child.sport}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.playerInfo}>{child.age} yrs</Text>
                  <View style={styles.dot} />
                  <Text style={styles.playerInfo}>{child.position}</Text>
                </View>
                <View style={styles.teamContainer}>
                  <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.teamBadge}>
                    <Text style={styles.teamName}>{child.team}</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSchedulePress}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="calendar" size={16} color="#FFD700" />
                  <Text style={styles.actionButtonText}>Schedule</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="pencil" size={16} color="#FFD700" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabChange("overview")}>
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabChange("stats")}>
          <Text style={[styles.tabText, activeTab === "stats" && styles.activeTabText]}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabChange("documents")}>
          <Text style={[styles.tabText, activeTab === "documents" && styles.activeTabText]}>Documents</Text>
        </TouchableOpacity>

        {/* Animated Tab Indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabIndicatorPosition }],
            },
          ]}
        />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingBottom: 30,
          }}
        >
          {activeTab === "overview" && (
            <View style={styles.tabContent}>
              {/* Team Information */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Team Information</Text>
                  <LinearGradient
                    colors={child.teamColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.teamColorBar}
                  />
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Team</Text>
                      <Text style={styles.infoValue}>{child.team}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Position</Text>
                      <Text style={styles.infoValue}>{child.position}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Coach</Text>
                      <Text style={styles.infoValue}>{child.coach}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Jersey #</Text>
                      <Text style={styles.infoValue}>{child.jerseyNumber}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Physical Information */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Physical Information</Text>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Age</Text>
                      <Text style={styles.infoValue}>{child.age} years</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Height</Text>
                      <Text style={styles.infoValue}>{child.height}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Weight</Text>
                      <Text style={styles.infoValue}>{child.weight}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Sport</Text>
                      <Text style={styles.infoValue}>{child.sport}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Upcoming Events */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Events</Text>
                  <TouchableOpacity onPress={handleSchedulePress}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {upcomingEvents.length > 0 ? (
                  <View>
                    {upcomingEvents.map((event, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.eventCard}
                        activeOpacity={0.8}
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          } catch (error) {
                            console.log("Haptics not available")
                          }
                          router.push(`/screens/event-details/${event.id}`)
                        }}
                      >
                        <LinearGradient
                          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                          style={styles.eventCardGradient}
                        >
                          <View style={styles.eventDateContainer}>
                            <Text style={styles.eventMonth}>{dayjs(event.date).format("MMM")}</Text>
                            <Text style={styles.eventDay}>{dayjs(event.date).format("DD")}</Text>
                          </View>

                          <View style={styles.eventDetails}>
                            <View
                              style={[
                                styles.eventTypeBadge,
                                { backgroundColor: event.type === "match" ? child.teamColors[0] : child.teamColors[1] },
                              ]}
                            >
                              <Text style={styles.eventTypeText}>{event.type.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventTime}>{event.time}</Text>
                          </View>

                          <View style={styles.eventArrow}>
                            <AntDesign name="right" size={16} color="#FFD700" />
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noEventsContainer}>
                    <Text style={styles.noEventsText}>No upcoming events</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === "stats" && (
            <View style={styles.tabContent}>
              {/* Performance Chart */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Performance Trend</Text>
                  <Text style={styles.chartSubtitle}>Last 6 Games</Text>
                </View>

                <View style={styles.chartContainer}>
                  <LineChart
                    data={chartData}
                    width={width - 40}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />
                </View>
              </View>

              {/* Key Stats */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Season Statistics</Text>
                </View>

                <View style={styles.statsGrid}>
                  {sportStats.map((stat, index) => (
                    <StatCard key={index} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
                  ))}
                </View>
              </View>

              {/* Detailed Stats */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Performance Breakdown</Text>
                </View>

                <View style={styles.statsBreakdown}>
                  {sportStats.map((stat, index) => (
                    <View key={index} style={styles.statBarContainer}>
                      <View style={styles.statBarHeader}>
                        <Text style={styles.statBarLabel}>{stat.label}</Text>
                        <Text style={styles.statBarValue}>{stat.value}</Text>
                      </View>
                      <View style={styles.statBarBackground}>
                        <LinearGradient
                          colors={[stat.color, stat.color + "80"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.statBarFill,
                            {
                              width: `${
                                (stat.value /
                                  (stat.label === "PPG"
                                    ? 30
                                    : stat.label === "RPG"
                                      ? 15
                                      : stat.label === "APG"
                                        ? 10
                                        : stat.label === "SPG"
                                          ? 5
                                          : stat.label === "Kills"
                                            ? 15
                                            : stat.label === "Blocks"
                                              ? 5
                                              : stat.label === "Aces"
                                                ? 5
                                                : 10)) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* View Detailed Stats Button */}
              <TouchableOpacity
                style={styles.detailedStatsButton}
                activeOpacity={0.8}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  } catch (error) {
                    console.log("Haptics not available")
                  }
                  showAlert("Coming Soon", "Detailed stats will be available soon.")
                }}
              >
                <LinearGradient
                  colors={child.teamColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.detailedStatsGradient}
                >
                  <Text style={styles.detailedStatsText}>View Detailed Stats</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "documents" && (
            <View style={styles.tabContent}>
              {/* Documents List */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Important Documents</Text>
                </View>

                <View style={styles.documentsContainer}>
                  <TouchableOpacity
                    style={styles.documentCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      } catch (error) {
                        console.log("Haptics not available")
                      }
                      showAlert("Download Started", "Medical Release Form is downloading...")
                    }}
                  >
                    <View style={styles.documentIconContainer}>
                      <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={styles.documentIconGradient}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFF" />
                      </LinearGradient>
                    </View>

                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>Medical Release Form</Text>
                      <Text style={styles.documentDate}>Uploaded on Jan 15, 2023</Text>
                      <View style={styles.documentStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Required</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.documentDownload}>
                      <Ionicons name="download-outline" size={22} color="#FFD700" />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.documentCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      } catch (error) {
                        console.log("Haptics not available")
                      }
                      showAlert("Download Started", "Liability Waiver is downloading...")
                    }}
                  >
                    <View style={styles.documentIconContainer}>
                      <LinearGradient colors={["#4CAF50", "#8BC34A"]} style={styles.documentIconGradient}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFF" />
                      </LinearGradient>
                    </View>

                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>Liability Waiver</Text>
                      <Text style={styles.documentDate}>Uploaded on Jan 15, 2023</Text>
                      <View style={styles.documentStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Required</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.documentDownload}>
                      <Ionicons name="download-outline" size={22} color="#FFD700" />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.documentCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      } catch (error) {
                        console.log("Haptics not available")
                      }
                      showAlert("Download Started", "Player Registration is downloading...")
                    }}
                  >
                    <View style={styles.documentIconContainer}>
                      <LinearGradient colors={["#2196F3", "#03A9F4"]} style={styles.documentIconGradient}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFF" />
                      </LinearGradient>
                    </View>

                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>Player Registration</Text>
                      <Text style={styles.documentDate}>Uploaded on Jan 15, 2023</Text>
                      <View style={styles.documentStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Required</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.documentDownload}>
                      <Ionicons name="download-outline" size={22} color="#FFD700" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Upload Document Button */}
              <TouchableOpacity
                style={styles.uploadDocumentButton}
                activeOpacity={0.8}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  } catch (error) {
                    console.log("Haptics not available")
                  }
                  showAlert("Coming Soon", "Document upload will be available soon.")
                }}
              >
                <LinearGradient
                  colors={["rgba(255,215,0,0.1)", "rgba(255,165,0,0.1)"]}
                  style={styles.uploadDocumentGradient}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color="#FFD700" />
                  <Text style={styles.uploadDocumentText}>Upload New Document</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Document Requirements */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Required Documents</Text>
                </View>

                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsText}>All athletes must have the following documents on file:</Text>
                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.requirementText}>Medical Release Form</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.requirementText}>Liability Waiver</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.requirementText}>Player Registration</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                      <Text style={styles.requirementText}>Physical Examination</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          } catch (error) {
            console.log("Haptics not available")
          }
          showAlert("Quick Actions", "Quick actions will be available soon.")
        }}
      >
        <LinearGradient colors={child.teamColors} style={styles.fabGradient}>
          <Ionicons name="add" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  jerseyBadgeContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
  },
  jerseyBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0C0B0B",
  },
  jerseyNumber: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  playerInfo: {
    color: "#CCC",
    fontSize: 14,
    marginLeft: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    marginHorizontal: 5,
  },
  teamContainer: {
    marginTop: 8,
  },
  teamBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamName: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  actionButton: {
    marginHorizontal: 5,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: "#FFD700",
    marginLeft: 5,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    margin: 15,
    position: "relative",
    height: 45,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    color: "#AAA",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: width / 3,
    backgroundColor: "#FFD700",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    color: "#FFD700",
    fontSize: 14,
  },
  achievementsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  achievementBadge: {
    marginRight: 10,
  },
  achievementGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  achievementIcon: {
    marginRight: 5,
  },
  achievementText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  teamColorBar: {
    height: 3,
    width: 30,
    borderRadius: 1.5,
  },
  infoCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: "#AAA",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  eventCard: {
    marginBottom: 10,
  },
  eventCardGradient: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  eventDateContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  eventMonth: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },
  eventDay: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  eventDetails: {
    flex: 1,
    marginLeft: 12,
  },
  eventTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  eventTypeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  eventTime: {
    color: "#AAA",
    fontSize: 12,
  },
  eventArrow: {
    width: 30,
    alignItems: "center",
  },
  noEventsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  noEventsText: {
    color: "#AAA",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    borderRadius: 12,
  },
  chartSubtitle: {
    color: "#AAA",
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    marginBottom: 10,
  },
  statCardGradient: {
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 5,
  },
  statsBreakdown: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
  },
  statBarContainer: {
    marginBottom: 12,
  },
  statBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  statBarLabel: {
    color: "#AAA",
    fontSize: 12,
  },
  statBarValue: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  statBarBackground: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
  },
  statBarFill: {
    height: 6,
    borderRadius: 3,
  },
  detailedStatsButton: {
    marginTop: 10,
  },
  detailedStatsGradient: {
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  detailedStatsText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  documentIconContainer: {
    marginRight: 15,
  },
  documentIconGradient: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  documentDate: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
  },
  documentStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  statusText: {
    color: "#4CAF50",
    fontSize: 12,
  },
  documentDownload: {
    padding: 5,
  },
  uploadDocumentButton: {
    marginBottom: 20,
  },
  uploadDocumentGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderStyle: "dashed",
  },
  uploadDocumentText: {
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 10,
  },
  requirementsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
  },
  requirementsText: {
    color: "#FFF",
    marginBottom: 10,
  },
  requirementsList: {
    marginTop: 5,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    color: "#CCC",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  blurContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  modalTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
})


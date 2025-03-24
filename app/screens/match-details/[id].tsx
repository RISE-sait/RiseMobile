"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Linking,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import { mockMatches, type MatchDetails } from "@/app/(athlete)/screens/matchesData"
import dayjs from "dayjs"
import { FontAwesome6 } from "@expo/vector-icons"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import { API_URL } from "@/utils/api"

const { width } = Dimensions.get("window")

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369", bgColor: "rgba(255, 211, 105, 0.15)" },
  Finished: { label: "Final", color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.15)" },
  Live: { label: "Live", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
}

// Instagram profile URL - replace with your actual profile URL
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/yourprofile"

// Helper function to check if a string is a valid UUID
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

// Helper function to extract title from different field names
const extractTitle = (data: any): string => {
  // Log the data to see what we're working with
  console.log("Extracting title from data:", data)

  if (data.title) return data.title
  if (data.name) return data.name
  if (data.game_name) return data.game_name
  if (data.match_name) return data.match_name
  if (data.event_name) return data.event_name

  // For games, check for team names to create a title
  if (data.home_team && data.away_team) {
    return `${data.home_team} vs ${data.away_team}`
  }

  return "Basketball Game"
}

// Helper function to extract video link if available
const extractVideoLink = (data: any): string | null => {
  if (data.video_link) return data.video_link
  if (data.videoLink) return data.videoLink
  if (data.video) return data.video
  if (data.video_url) return data.video_url

  return null
}

const MatchDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoLink, setVideoLink] = useState<string | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Define fallbackToMockData BEFORE it's used
  const fallbackToMockData = () => {
    console.log("Using mock data as fallback for game")

    // Find the match by ID in mock data
    const foundMatch = mockMatches.find((m) => m.id === id)

    if (foundMatch) {
      setMatch(foundMatch)
    } else {
      // Create default mock data if not found
      const defaultMatch: MatchDetails = {
        id: id as string,
        homeTeam: "RISE Ballers",
        awayTeam: "City Hoops",
        homeScore: 87,
        awayScore: 82,
        league: "Summer Basketball League",
        status: "Finished",
        date: new Date().toISOString(),
        location: "RISE Main Court",
        description:
          "An exciting game between two top teams in the league. The RISE Ballers secured a narrow victory with clutch shooting in the final minutes.",
        homeLogo: "https://via.placeholder.com/100",
        awayLogo: "https://via.placeholder.com/100",
        bgImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a",
        type: "match", // Add the required 'type' property
      }

      setMatch(defaultMatch)
    }
  }

  useEffect(() => {
    // Start animations
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
    ]).start()

    // Fetch game data from API
    const fetchGameData = async () => {
      try {
        setLoading(true)

        // Check if the ID is already a valid UUID
        const gameId = isValidUUID(id as string) ? id : null

        // If we don't have a valid UUID, fall back to mock data
        if (!gameId) {
          console.log("Invalid UUID format, using mock data")
          fallbackToMockData()
          setLoading(false)
          return
        }

        // Log the request details for debugging
        console.log("Making API request to:", `${API_URL}/games/${gameId}`)

        try {
          const response = await axios.get(`${API_URL}/games/${gameId}`, {
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("API Response:", response.data)

          if (response.data) {
            const gameData = response.data

            // Extract video link if available
            const extractedVideoLink = extractVideoLink(gameData)
            if (extractedVideoLink) {
              setVideoLink(extractedVideoLink)
            }

            // Get the title from the API response
            const title = extractTitle(gameData)
            console.log("Extracted title:", title)

            // Create a match details object with the minimal data we have
            // and fill in defaults for missing fields
            const matchDetails: MatchDetails = {
              id: gameData.id || (id as string),
              homeTeam: gameData.home_team || gameData.homeTeam || "Home Team",
              awayTeam: gameData.away_team || gameData.awayTeam || "Away Team",
              homeScore: gameData.home_score || gameData.homeScore || 0,
              awayScore: gameData.away_score || gameData.awayScore || 0,
              league: gameData.league || gameData.tournament || title || "Basketball League",
              status: gameData.status || "Finished",
              date: gameData.date || gameData.game_date || new Date().toISOString(),
              location: gameData.location || gameData.venue || "RISE Basketball Court",
              description:
                gameData.description ||
                gameData.details ||
                `Watch this exciting match: ${title}. ${extractedVideoLink ? "Video available." : ""}`,
              homeLogo: gameData.home_logo || gameData.homeLogo || "https://via.placeholder.com/100",
              awayLogo: gameData.away_logo || gameData.awayLogo || "https://via.placeholder.com/100",
              bgImage:
                gameData.image ||
                gameData.background_image ||
                gameData.bgImage ||
                "https://images.unsplash.com/photo-1504450758481-7338eba7524a",
              type: "match",
            }

            setMatch(matchDetails)
          } else {
            fallbackToMockData()
          }
        } catch (error) {
          // Enhanced error logging
          if (axios.isAxiosError(error)) {
            console.error("API Error Details:", {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              url: error.config?.url,
              method: error.config?.method,
            })
          }
          fallbackToMockData()
        } finally {
          setLoading(false)
        }
      } catch (error) {
        console.error("General error:", error)
        fallbackToMockData()
        setLoading(false)
      }
    }

    fetchGameData()
  }, [id])

  const handleShare = async () => {
    if (!match) return

    try {
      await Share.share({
        message: `Check out this match: ${match.homeTeam} vs ${match.awayTeam} on ${dayjs(match.date).format("MMMM D, YYYY")} at ${match.location}.`,
        title: `${match.homeTeam} vs ${match.awayTeam}`,
      })
    } catch (error) {
      console.error("Error sharing match:", error)
    }
  }

  const openInstagramProfile = () => {
    Linking.openURL(INSTAGRAM_PROFILE_URL).catch((err) => console.error("Error opening Instagram profile:", err))
  }

  const openVideoLink = () => {
    if (videoLink) {
      Linking.openURL(videoLink).catch((err) => {
        console.error("Error opening video link:", err)
        Alert.alert("Error", "Could not open video link")
      })
    }
  }

  if (loading || !match) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.loadingText}>{loading ? "Loading match details..." : "Match not found"}</Text>
      </SafeAreaView>
    )
  }

  const { color, label, bgColor } = statusStyles[match.status]

  // Basketball stats (mock data - in a real app, this would come from your API)
  const basketballStats = {
    home: {
      rebounds: 42,
      assists: 23,
      steals: 8,
      blocks: 5,
    },
    away: {
      rebounds: 38,
      assists: 19,
      steals: 10,
      blocks: 3,
    },
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Match Image Header */}
          <ImageBackground source={{ uri: match.bgImage }} style={styles.headerImage} resizeMode="cover">
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.7)"]}
              locations={[0, 0.3, 0.6, 1]}
              style={styles.headerGradient}
            />
          </ImageBackground>

          {/* Back Button Container */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>

          {/* Match Details */}
          <View style={styles.detailsContainer}>
            {/* League Title and Status */}
            <View style={styles.headerRow}>
              <Text style={styles.leagueTitle}>{match.league}</Text>
              <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Text style={[styles.statusText, { color }]}>{label}</Text>
              </View>
            </View>

            {/* Teams and Score */}
            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                <Image source={{ uri: match.homeLogo }} style={styles.teamLogo} resizeMode="contain" />
                <Text style={styles.teamName}>{match.homeTeam}</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  {match.homeScore} - {match.awayScore}
                </Text>
                {match.status === "Live" && (
                  <View style={styles.liveIndicator}>
                    <FontAwesome6 name="circle-dot" size={8} color="#EF4444" />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              <View style={styles.teamColumn}>
                <Image source={{ uri: match.awayLogo }} style={styles.teamLogo} resizeMode="contain" />
                <Text style={styles.teamName}>{match.awayTeam}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <EventInfoRow icon="calendar" text={dayjs(match.date).format("dddd, MMMM D, YYYY")} />
              <EventInfoRow icon="clock" text={match.time} />
              <EventInfoRow icon="map-marker-alt" text={match.location} />
              <EventInfoRow icon="user" text={`Organized by: ${match.organizer}`} />
            </View>

            {/* Video Link Button (if available) */}
            {videoLink && (
              <TouchableOpacity style={styles.videoButton} onPress={openVideoLink}>
                <FontAwesome6 name="play-circle" size={20} color="#FFFFFF" style={styles.videoIcon} />
                <Text style={styles.videoButtonText}>Watch Game Video</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Match Highlights</Text>
            <Text style={styles.description}>{match.description}</Text>

            {/* Basketball Stats Section */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Game Stats</Text>

            <View style={styles.statsContainer}>
              {/* Simple Basketball Stats */}
              <View style={styles.statHeader}>
                <Text style={styles.statHeaderTeam}>{match.homeTeam}</Text>
                <Text style={styles.statHeaderLabel}>STAT</Text>
                <Text style={styles.statHeaderTeam}>{match.awayTeam}</Text>
              </View>

              {/* Rebounds */}
              <View style={styles.statRow}>
                <Text style={styles.statValueHome}>{basketballStats.home.rebounds}</Text>
                <Text style={styles.statLabel}>Rebounds</Text>
                <Text style={styles.statValueAway}>{basketballStats.away.rebounds}</Text>
              </View>

              {/* Assists */}
              <View style={styles.statRow}>
                <Text style={styles.statValueHome}>{basketballStats.home.assists}</Text>
                <Text style={styles.statLabel}>Assists</Text>
                <Text style={styles.statValueAway}>{basketballStats.away.assists}</Text>
              </View>

              {/* Steals */}
              <View style={styles.statRow}>
                <Text style={styles.statValueHome}>{basketballStats.home.steals}</Text>
                <Text style={styles.statLabel}>Steals</Text>
                <Text style={styles.statValueAway}>{basketballStats.away.steals}</Text>
              </View>

              {/* Blocks */}
              <View style={styles.statRow}>
                <Text style={styles.statValueHome}>{basketballStats.home.blocks}</Text>
                <Text style={styles.statLabel}>Blocks</Text>
                <Text style={styles.statValueAway}>{basketballStats.away.blocks}</Text>
              </View>
            </View>

            {/* Spacer for bottom buttons */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <FontAwesome6 name="share-nodes" size={22} color="#FCA311" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.instagramButton} onPress={openInstagramProfile}>
            <FontAwesome6 name="instagram" size={18} color="#FFFFFF" style={styles.instagramIcon} />
            <Text style={styles.instagramButtonText}>Follow Us on Instagram</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  headerImage: {
    height: 300,
    width: "100%",
  },
  headerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: -50, // Increased to bring the container up more
    backgroundColor: "#0C0B0B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  leagueTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
  },
  teamColumn: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  videoButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  videoIcon: {
    marginRight: 8,
  },
  videoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
  },
  statsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  statHeaderTeam: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    width: 80,
    textAlign: "center",
  },
  statHeaderLabel: {
    color: "#999999",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  statLabel: {
    color: "#CCCCCC",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  statValueHome: {
    color: "#FCA311",
    fontSize: 16,
    fontWeight: "bold",
    width: 80,
    textAlign: "center",
  },
  statValueAway: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "bold",
    width: 80,
    textAlign: "center",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(12, 11, 11, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(252, 163, 17, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  instagramButton: {
    flex: 1,
    backgroundColor: "#8a3ab9", // Instagram purple
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  instagramIcon: {
    marginRight: 8,
  },
  instagramButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
})

export default MatchDetailsScreen


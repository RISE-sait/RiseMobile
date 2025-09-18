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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import dayjs from "dayjs"
import { FontAwesome6 } from "@expo/vector-icons"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import ManagedImage from "@/components/ui/ManagedImage"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import axios from "axios"
import { API_URL } from "@/utils/api"
import LoadingIndicator from "@/components/feedback/LoadingIndicator"
import { fetchTeams, selectTeamById, selectTeamsLoading } from "@/store/slices/teamsSlice"
import { selectAllMatches } from "@/store/slices/gamesSlice"

const { width } = Dimensions.get("window")

const statusStyles = {
  scheduled: { label: "SCHEDULED", color: "#FFD369", bgColor: "rgba(255, 211, 105, 0.15)" },
  in_progress: { label: "IN PROGRESS", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  completed: { label: "COMPLETED", color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.15)" },
  canceled: { label: "CANCELED", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.15)" },
}

// Instagram profile URL - replace with your actual profile URL
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/yourprofile"

interface GameData {
  id: string
  name?: string
  description?: string
  win_team?: string
  lose_team?: string
  win_score?: number
  lose_score?: number
  created_at?: string
  updated_at?: string
  status?: string // Add status field from API
  home_team_logo_url?: string
  away_team_logo_url?: string
}

const MatchDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.data)
  const token = userData?.token
  
  // Get all matches from Redux store to find the specific match
  const allMatches = useAppSelector(selectAllMatches)

  // Extract the ID from params and ensure it's a clean string
  const rawId = id
  // Log the raw ID we received
  console.log(`MATCH DETAILS: Raw ID from params:`, rawId)

  // Clean the ID - ensure it's a string and remove any query parameters
  const programId =
    typeof rawId === "string"
      ? rawId.split("?")[0]
      : Array.isArray(rawId)
        ? rawId[0].split("?")[0]
        : String(rawId).split("?")[0]

  // Log the cleaned ID
  console.log(`MATCH DETAILS: Cleaned programId for API requests: ${programId}`)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<GameData | null>(null)

  // Get teams data from Redux store
  const teamsLoading = useAppSelector(selectTeamsLoading)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // State to hold team names
  const [homeTeamName, setHomeTeamName] = useState<string>("Home Team")
  const [awayTeamName, setAwayTeamName] = useState<string>("Away Team")

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

    // Fetch teams data if not already loaded
    if (token && (teamsLoading === "idle" || teamsLoading === "failed")) {
      dispatch(fetchTeams(token))
    }

    // Fetch game data directly from API using /games endpoint
    const fetchGameData = async () => {
      setLoading(true)
      setError(null)

      if (token && programId) {
        try {
          console.log(`MATCH DETAILS: Fetching game data for programId: ${programId}`)
          
          // Call the correct API endpoint for games
          const response = await axios.get(`${API_URL}/games/${programId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          console.log(`MATCH DETAILS: Successfully fetched game data:`, response.data)
          
          // Transform API response from games endpoint to match existing GameData interface
          const gameData = response.data
          const transformedGame: GameData = {
            id: gameData.id,
            name: `${gameData.home_team_name || 'Home'} vs ${gameData.away_team_name || 'Away'}`,
            description: gameData.description || `Match between ${gameData.home_team_name} and ${gameData.away_team_name}`,
            win_team: gameData.home_team_name || "Home Team",
            lose_team: gameData.away_team_name || "Away Team",
            win_score: gameData.winner_score || 0,
            lose_score: gameData.loser_score || 0,
            created_at: gameData.start_time || gameData.created_at,
            updated_at: gameData.updated_at,
            status: gameData.status || "scheduled", // Extract actual status from API
            home_team_logo_url: gameData.home_team_logo_url,
            away_team_logo_url: gameData.away_team_logo_url
          }
          
          setGame(transformedGame)
        } catch (error) {
          console.error("MATCH DETAILS: Error fetching game data:", error)
          setError("Failed to load game data. Please try again.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        if (!token) setError("Authentication token is missing")
        if (!programId) setError("Game ID is missing")
      }
    }

    fetchGameData()
  }, [programId, token, dispatch, teamsLoading, id])

  // Get team selectors at the component level
  const homeTeamId = game?.win_team
  const awayTeamId = game?.lose_team
  const homeTeam = useAppSelector((state) => (homeTeamId ? selectTeamById(state, homeTeamId) : null))
  const awayTeam = useAppSelector((state) => (awayTeamId ? selectTeamById(state, awayTeamId) : null))

  useEffect(() => {
    if (game) {
      setHomeTeamName(homeTeam ? homeTeam.name : game.win_team || "Home Team")
      setAwayTeamName(awayTeam ? awayTeam.name : game.lose_team || "Away Team")
    }
  }, [game, homeTeam, awayTeam])

  const handleShare = async () => {
    if (!game) return

    try {
      await Share.share({
        message: `Check out this match: ${homeTeamName} vs ${awayTeamName} - ${game.name || "Basketball Match"}`,
        title: game.name || `${homeTeamName} vs ${awayTeamName}`,
      })
    } catch (error) {
      console.error("Error sharing match:", error)
    }
  }

  const openInstagramProfile = () => {
    Linking.openURL(INSTAGRAM_PROFILE_URL).catch((err) => console.error("Error opening Instagram profile:", err))
  }

  const handleRetry = () => {
    // Reset state and trigger a re-fetch
    setGame(null)
    setError(null)
    setLoading(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <LoadingIndicator size="large" color="#FCA311" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.loadingText}>Match not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Get status dynamically from game data
  const status = game?.status || "scheduled"
  const { color, label, bgColor } = statusStyles[status as keyof typeof statusStyles]


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
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1504450758481-7338eba7524a" }}
            style={styles.headerImage}
            resizeMode="cover"
          >
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
              <View style={styles.titleContainer}>
                <Text style={styles.leagueTitle} numberOfLines={2} ellipsizeMode="tail">
                  {game.name || "Basketball Match"}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Text style={[styles.statusText, { color }]}>{label}</Text>
              </View>
            </View>

            {/* Teams and Score */}
            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                <ManagedImage
                  source={game?.home_team_logo_url}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamName}>{homeTeamName}</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  {game.win_score || 0} - {game.lose_score || 0}
                </Text>
              </View>

              <View style={styles.teamColumn}>
                <ManagedImage
                  source={game?.away_team_logo_url}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamName}>{awayTeamName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <EventInfoRow
                icon="calendar"
                text={game.created_at ? dayjs(game.created_at).format("dddd, MMMM D, YYYY") : "Date not available"}
              />
              <EventInfoRow icon="user" text={`Teams: ${homeTeamName} vs ${awayTeamName}`} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Match Details</Text>
            <Text style={styles.description}>{game.description || "No description available for this match."}</Text>

           

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
    marginTop: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FCA311",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FCA311",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#000000",
    fontWeight: "bold",
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
    alignItems: "flex-start", // Changed from "center" to "flex-start"
    marginBottom: 20,
    gap: 12, // Add gap between title and status badge
  },
  titleContainer: {
    flex: 1, // Take up available space
    marginRight: 12, // Ensure spacing from status badge
  },
  leagueTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28, // Add line height for better multi-line display
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0, // Prevent shrinking
    minWidth: 80, // Ensure minimum width
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  detailsContainer: {
    marginTop: -50, // Increased to bring the container up more
    backgroundColor: "#0C0B0B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
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

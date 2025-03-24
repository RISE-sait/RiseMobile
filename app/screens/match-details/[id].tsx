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
import { mockMatches, type MatchDetails } from "@/app/(athlete)/screens/matchesData"
import dayjs from "dayjs"
import { FontAwesome6 } from "@expo/vector-icons"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMatchById } from "@/store/slices/matchesSlice"
import LoadingIndicator from "@/components/feedback/LoadingIndicator"

const { width } = Dimensions.get("window")

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369", bgColor: "rgba(255, 211, 105, 0.15)" },
  Finished: { label: "Final", color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.15)" },
  Live: { label: "Live", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
}

// Instagram profile URL - replace with your actual profile URL
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/yourprofile"

const MatchDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { token } = useAppSelector((state) => state.user)
  const matchState = useAppSelector((state) => state.matches)
  const teamsById = matchState.teams.byId || {}

  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

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

    // Fetch match data
    const fetchMatchData = async () => {
      setLoading(true)

      if (token && id) {
        try {
          // Dispatch the action to fetch the match
          await dispatch(fetchMatchById({ id: id as string, token })).unwrap()

          // Get the match from the store
          const matchData = matchState.byId[id as string]

          if (matchData) {
            // Get team information
            const homeTeamId = matchData.win_team
            const awayTeamId = matchData.lose_team

            const homeTeam = homeTeamId && teamsById[homeTeamId] ? teamsById[homeTeamId].name : "Home Team"

            const awayTeam = awayTeamId && teamsById[awayTeamId] ? teamsById[awayTeamId].name : "Away Team"

            const homeLogo =
              homeTeamId && teamsById[homeTeamId]?.logo ? teamsById[homeTeamId].logo : "https://via.placeholder.com/100"

            const awayLogo =
              awayTeamId && teamsById[awayTeamId]?.logo ? teamsById[awayTeamId].logo : "https://via.placeholder.com/100"

            // Create match details object
            const matchDetails: MatchDetails = {
              id: matchData.id,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              homeScore: matchData.win_score || 0,
              awayScore: matchData.lose_score || 0,
              league: matchData.league || "RISE Basketball League",
              status: matchData.status || "Upcoming",
              date: matchData.date,
              time: matchData.time || "TBD",
              location: matchData.location || "RISE Basketball Court",
              description: matchData.description || "Basketball match",
              homeLogo: homeLogo,
              awayLogo: awayLogo,
              bgImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a",
              type: "match",
              organizer: "RISE Basketball",
            }

            setMatch(matchDetails)
          } else {
            // Fallback to mock data if match not found
            fallbackToMockData()
          }
        } catch (error) {
          console.error("Error fetching match:", error)
          fallbackToMockData()
        } finally {
          setLoading(false)
        }
      } else {
        fallbackToMockData()
        setLoading(false)
      }
    }

    fetchMatchData()
  }, [id, token, dispatch])

  // Define fallbackToMockData function
  const fallbackToMockData = () => {
    console.log("Using mock data as fallback for match")

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
        type: "match",
        organizer: "RISE Basketball",
      }

      setMatch(defaultMatch)
    }
  }

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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <LoadingIndicator size="large" color="#FCA311" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </SafeAreaView>
    )
  }

  if (!match) {
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

  const { color, label, bgColor } = statusStyles[match.status as keyof typeof statusStyles] || statusStyles.Upcoming

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
              <EventInfoRow icon="clock" text={match.time || "TBD"} />
              <EventInfoRow icon="map-marker-alt" text={match.location} />
              <EventInfoRow icon="user" text={`Organized by: ${match.organizer || "RISE Basketball"}`} />
            </View>

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
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
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


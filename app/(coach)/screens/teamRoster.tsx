import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6, Ionicons, MaterialIcons, MaterialCommunityIcons, AntDesign, Feather } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import BackButton from "@/components/buttons/BackButton"
import { getTeamById } from "@/utils/api"
import type { Team } from "@/types/team"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import images from "@/constants/images"
import { resolveImageSource } from "@/utils/imageSource"

// Define RosterMember interface for API response
interface RosterMember {
  id?: string
  name?: string
  points?: number
  rebounds?: number
  assists?: number
  steals?: number
}

// Define Player interface
interface Player {
  id: string
  firstName: string
  lastName: string
  number: number
  height: string
  weight: number
  age: number
  experience: number
  college: string
  image: string
  position: string
  status: string
  stats: {
    ppg: number
    rpg: number
    apg: number
    spg: number
    bpg: number
    fg: number
    threePt: number
    ft: number
    mpg: number
    topg: number
  }
  lastFiveGames?: any[]
  notes?: string
}

const { width, height } = Dimensions.get("window")

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
  injured: "#FF6B6B",
  active: "#4CAF50",
  suspended: "#FF9800",
  conditioning: "#03A9F4",
  dayToDay: "#FFC107",
}

// Status color mapping
const STATUS_COLORS = {
  Active: COLORS.active,
  Injured: COLORS.injured,
  Suspended: COLORS.suspended,
  Conditioning: COLORS.conditioning,
  "Day-to-Day": COLORS.dayToDay,
}

// Position abbreviation to full name mapping
const POSITION_NAMES = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
}

// Helper function to map API roster data to Player interface
const mapRosterMemberToPlayer = (member: RosterMember, index: number): Player => ({
  id: member.id || `player-${index}`,
  firstName: member.name?.split(' ')[0] || "Unknown",
  lastName: member.name?.split(' ').slice(1).join(' ') || "Player",
  number: index + 1,
  height: "6'0\"",
  weight: 180,
  age: 22,
  experience: 2,
  college: "Unknown",
  image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
  position: "F", // Default position
  status: "Active", // Everyone is active
  stats: {
    ppg: member.points || 0,
    rpg: member.rebounds || 0,
    apg: member.assists || 0,
    spg: member.steals || 0,
    bpg: 0,
    fg: 0.45,
    threePt: 0.35,
    ft: 0.75,
    mpg: 25,
    topg: 2,
  },
})

const TeamRoster: React.FC = () => {
  // Get URL parameters
  const params = useLocalSearchParams()
  const teamId = params.teamId as string
  const teamName = params.teamName as string

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // State
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [teamData, setTeamData] = useState<Team | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showSortModal, setShowSortModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const sortModalAnim = useRef(new Animated.Value(0)).current

  // Navigation
  const router = useRouter()

  // Team stats
  const teamStats = {
    totalPlayers: allPlayers.length,
    activePlayers: allPlayers.length, // Everyone is active
  }


  // Effects
  useEffect(() => {
    // Initial animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Simulate data loading
    fetchPlayers()
  }, [])

  useEffect(() => {
    // Apply filters and sorting whenever relevant state changes
    filterAndSortPlayers()
  }, [allPlayers, searchQuery, sortBy, sortDirection])

  // Animation effects for modals
  useEffect(() => {
    if (showSortModal) {
      Animated.timing(sortModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(sortModalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [showSortModal])



  // Methods
  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setApiError(null)

      // Validate teamId is provided
      if (!teamId) {
        throw new Error("No team selected. Please go back and select a team.")
      }

      // Get user token from Redux state
      const token = user?.token
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // Fetch team data from API
      const team = await getTeamById(teamId, token)
      setTeamData(team)

      // Map roster members to Player objects
      const playersData = team.roster ? team.roster.map(mapRosterMemberToPlayer) : []
      setAllPlayers(playersData)

    } catch (error) {
      console.error("Error fetching team data:", error)
      setApiError((error as Error).message)
      // Clear data on error - no fallback to mock data
      setAllPlayers([])
      setTeamData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlayers()
    setRefreshing(false)
  }

  const filterAndSortPlayers = () => {
    let result = [...allPlayers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (player) =>
          player.firstName.toLowerCase().includes(query) ||
          player.lastName.toLowerCase().includes(query) ||
          `${player.firstName} ${player.lastName}`.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
      }

      return sortDirection === "desc" ? -comparison : comparison
    })

    setFilteredPlayers(result)
  }



  const toggleSortModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowSortModal(!showSortModal)
  }



  const handleSortChange = (newSortBy: "name") => {
    if (sortBy === newSortBy) {
      // Toggle direction if same sort field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field with ascending direction always
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }


  const resetFilters = () => {
    setSearchQuery("")
    setSortBy("name")
    setSortDirection("asc")
  }


  // Render methods
  const renderHeader = () => (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {teamData?.name || teamName || "Team Roster"}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleSortModal}>
          <MaterialCommunityIcons name="sort" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search players..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
          <AntDesign name="close" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  )

  const renderTeamStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Team Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamStats.totalPlayers}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamStats.activePlayers}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>
    </View>
  )
  


  const renderPlayerItem = ({ item }: { item: Player }) => (
    <Animated.View
      style={[
        styles.playerCardContainer,
        {
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.playerCard}>
        <View style={styles.playerCardContent}>
          {/* Player Number */}
          <View style={styles.playerNumberContainer}>
            <Text style={styles.playerNumber}>#{item.number}</Text>
          </View>

          {/* Player Image */}
          <Image
            source={resolveImageSource(item.image, images.headshot)}
            style={styles.playerImage}
            resizeMode="cover"
          />

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {item.firstName} {item.lastName}
            </Text>
            {getStatusBadge(item.status)}
          </View>
        </View>
      </View>
    </Animated.View>
  )

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading players...</Text>
        </View>
      )
    }

    if (apiError) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="wifi-slash" size={50} color={COLORS.danger} />
          <Text style={styles.emptyText}>Unable to load team data</Text>
          <Text style={styles.emptySubtext}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPlayers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // Check if it's due to filters
    if (allPlayers.length > 0 && filteredPlayers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="filter" size={50} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No players match your filters</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // No players in team
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6 name="users-slash" size={50} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No players in this team</Text>
        <Text style={styles.emptySubtext}>
          {teamData?.name ? `${teamData.name} doesn't have any players yet` : "This team is empty"}
        </Text>
      </View>
    )
  }

  const renderSortModal = () => {
    if (!showSortModal) return null

    return (
      <Modal transparent visible={showSortModal} animationType="none" onRequestClose={toggleSortModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleSortModal}>
          <Animated.View
            style={[
              styles.sortModal,
              {
                opacity: sortModalAnim,
                transform: [
                  {
                    translateY: sortModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort Players</Text>
                <TouchableOpacity onPress={toggleSortModal}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.sortOptions}>
                <TouchableOpacity style={styles.sortOption} onPress={() => handleSortChange("name")}>
                  <Text style={styles.sortOptionText}>
                    Name {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Text>
                  {sortBy === "name" && (
                    <MaterialIcons
                      name={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"}
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={toggleSortModal}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => (
    <View style={[styles.statusBadge, { backgroundColor: COLORS.active }]}>
      <Text style={styles.statusText}>Active</Text>
    </View>
  )



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderHeader()}
        {renderSearchBar()}
        
        {/* Show API error if present */}
        {apiError && (
          <View style={styles.errorContainer}>
            <FontAwesome6 name="triangle-exclamation" size={16} color={COLORS.danger} />
            <Text style={[styles.errorText, { color: COLORS.danger }]}>
              Failed to load team data: {apiError}
            </Text>
          </View>
        )}

        {renderTeamStats()}

        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.playersList}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // Performance optimizations to prevent freeze
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      </Animated.View>

      {renderSortModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: "relative",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 16,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    height: 45,
  },
  clearSearch: {
    padding: 5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.danger}20`,
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabsScrollView: {
    marginTop: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: COLORS.card,
    minWidth: 80,
    height: 40, // Fixed height to prevent movement
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#000",
  },
  legendContainer: {
    marginTop: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  legendBadgeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  legendText: {
    color: COLORS.text,
    fontSize: 14,
  },
  playersList: {
    paddingBottom: 20,
  },
  playerCardContainer: {
    marginTop: 16,
  },
  playerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerCardContent: {
    flexDirection: "row",
    padding: 12,
  },
  playerNumberContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  playerNumber: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  playerName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  positionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  positionText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 8,
  },
  statColumn: {
    alignItems: "center",
    minWidth: 40,
  },
  quickActions: {
    justifyContent: "space-around",
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#333",
  },
  quickActionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  resetButtonText: {
    color: COLORS.text,
    fontWeight: "bold",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortModal: {
    width: width * 0.9,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  sortOptions: {
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sortOptionText: {
    color: COLORS.text,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  filterModal: {
    width: width * 0.9,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#000",
    fontWeight: "bold",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetFilterButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  resetFilterButtonText: {
    color: COLORS.text,
    fontWeight: "bold",
  },
  playerModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  playerModalContent: {
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  playerModalGradient: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: COLORS.card,
  },
  playerModalHeader: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  closeModalButton: {
    padding: 8,
  },
  playerModalScroll: {
    flex: 1,
  },
  playerModalProfile: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  playerModalImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  playerModalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerModalName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  playerModalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  playerModalNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 8,
  },
  playerModalPositionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  playerModalPositionText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  playerModalDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerModalDetail: {
    width: "50%",
    marginBottom: 8,
  },
  playerModalDetailLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  playerModalDetailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  playerModalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  playerModalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  playerModalStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  playerModalStatItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
  },
  playerModalStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  playerModalStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gameItem: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gameDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  gameOpponent: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  gameResult: {
    fontWeight: "bold",
    fontSize: 14,
  },
  gameWin: {
    color: COLORS.success,
  },
  gameLoss: {
    color: COLORS.danger,
  },
  gameStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gameStat: {
    alignItems: "center",
  },
  gameStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  gameStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  notesContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  playerModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  playerModalActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  playerModalActionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  playerModalActionButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  playerModalActionButtonTextSecondary: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  addPlayerModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  addPlayerModalContent: {
    width: width * 0.9,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  addPlayerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addPlayerModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addPlayerModalMessage: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  addPlayerModalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addPlayerModalButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabsContainer: {
    paddingVertical: 8,
    alignItems: "center", // Center tabs vertically in the container
  },
})

export default TeamRoster

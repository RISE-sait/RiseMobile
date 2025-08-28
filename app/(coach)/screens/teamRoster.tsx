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
import { TeamResponse, ApiInternalDomainsTeamDtoRosterMemberInfo } from "@/app/api/Api"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
const mapRosterMemberToPlayer = (member: ApiInternalDomainsTeamDtoRosterMemberInfo, index: number): Player => ({
  id: member.id || `player-${index}`,
  firstName: member.name?.split(' ')[0] || "Unknown",
  lastName: member.name?.split(' ').slice(1).join(' ') || "Player",
  number: index + 1, // Since API doesn't have jersey numbers yet
  position: "PG" as PlayerPosition, // Default position since API doesn't have this
  height: "6'0\"", // Default height since API doesn't have this
  weight: 180, // Default weight since API doesn't have this
  age: 22, // Default age since API doesn't have this
  experience: 2, // Default experience since API doesn't have this
  college: "Unknown", // Default college since API doesn't have this
  image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop", // Default image
  status: "Active" as PlayerStatus, // Default status since API doesn't have this
  stats: {
    ppg: member.points || 0,
    rpg: member.rebounds || 0,
    apg: member.assists || 0,
    spg: member.steals || 0,
    bpg: 0, // API doesn't have blocks
    fg: 0.45, // Default field goal percentage
    threePt: 0.35, // Default three-point percentage
    ft: 0.75, // Default free throw percentage
    mpg: 25, // Default minutes per game
    topg: 2, // Default turnovers
  },
})

const TeamRoster: React.FC = () => {
  // Get URL parameters
  const params = useLocalSearchParams()
  const teamId = params.teamId as string
  const teamName = params.teamName as string

  // State
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [teamData, setTeamData] = useState<TeamResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | PlayerPosition>("all")
  const [sortBy, setSortBy] = useState<"name" | "number" | "ppg" | "position">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showSortModal, setShowSortModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | "all">("all")
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showPositionLegend, setShowPositionLegend] = useState(false)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const sortModalAnim = useRef(new Animated.Value(0)).current
  const filterModalAnim = useRef(new Animated.Value(0)).current
  const playerModalAnim = useRef(new Animated.Value(0)).current

  // Navigation
  const router = useRouter()

  // Team stats
  const teamStats = {
    totalPlayers: allPlayers.length,
    activePlayers: allPlayers.filter((p) => p.status === "Active").length,
    injuredPlayers: allPlayers.filter((p) => p.status === "Injured" || p.status === "Day-to-Day").length,
    avgPPG: allPlayers.reduce((sum, player) => sum + player.stats.ppg, 0) / allPlayers.length,
    avgRPG: allPlayers.reduce((sum, player) => sum + player.stats.rpg, 0) / allPlayers.length,
    avgAPG: allPlayers.reduce((sum, player) => sum + player.stats.apg, 0) / allPlayers.length,
  }

  // Position distribution
  const positionCounts = {
    PG: allPlayers.filter((p) => p.position === "PG").length,
    SG: allPlayers.filter((p) => p.position === "SG").length,
    SF: allPlayers.filter((p) => p.position === "SF").length,
    PF: allPlayers.filter((p) => p.position === "PF").length,
    C: allPlayers.filter((p) => p.position === "C").length,
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
  }, [allPlayers, searchQuery, activeTab, sortBy, sortDirection, statusFilter])

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

  useEffect(() => {
    if (showFilterModal) {
      Animated.timing(filterModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(filterModalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [showFilterModal])

  useEffect(() => {
    if (showPlayerModal) {
      Animated.timing(playerModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(playerModalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [showPlayerModal])

  // Methods
  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setApiError(null)

      // Validate teamId is provided
      if (!teamId) {
        throw new Error("No team selected. Please go back and select a team.")
      }

      // Get user token from AsyncStorage
      const storedUser = await AsyncStorage.getItem("user")
      if (!storedUser) {
        throw new Error("User not found. Please log in again.")
      }
      
      const user = JSON.parse(storedUser)
      const token = user.token || await AsyncStorage.getItem("authToken")
      
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

    // Apply position filter
    if (activeTab !== "all") {
      result = result.filter((player) => player.position === activeTab)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((player) => player.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (player) =>
          player.firstName.toLowerCase().includes(query) ||
          player.lastName.toLowerCase().includes(query) ||
          `${player.firstName} ${player.lastName}`.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query) ||
          player.number.toString().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case "number":
          comparison = a.number - b.number
          break
        case "ppg":
          comparison = b.stats.ppg - a.stats.ppg // Higher PPG first by default
          break
        case "position":
          // Custom position order: PG, SG, SF, PF, C
          const posOrder = { PG: 1, SG: 2, SF: 3, PF: 4, C: 5 }
          comparison = posOrder[a.position] - posOrder[b.position]
          break
      }

      // Apply sort direction (except for PPG which is always desc first)
      return sortBy === "ppg" && sortDirection === "asc"
        ? -comparison
        : sortDirection === "desc"
          ? -comparison
          : comparison
    })

    setFilteredPlayers(result)
  }

  const handlePlayerPress = (player: Player) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSelectedPlayer(player)
    setShowPlayerModal(true)
  }

  const handleTabPress = (tab: "all" | PlayerPosition) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
  }

  const toggleSortModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowSortModal(!showSortModal)
  }

  const toggleFilterModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowFilterModal(!showFilterModal)
  }

  const toggleAddPlayerModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowAddPlayerModal(!showAddPlayerModal)
  }

  const handleSortChange = (newSortBy: "name" | "number" | "ppg" | "position") => {
    if (sortBy === newSortBy) {
      // Toggle direction if same sort field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field with ascending direction always
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }

  const handleStatusFilterChange = (status: PlayerStatus | "all") => {
    setStatusFilter(status)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setActiveTab("all")
    setStatusFilter("all")
    setSortBy("name")
    setSortDirection("asc")
    setShowFilterModal(false)
  }

  const getStatusBadge = (status: PlayerStatus) => {
    const color = STATUS_COLORS[status]
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    )
  }

  // Render methods
  const renderHeader = () => (
    <View style={styles.header}>

      <BackButton />
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {teamData?.name || teamName || "Team Roster"}
        </Text>
        <TouchableOpacity style={styles.infoButton} onPress={() => setShowPositionLegend(!showPositionLegend)}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleFilterModal}>
          <Ionicons name="filter" size={24} color="white" />
          {statusFilter !== "all" && <View style={styles.filterBadge} />}
        </TouchableOpacity>
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
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamStats.injuredPlayers}</Text>
          <Text style={styles.statLabel}>Injured</Text>
        </View>
        {/* Temporarily hidden until backend supports player stats
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamStats.avgPPG.toFixed(1)}</Text>
          <Text style={styles.statLabel}>PPG</Text>
        </View>
        */}
      </View>
    </View>
  )

  const renderPositionTabs = () => (
    <View>
      {/* Temporarily hidden until backend supports position data
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => handleTabPress("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
  
        {(["PG", "SG", "SF", "PF", "C"] as PlayerPosition[]).map((position) => (
          <TouchableOpacity
            key={position}
            style={[styles.tab, activeTab === position && styles.activeTab]}
            onPress={() => handleTabPress(position)}
          >
            <Text style={[styles.tabText, activeTab === position && styles.activeTabText]}>
              {position} ({positionCounts[position]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      */}
    </View>
  )
  

  const renderPositionLegend = () => {
    if (!showPositionLegend) return null

    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendHeader}>
          <Text style={styles.legendTitle}>Position Guide</Text>
          <TouchableOpacity onPress={() => setShowPositionLegend(false)}>
            <AntDesign name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {(["PG", "SG", "SF", "PF", "C"] as PlayerPosition[]).map((pos) => (
          <View key={pos} style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.legendBadgeText}>{pos}</Text>
            </View>
            <Text style={styles.legendText}>{POSITION_NAMES[pos]}</Text>
          </View>
        ))}
      </View>
    )
  }

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
      <TouchableOpacity style={styles.playerCard} activeOpacity={0.7} onPress={() => handlePlayerPress(item)}>
        <View style={styles.playerCardContent}>
          {/* Player Number */}
          <View style={styles.playerNumberContainer}>
            <Text style={styles.playerNumber}>#{item.number}</Text>
          </View>

          {/* Player Image */}
          <Image source={{ uri: item.image }} style={styles.playerImage} resizeMode="cover" />

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {item.firstName} {item.lastName}
            </Text>

            <View style={styles.playerDetailRow}>
              {/* Temporarily hidden until backend supports position data
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{item.position}</Text>
              </View>
              */}
              {getStatusBadge(item.status)}
            </View>

            {/* Temporarily hidden until backend supports player stats
            <View style={styles.statsRow}>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{item.stats.ppg.toFixed(1)}</Text>
                <Text style={styles.statLabel}>PPG</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{item.stats.rpg.toFixed(1)}</Text>
                <Text style={styles.statLabel}>RPG</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{item.stats.apg.toFixed(1)}</Text>
                <Text style={styles.statLabel}>APG</Text>
              </View>
            </View>
            */}
          </View>

          {/* Temporarily hidden until backend supports player actions
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Navigate to player details
                router.push(`/screens/comingSoon`)
              }}
            >
              <MaterialIcons name="info-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                // Navigate to message screen
                router.push(`/screens/comingSoon`)
              }}
            >
              <Feather name="message-circle" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          */}
        </View>
      </TouchableOpacity>
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

                <TouchableOpacity style={styles.sortOption} onPress={() => handleSortChange("number")}>
                  <Text style={styles.sortOptionText}>
                    Jersey Number {sortBy === "number" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Text>
                  {sortBy === "number" && (
                    <MaterialIcons
                      name={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"}
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.sortOption} onPress={() => handleSortChange("ppg")}>
                  <Text style={styles.sortOptionText}>
                    Points Per Game {sortBy === "ppg" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Text>
                  {sortBy === "ppg" && (
                    <MaterialIcons
                      name={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"}
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.sortOption} onPress={() => handleSortChange("position")}>
                  <Text style={styles.sortOptionText}>
                    Position {sortBy === "position" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Text>
                  {sortBy === "position" && (
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

  const renderFilterModal = () => {
    if (!showFilterModal) return null

    return (
      <Modal transparent visible={showFilterModal} animationType="none" onRequestClose={toggleFilterModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleFilterModal}>
          <Animated.View
            style={[
              styles.filterModal,
              {
                opacity: filterModalAnim,
                transform: [
                  {
                    translateY: filterModalAnim.interpolate({
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
                <Text style={styles.modalTitle}>Filter Players</Text>
                <TouchableOpacity onPress={toggleFilterModal}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Player Status</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === "all" && styles.filterOptionSelected]}
                    onPress={() => handleStatusFilterChange("all")}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === "all" && styles.filterOptionTextSelected]}>
                      All
                    </Text>
                  </TouchableOpacity>

                  {(["Active", "Injured", "Suspended", "Conditioning", "Day-to-Day"] as PlayerStatus[]).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.filterOption, statusFilter === status && styles.filterOptionSelected]}
                        onPress={() => handleStatusFilterChange(status)}
                      >
                        <Text
                          style={[styles.filterOptionText, statusFilter === status && styles.filterOptionTextSelected]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.resetFilterButton} onPress={resetFilters}>
                  <Text style={styles.resetFilterButtonText}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyButton} onPress={toggleFilterModal}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }

  const renderPlayerModal = () => {
    if (!selectedPlayer || !showPlayerModal) return null

    return (
      <Modal
        transparent
        visible={showPlayerModal}
        animationType="none"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={styles.playerModalContainer}>
          <Animated.View
            style={[
              styles.playerModalContent,
              {
                opacity: playerModalAnim,
                transform: [
                  {
                    translateY: playerModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.playerModalGradient}>
              <View style={styles.playerModalHeader}>
                <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowPlayerModal(false)}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.playerModalScroll}>
                <View style={styles.playerModalProfile}>
                  <Image source={{ uri: selectedPlayer.image }} style={styles.playerModalImage} resizeMode="cover" />

                  <View style={styles.playerModalInfo}>
                    <Text style={styles.playerModalName}>
                      {selectedPlayer.firstName} {selectedPlayer.lastName}
                    </Text>
                    <View style={styles.playerModalDetailRow}>
                      <Text style={styles.playerModalNumber}>#{selectedPlayer.number}</Text>
                      <View style={styles.playerModalPositionBadge}>
                        <Text style={styles.playerModalPositionText}>{selectedPlayer.position}</Text>
                      </View>
                      {getStatusBadge(selectedPlayer.status)}
                    </View>

                    <View style={styles.playerModalDetails}>
                      <View style={styles.playerModalDetail}>
                        <Text style={styles.playerModalDetailLabel}>Height</Text>
                        <Text style={styles.playerModalDetailValue}>{selectedPlayer.height}</Text>
                      </View>
                      <View style={styles.playerModalDetail}>
                        <Text style={styles.playerModalDetailLabel}>Weight</Text>
                        <Text style={styles.playerModalDetailValue}>{selectedPlayer.weight} lbs</Text>
                      </View>
                      <View style={styles.playerModalDetail}>
                        <Text style={styles.playerModalDetailLabel}>Age</Text>
                        <Text style={styles.playerModalDetailValue}>{selectedPlayer.age}</Text>
                      </View>
                      <View style={styles.playerModalDetail}>
                        <Text style={styles.playerModalDetailLabel}>Experience</Text>
                        <Text style={styles.playerModalDetailValue}>{selectedPlayer.experience} yrs</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Temporarily hidden until backend supports detailed player stats
                <View style={styles.playerModalSection}>
                  <Text style={styles.playerModalSectionTitle}>Key Stats</Text>
                  <View style={styles.playerModalStatsGrid}>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{selectedPlayer.stats.ppg.toFixed(1)}</Text>
                      <Text style={styles.playerModalStatLabel}>PPG</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{selectedPlayer.stats.rpg.toFixed(1)}</Text>
                      <Text style={styles.playerModalStatLabel}>RPG</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{selectedPlayer.stats.apg.toFixed(1)}</Text>
                      <Text style={styles.playerModalStatLabel}>APG</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{selectedPlayer.stats.spg.toFixed(1)}</Text>
                      <Text style={styles.playerModalStatLabel}>SPG</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{selectedPlayer.stats.bpg.toFixed(1)}</Text>
                      <Text style={styles.playerModalStatLabel}>BPG</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{(selectedPlayer.stats.fg * 100).toFixed(1)}%</Text>
                      <Text style={styles.playerModalStatLabel}>FG%</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>
                        {(selectedPlayer.stats.threePt * 100).toFixed(1)}%
                      </Text>
                      <Text style={styles.playerModalStatLabel}>3PT%</Text>
                    </View>
                    <View style={styles.playerModalStatItem}>
                      <Text style={styles.playerModalStatValue}>{(selectedPlayer.stats.ft * 100).toFixed(1)}%</Text>
                      <Text style={styles.playerModalStatLabel}>FT%</Text>
                    </View>
                  </View>
                </View>
                */}

                {selectedPlayer.lastFiveGames && (
                  <View style={styles.playerModalSection}>
                    <Text style={styles.playerModalSectionTitle}>Last 5 Games</Text>
                    {selectedPlayer.lastFiveGames.map((game, index) => (
                      <View key={index} style={styles.gameItem}>
                        <View style={styles.gameHeader}>
                          <Text style={styles.gameDate}>{game.date}</Text>
                          <Text style={styles.gameOpponent}>vs {game.opponent}</Text>
                          <Text style={[styles.gameResult, game.result === "W" ? styles.gameWin : styles.gameLoss]}>
                            {game.result}
                          </Text>
                        </View>
                        <View style={styles.gameStats}>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.points}</Text>
                            <Text style={styles.gameStatLabel}>PTS</Text>
                          </View>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.rebounds}</Text>
                            <Text style={styles.gameStatLabel}>REB</Text>
                          </View>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.assists}</Text>
                            <Text style={styles.gameStatLabel}>AST</Text>
                          </View>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.steals}</Text>
                            <Text style={styles.gameStatLabel}>STL</Text>
                          </View>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.blocks}</Text>
                            <Text style={styles.gameStatLabel}>BLK</Text>
                          </View>
                          <View style={styles.gameStat}>
                            <Text style={styles.gameStatValue}>{game.minutes}</Text>
                            <Text style={styles.gameStatLabel}>MIN</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedPlayer.notes && (
                  <View style={styles.playerModalSection}>
                    <Text style={styles.playerModalSectionTitle}>Coach's Notes</Text>
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesText}>{selectedPlayer.notes}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.playerModalActions}>
                  <TouchableOpacity
                    style={styles.playerModalActionButton}
                    onPress={() => {
                      setShowPlayerModal(false)
                      router.push(`/screens/player-details?id=${selectedPlayer.id}`)
                    }}
                  >
                    <Text style={styles.playerModalActionButtonText}>Full Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.playerModalActionButton, styles.playerModalActionButtonSecondary]}
                    onPress={() => {
                      setShowPlayerModal(false)
                      router.push(`/screens/comingSoon`)
                    }}
                  >
                    <Text style={styles.playerModalActionButtonTextSecondary}>Message</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    )
  }


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
        {renderPositionTabs()}
        {renderPositionLegend()}

        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.playersList}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </Animated.View>

      {renderSortModal()}
      {renderFilterModal()}
      {renderPlayerModal()}
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


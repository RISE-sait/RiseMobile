import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6, Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import BackButton from "@/components/buttons/BackButton"
import { TeamResponse } from "@/app/api/Api"
import { useSelector, useDispatch } from "react-redux"
import { fetchTeams, selectAllTeams, selectTeamsLoading, selectTeamsError } from "@/store/slices/teamsSlice"
import type { RootState } from "@/store"

const { width } = Dimensions.get("window")

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

const SelectTeamForRoster: React.FC = () => {
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)
  
  // Get teams data from Redux store
  const teams = useSelector(selectAllTeams)
  const loading = useSelector(selectTeamsLoading) === 'loading'
  const error = useSelector(selectTeamsError)
  const dispatch = useDispatch()

  // Local state for refreshing only
  const [refreshing, setRefreshing] = useState(false)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Navigation
  const router = useRouter()

  // Effects
  useEffect(() => {
    // Initial animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Fetch teams data using Redux
    if (user?.token) {
      dispatch(fetchTeams(user.token))
    }
  }, [dispatch, user?.token])

  const handleRefresh = async () => {
    setRefreshing(true)
    if (user?.token) {
      await dispatch(fetchTeams(user.token))
    }
    setRefreshing(false)
  }

  const handleTeamPress = (team: TeamResponse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Navigate to team roster screen with selected team ID
    router.push(`/screens/teamRoster?teamId=${team.id}&teamName=${encodeURIComponent(team.name || "")}`)
  }

  // Render methods
  const renderHeader = () => (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Select Team</Text>
      </View>
      <View style={styles.headerActions}>
        {/* Empty view for alignment */}
        <View style={{ width: 40 }} />
      </View>
    </View>
  )

  const renderTeamItem = ({ item }: { item: TeamResponse }) => (
    <Animated.View
      style={[
        styles.teamCardContainer,
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
      <TouchableOpacity
        style={styles.teamCard}
        activeOpacity={0.7}
        onPress={() => handleTeamPress(item)}
      >
        <View style={styles.teamCardContent}>
          {/* Team Icon */}
          <View style={styles.teamIcon}>
            <FontAwesome6 name="users" size={32} color={COLORS.primary} />
          </View>

          {/* Team Info */}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            
            <View style={styles.teamDetailRow}>
              {item.capacity && (
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityText}>
                    Capacity: {item.capacity}
                  </Text>
                </View>
              )}
            </View>

            {item.coach && (
              <View style={styles.coachInfo}>
                <Ionicons name="person" size={16} color={COLORS.textSecondary} />
                <Text style={styles.coachText}>
                  Coach: {item.coach.name || "Unknown"}
                </Text>
              </View>
            )}

            {item.roster && item.roster.length > 0 && (
              <View style={styles.rosterInfo}>
                <FontAwesome6 name="users" size={14} color={COLORS.textSecondary} />
                <Text style={styles.rosterText}>
                  {item.roster.length} player{item.roster.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Arrow Icon */}
          <View style={styles.arrowIcon}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading teams...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="triangle-exclamation" size={50} color={COLORS.danger} />
          <Text style={styles.emptyText}>Error loading teams</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6 name="users-slash" size={50} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No teams found</Text>
        <Text style={styles.emptySubtext}>You don't have any teams assigned</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderHeader()}

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Choose a team to view its roster
          </Text>
        </View>

        <FlatList
          data={teams}
          keyExtractor={(item) => item.id || "unknown"}
          renderItem={renderTeamItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.teamsList}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </Animated.View>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  teamsList: {
    paddingBottom: 20,
  },
  teamCardContainer: {
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  teamIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  teamDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  capacityBadge: {
    backgroundColor: `${COLORS.info}30`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: "bold",
  },
  coachInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  coachText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  rosterInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  rosterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  arrowIcon: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
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
})

export default SelectTeamForRoster
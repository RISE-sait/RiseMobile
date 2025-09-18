import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6, Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
// Removed useMatchFilters - now using real-time backend API calls
import BackButton from "@/components/buttons/BackButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchMatchHistory, clearMatches } from "../../../store/slices/gamesSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient'


const { width } = Dimensions.get("window");

// API Response Type for Games from /secure/games
interface ApiGameResponse {
  id: string;
  away_score: number;
  away_team_id: string;
  away_team_logo_url: string;
  away_team_name: string;
  court_id: string;
  court_name: string;
  created_at: string;
  end_time: string;
  home_score: number;
  home_team_id: string;
  home_team_logo_url: string;
  home_team_name: string;
  location_id: string;
  location_name: string;
  start_time: string;
  status: string;
  updated_at: string;
}

const MatchHistory: React.FC = () => {
  // Redux state
  const dispatch = useAppDispatch();
  const matches = useAppSelector((state) => state.games.items);
  const status = useAppSelector((state) => state.games.status);
  const gamesError = useAppSelector((state) => state.games.error);
  const token = useAppSelector((state) => state.user.data?.token);
  
  // Animation refs - separate animations for different purposes
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Local state
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // transformedMatches will be defined after activeTab state

  // Get match details from the existing list data (no need for extra API call)
  const getMatchDetails = (matchId: string) => {
    const transformedMatch = transformedMatches.find(m => m.id === matchId);
    if (!transformedMatch?.originalData) return null;

    const originalMatch = transformedMatch.originalData as any;
    
    // Check if this has the new API structure
    const hasNewStructure = 'home_team_name' in originalMatch || 'away_team_name' in originalMatch;
    
    if (hasNewStructure) {
      // Use the new API structure
      return {
        id: originalMatch.id,
        homeTeamName: originalMatch.home_team_name || "Home Team",
        awayTeamName: originalMatch.away_team_name || "Away Team",
        homeScore: originalMatch.home_score || 0,
        awayScore: originalMatch.away_score || 0,
        locationName: originalMatch.location_name,
        courtName: originalMatch.court_name,
        startTime: originalMatch.start_time,
        endTime: originalMatch.end_time,
        status: originalMatch.status,
        createdAt: originalMatch.created_at,
        updatedAt: originalMatch.updated_at,
        homeTeamLogoUrl: originalMatch.home_team_logo_url,
        awayTeamLogoUrl: originalMatch.away_team_logo_url,
        mvpAvailable: false, // MVP data not available from this API
        hasDetailedStats: false // Detailed stats not available
      };
    } else {
      // Legacy structure fallback
      return {
        id: originalMatch.id,
        homeTeamName: originalMatch.name || "Home Team",
        awayTeamName: "Away Team",
        homeScore: originalMatch.win_score || 0,
        awayScore: originalMatch.lose_score || 0,
        locationName: originalMatch.location,
        startTime: originalMatch.created_at,
        status: "completed",
        mvpAvailable: false,
        hasDetailedStats: false
      };
    }
  };

  // Backend filtering - real-time API calls instead of client-side filtering
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'canceled'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simplified filter options for backend filtering
  const [filterOptions, setFilterOptions] = useState({
    league: null as string | null,
    team: null as string | null,
    dateRange: { start: null as string | null, end: null as string | null }
  });
  
  // Transform Redux matches for display - backend already filtered
  const transformedMatches = useMemo(() => {
    
    const transformed = matches.map(match => {
      // Check if this match has the new API structure or old structure
      const hasNewStructure = 'home_team_name' in match || 'away_team_name' in match;
      
      return {
        id: match.id,
        date: match.date || dayjs().format("YYYY-MM-DD"),
        homeTeam: match.home_team_name || (hasNewStructure ? "Home Team" : "Team A"),
        awayTeam: match.away_team_name || (hasNewStructure ? "Away Team" : "Team B"),
        homeTeamLogo: match.home_team_logo_url || "https://via.placeholder.com/40x40?text=H",
        awayTeamLogo: match.away_team_logo_url || "https://via.placeholder.com/40x40?text=A",
        // Use real scores from API
        homeScore: match.home_score || match.win_score || 0,
        awayScore: match.away_score || match.lose_score || 0,
        // Use backend status directly - no conversion needed
        status: match.status || "scheduled",
        venue: hasNewStructure ? (match as any).location_name || "RISE Basketball Facility" : match.location || "RISE Basketball Facility",
        league: "Basketball League",
        // Store the original match data for expanded view
        originalData: match,
        location: match.location || "Main Arena",
        court: hasNewStructure ? (match as any).court_name || "Court 1" : "Court 1",
        time: match.time || "TBD",
      };
    });
    
    // Log status breakdown for debugging (removed canceled)
    const statusCounts = {
      scheduled: transformed.filter(m => m.status === "scheduled").length,
      in_progress: transformed.filter(m => m.status === "in_progress").length,
      completed: transformed.filter(m => m.status === "completed").length
    };
    return transformed;
  }, [matches, activeTab]);

  
  // Display matches filtered by active tab
  const filteredMatches = useMemo(() => {
    if (activeTab === 'all') {
      return transformedMatches;
    }
    return transformedMatches.filter(match => match.status === activeTab);
  }, [transformedMatches, activeTab]);
  
  // Handle tab changes with real-time API calls
  const handleTabChange = (tab: 'all' | 'scheduled' | 'in_progress' | 'completed') => {
    setActiveTab(tab);
    
    // Use tab directly as backend filter
    const backendFilter = tab === 'completed' ? 'past' : tab;
    loadMatchHistory(backendFilter);
  };
  
  // Toggle filters modal
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    const backendFilter = activeTab === 'completed' ? 'past' : activeTab;
    await loadMatchHistory(backendFilter);
    setRefreshing(false);
  };
  
  // Simplified filter functions for backend filtering
  const toggleLeagueFilter = (league: string) => {
    setFilterOptions(prev => ({
      ...prev,
      league: prev.league === league ? null : league
    }));
  };
  
  const updateTeamFilter = (team: string | null) => {
    setFilterOptions(prev => ({
      ...prev,
      team
    }));
  };
  
  const resetFilters = () => {
    setFilterOptions({
      league: null,
      team: null,
      dateRange: { start: null, end: null }
    });
  };
  
  const applyFilters = () => {
    // For now, just close the modal - advanced filtering can be added later
    toggleFilters();
  };


  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 60],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Animate content on mount and fetch data
  useEffect(() => {
    Animated.timing(contentFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Fetch matches with current filter when component mounts
    loadMatchHistory(activeTab === 'completed' ? 'past' : activeTab);
  }, []);

  // Fetch matches with backend filtering - real-time API calls
  const loadMatchHistory = async (filter?: string) => {
    let authToken = token;

    if (!authToken) {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          authToken = userData.token;
        }
      } catch (err) {
        console.error("Error getting token from AsyncStorage:", err);
      }
    }

    if (authToken) {
      dispatch(clearMatches());
      dispatch(fetchMatchHistory({ token: authToken, filter }));
    } else {
    }
  };

  // Animate modal when showFilters changes
  useEffect(() => {
    if (showFilters) {
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilters]);

  const handleMatchPress = (id: string) => {
    setSelectedMatch(selectedMatch === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // No need to fetch details - we use the existing data
  };

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'in_progress':
      return (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>IN PROGRESS</Text>
        </View>
      );
    case 'scheduled':
      return <Text style={styles.upcomingText}>SCHEDULED</Text>;
    case 'completed':
      return <Text style={styles.completedText}>COMPLETED</Text>;
      return null;
  }
};

  const getScoreStyle = (homeScore: number, awayScore: number) => {
    if (homeScore > awayScore) {
      return { homeStyle: styles.winningScore, awayStyle: styles.losingScore };
    } else if (homeScore < awayScore) {
      return { homeStyle: styles.losingScore, awayStyle: styles.winningScore };
    }
    return { homeStyle: styles.tieScore, awayStyle: styles.tieScore };
  };

  const renderMatchItem = ({ item }: { item: any }) => {
    const isExpanded = selectedMatch === item.id;
    const scoreStyles = getScoreStyle(item.homeScore, item.awayScore);

    return (
      <Animated.View
        style={[
          styles.matchCardContainer,
          {
            transform: [
              {
                scale: contentFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMatchPress(item.id)}
          activeOpacity={0.8}
          style={[
            styles.matchCardTouchable, // Updated style name
            item.status === 'in_progress' && styles.liveMatchCard,
          ]}
        >
          <LinearGradient
            colors={isExpanded 
              ? ['rgba(252, 163, 17, 0.25)', 'rgba(252, 163, 17, 0.15)', '#1A1A1A'] 
              : ['rgba(252, 163, 17, 0.18)', 'rgba(252, 163, 17, 0.08)', '#151515']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.matchCardGradient}
          >
            {/* League & Status Banner (removed date from here) */}
            <View style={styles.leagueBanner}>
              <Text style={styles.leagueText}>{item.league}</Text>
              {getStatusIndicator(item.status)}
            </View>

            {/* Match Header Layout */}
            <View style={styles.matchHeader}>
              {/* Home Team Section */}
              <View style={styles.teamSection}>
                <View style={styles.teamLogoContainer}>
                  <Image source={{ uri: item.homeTeamLogo }} style={styles.teamLogo} />
                </View>
                <Text style={styles.teamName} numberOfLines={2} ellipsizeMode="tail">
                  {item.homeTeam}
                </Text>
                <Text style={[styles.teamScore, scoreStyles.homeStyle]}>
                  {item.homeScore}
                </Text>
              </View>
              
              {/* VS Divider with Date */}
              <View style={styles.vsSection}>
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <Text style={styles.finalScoreText}>
                  {item.homeScore} - {item.awayScore}
                </Text>
                {/* Add centered date here */}
                <Text style={styles.centerDateText}>
                  {item.status === 'scheduled' 
                    ? `${dayjs(item.date).format("MMM DD")} • ${dayjs(item.date).format("h:mm A")}`
                    : dayjs(item.date).format("MMM DD, YYYY")}
                </Text>
              </View>
              
              {/* Away Team Section */}
              <View style={styles.teamSection}>
                <View style={styles.teamLogoContainer}>
                  <Image source={{ uri: item.awayTeamLogo }} style={styles.teamLogo} />
                </View>
                <Text style={styles.teamName} numberOfLines={2} ellipsizeMode="tail">
                  {item.awayTeam}
                </Text>
                <Text style={[styles.teamScore, scoreStyles.awayStyle]}>
                  {item.awayScore}
                </Text>
              </View>
            </View>

            {/* Venue */}
            <View style={styles.venueContainer}>
              <Text style={styles.venueText}>{item.venue}</Text>
            </View>

            {/* Expanded content if needed */}
            {isExpanded && (() => {
              const matchDetails = getMatchDetails(item.id);
              return (
                <View style={styles.expandedContent}>
                  {matchDetails && (
                    <View style={styles.matchInfoContainer}>
                      <Text style={styles.matchInfoTitle}>Match Information</Text>
                      <View style={styles.matchInfoContent}>
                        <Text style={styles.matchInfoLabel}>
                          Home Team: <Text style={styles.matchInfoValue}>{matchDetails.homeTeamName}</Text>
                        </Text>
                        <Text style={styles.matchInfoLabel}>
                          Away Team: <Text style={styles.matchInfoValue}>{matchDetails.awayTeamName}</Text>
                        </Text>
                        <Text style={styles.matchInfoLabel}>
                          Final Score: <Text style={styles.matchInfoValue}>{matchDetails.homeScore} - {matchDetails.awayScore}</Text>
                        </Text>
                        {matchDetails.locationName && (
                          <Text style={styles.matchInfoLabel}>
                            Location: <Text style={styles.matchInfoValue}>{matchDetails.locationName}</Text>
                          </Text>
                        )}
                        {matchDetails.courtName && (
                          <Text style={styles.matchInfoLabel}>
                            Court: <Text style={styles.matchInfoValue}>{matchDetails.courtName}</Text>
                          </Text>
                        )}
                        {matchDetails.startTime && (
                          <Text style={styles.matchInfoLabel}>
                            Start Time: <Text style={styles.matchInfoValue}>{dayjs(matchDetails.startTime).format("MMM DD, YYYY h:mm A")}</Text>
                          </Text>
                        )}
                        {matchDetails.status && (
                          <Text style={styles.matchInfoLabel}>
                            Status: <Text style={styles.matchInfoValue}>{matchDetails.status.toUpperCase()}</Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };


  const renderFilterModal = () => {
    if (!showFilters) {
      return null;
    }
    
    return (
      <Animated.View
        style={[
          styles.filterModal,
          {
            opacity: modalFadeAnim,
            transform: [{ translateY: modalFadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })}],
          }
        ]}
      >
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter Matches</Text>
          <TouchableOpacity onPress={toggleFilters} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterContent}>          
          
          {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {filterOptions.dateRange.start 
                    ? dayjs(filterOptions.dateRange.start).format('MMM DD, YYYY') 
                    : 'Start Date'}
                </Text>
                <AntDesign name="calendar" size={20} color="#AAA" />
              </TouchableOpacity>
              
              <Text style={styles.dateRangeSeparator}>to</Text>
              
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {filterOptions.dateRange.end 
                    ? dayjs(filterOptions.dateRange.end).format('MMM DD, YYYY') 
                    : 'End Date'}
                </Text>
                <AntDesign name="calendar" size={20} color="#AAA" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Team Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Team</Text>
            <TextInput
              style={styles.teamInput}
              placeholder="Search for a team..."
              placeholderTextColor="#AAA"
              value={filterOptions.team || ''}
              onChangeText={(text) => updateTeamFilter(text)}
            />
          </View>
        </View>
        
        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyList = () => {
    if (status === "loading") {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.emptyText}>Loading match history...</Text>
        </View>
      );
    }

    if (status === "failed" && gamesError) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="exclamation-circle" size={50} color="#FF4444" />
          <Text style={styles.emptyText}>Error Loading Match History</Text>
          <Text style={styles.emptySubtext}>{gamesError}</Text>
          <TouchableOpacity style={styles.resetFiltersButton} onPress={handleRefresh}>
            <Text style={styles.resetFiltersText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6 name="history" size={50} color="#333" />
        <Text style={styles.emptyText}>No match history found</Text>
        <Text style={styles.emptySubtext}>
          {filteredMatches.length === 0 && matches.length > 0 
            ? "Try adjusting your filters" 
            : "You don't have any completed matches yet"}
        </Text>
        {filteredMatches.length === 0 && matches.length > 0 ? (
          <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
            <Text style={styles.resetFiltersText}>Reset Filters</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resetFiltersButton} onPress={handleRefresh}>
            <Text style={styles.resetFiltersText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />
      

      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
            opacity: headerOpacity,
          }
        ]}
      >

        <BackButton />
        <Text style={styles.title}>Match History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFilters}>
            <Ionicons name="filter" size={24} color="white" />
            {(filterOptions.league || filterOptions.team || 
              filterOptions.dateRange.start || filterOptions.dateRange.end) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: contentFadeAnim }]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams, leagues, venues..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
              <AntDesign name="close" size={20} color="#AAA" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
              onPress={() => handleTabChange('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'in_progress' && styles.activeTab]} 
              onPress={() => handleTabChange('in_progress')}
            >
              <View style={styles.tabContent}>
                <View style={styles.liveDotSmall} />
                <Text style={[styles.tabText, activeTab === 'in_progress' && styles.activeTabText]}>IN PROGRESS</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]} 
              onPress={() => handleTabChange('scheduled')}
            >
              <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>SCHEDULED</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
              onPress={() => handleTabChange('completed')}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>COMPLETED</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Match List */}
        <Animated.FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.matchList}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmptyList}
        />
      </Animated.View>

      {renderFilterModal()}
    </SafeAreaView>
  );
};

export default MatchHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    zIndex: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    height: 45,
  },
  clearSearch: {
    padding: 5,
  },
  tabsContainer: {
    marginBottom: 10,
  },
  tabs: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#1A1A1A",
  },
  activeTab: {
    backgroundColor: "#FFD700",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    color: "#AAA",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000",
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF4136",
    marginRight: 5,
  },
  matchList: {
    paddingBottom: 20,
  },
  matchCardContainer: {
    marginBottom: 15,
  },
  matchCardTouchable: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden', 
  },
    matchCardGradient: {
    flex: 1, // Important: makes gradient fill container
    padding: 16,
    borderRadius: 15,
    minHeight: 120, // Ensures consistent height
  },
  liveMatchCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#FF4136",
  },
  leagueBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  leagueText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 12,
  },
  dateText: {
    color: "#AAA",
    fontSize: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 65, 54, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4136",
    marginRight: 5,
  },
  liveText: {
    color: "#FF4136",
    fontSize: 10,
    fontWeight: "bold",
  },
  upcomingText: {
    color: "#4CAF50",
    fontSize: 10,
    fontWeight: "bold",
  },
  completedText: {
    color: "#9E9E9E",
    fontSize: 10,
    fontWeight: "bold",
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  teamSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0, // Allow shrinking
  },
  awayTeamContainer: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse", // Logo on the right for away team
  },
  teamLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#3A3A3A",
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  teamName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    minHeight: 36,
    lineHeight: 18,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 80, // Fixed minimum width for score area
    maxWidth: 100, // Maximum width to prevent expansion
  },
  teamScore: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  venueText: {
    color: "#AAA",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  expandedContent: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 15,
  },
  matchInfoContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
    vsSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    minWidth: 80,
  },
  
  vsContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  
  vsText: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "bold",
  },
  
  finalScoreText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  venueContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
    winningScore: {
    color: "#4CAF50", // Changed from "#FFD700"
  },
  losingScore: {
    color: "#FF6B6B", // Changed from "#AAA"
  },
  tieScore: {
    color: "#FFD700", // Changed from "#FFF"
  },
  centerDateText: {
    color: "#AAA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  matchInfoTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  matchInfoContent: {
    gap: 4,
  },
  matchInfoLabel: {
    color: "#AAA",
    fontSize: 14,
  },
  matchInfoValue: {
    color: "#FFF",
    fontWeight: "600",
  },
  infoMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  infoMessageText: {
    color: "#FFD700",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  basicStatsContainer: {
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  basicStatsTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  basicStatsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  basicStatItem: {
    alignItems: "center",
    flex: 1,
  },
  basicStatTeam: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  basicStatScore: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  basicStatLabel: {
    color: "#AAA",
    fontSize: 12,
  },
  basicStatVs: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  basicStatVsText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "bold",
  },
  statPlaceholder: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  mvpContainer: {
    marginBottom: 20,
  },
  mvpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  mvpTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  mvpContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 10,
    padding: 10,
  },
  mvpImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  mvpStatsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 10,
  },
  statBubble: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 8,
    minWidth: 60,
  },
  statBubbleValue: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
  statBubbleLabel: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsGrid: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  statLabelContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  statLabel: {
    color: "#AAA",
    fontSize: 12,
  },
  statBarWrapper: {
    flexDirection: "row",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
  },
  homeStatBar: {
    backgroundColor: "#4CAF50",
  },
  awayStatBar: {
    backgroundColor: "#2196F3",
  },
  homeStatValue: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  awayStatValue: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: 15,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFD700",
    marginTop: 5,
  },
  timelineLine: {
    position: "absolute",
    left: 5.5,
    top: 17,
    width: 1,
    height: 30,
    backgroundColor: "#333",
  },
  timelineContent: {
    flex: 1,
    marginLeft: 15,
  },
  timelineTime: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  timelineDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
  },
  timelinePlayer: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  timelineDescription: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
  },
  highlightsContainer: {
    marginBottom: 20,
  },
  highlightsTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  highlightsScroll: {
    flexDirection: "row",
  },
  highlightThumbnail: {
    width: 120,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    position: "relative",
  },
  highlightImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  playIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 10,
    padding: 12,
  },
  viewDetailsText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  filterModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  filterContent: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: "#FFD700",
  },
  filterOptionText: {
    color: "#FFF",
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#000",
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateInputText: {
    color: "#FFF",
    fontSize: 14,
  },
  dateRangeSeparator: {
    color: "#AAA",
    marginHorizontal: 10,
  },
  teamInput: {
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#FFF",
    fontSize: 14,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 15,
    marginRight: 10,
  },
  resetButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  applyButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingVertical: 15,
  },
  applyButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubtext: {
    color: "#AAA",
    fontSize: 14,
    marginTop: 5,
  },
  resetFiltersButton: {
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  resetFiltersText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
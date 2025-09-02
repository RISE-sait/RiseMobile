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
import { useMatchFilters } from '../../../hooks/useMatchFIlters';
import BackButton from "@/components/buttons/BackButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchMatchHistory, clearMatches } from "../../../store/slices/gamesSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const MatchHistory: React.FC = () => {
  // Redux state
  const dispatch = useAppDispatch();
  const matches = useAppSelector((state) => state.games.items);
  const status = useAppSelector((state) => state.games.status);
  const error = useAppSelector((state) => state.games.error);
  const token = useAppSelector((state) => state.user.data?.token);
  
  // Animation refs - separate animations for different purposes
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Local state
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Transform Redux matches to match the expected format for useMatchFilters hook
  const transformedMatches = useMemo(() => {
    console.log("📋 MATCH HISTORY: Transforming", matches.length, "matches");
    console.log("📋 MATCH HISTORY: Raw matches:", matches);
    
    const transformed = matches.map(match => ({
      id: match.id,
      date: match.date || dayjs().format("YYYY-MM-DD"),
      homeTeam: match.name || "Team A", // Use match name as team name
      awayTeam: "vs Opponent", // API doesn't have away team, use generic
      homeTeamLogo: "https://via.placeholder.com/40x40?text=T1",
      awayTeamLogo: "https://via.placeholder.com/40x40?text=T2", 
      homeScore: match.win_score || 0,
      awayScore: match.lose_score || 0,
      homeFG: 45, // Mock data for field goals %
      awayFG: 42,
      homeRebounds: 35, // Mock data for rebounds
      awayRebounds: 30,
      homeAssists: 20, // Mock data for assists
      awayAssists: 18,
      status: "completed" as const, // Historical matches are completed
      venue: match.location || "RISE Basketball Facility",
      league: match.program_type || "Basketball League",
      mvp: {
        id: "mvp1",
        name: "Player MVP",
        image: "https://via.placeholder.com/70x70?text=MVP",
        points: 25,
        assists: 8,
        rebounds: 10
      },
      events: [],
      highlights: []
    }));
    
    console.log("📋 MATCH HISTORY: Transformed matches:", transformed);
    return transformed;
  }, [matches]);

  // Use our custom hook for filtering - now using transformed matches
  const {
    showFilters,
    activeTab,
    searchQuery,
    filterOptions,
    filteredMatches,
    setSearchQuery,
    toggleFilters,
    handleTabChange,
    applyFilters,
    resetFilters,
    toggleLeagueFilter,
    updateTeamFilter,
  } = useMatchFilters(transformedMatches);

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
    
    // Fetch historical matches when component mounts
    loadMatchHistory();
  }, []);

  // Fetch historical matches function
  const loadMatchHistory = async () => {
    console.log("📋 MATCH HISTORY: Starting to fetch match history...");
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
      console.log("📋 MATCH HISTORY: Clearing matches and fetching history...");
      dispatch(clearMatches());
      dispatch(fetchMatchHistory(authToken));
    } else {
      console.log("📋 MATCH HISTORY: No auth token available");
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatchHistory();
    setRefreshing(false);
  };

  const handleMatchPress = (id: string) => {
    setSelectedMatch(selectedMatch === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        );
      case 'upcoming':
        return <Text style={styles.upcomingText}>UPCOMING</Text>;
      default:
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

  const renderMatchItem = ({ item }) => {
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
            styles.matchCard,
            isExpanded && styles.matchCardExpanded,
            item.status === 'live' && styles.liveMatchCard,
          ]}
        >
          {/* League & Date Banner */}
          <View style={styles.leagueBanner}>
            <Text style={styles.leagueText}>{item.league}</Text>
            <Text style={styles.dateText}>
              {item.status === 'upcoming' 
                ? `${dayjs(item.date).format("ddd, MMM DD")} • ${dayjs(item.date).format("h:mm A")}`
                : dayjs(item.date).format("DD MMM YYYY")}
            </Text>
            {getStatusIndicator(item.status)}
          </View>

          {/* Match Header */}
          <View style={styles.matchHeader}>
            <View style={styles.teamContainer}>
              <Image source={{ uri: item.homeTeamLogo }} style={styles.teamLogo} />
              <Text style={styles.teamName}>{item.homeTeam}</Text>
            </View>
            
            {/* Score Container */}
            <View style={styles.scoreContainer}>
              <Text style={[styles.score, scoreStyles.homeStyle]}>{item.homeScore}</Text>
              <Text style={styles.vsText}>-</Text>
              <Text style={[styles.score, scoreStyles.awayStyle]}>{item.awayScore}</Text>
            </View>
            
            <View style={[styles.teamContainer, styles.awayTeamContainer]}>
              <Text style={styles.teamName}>{item.awayTeam}</Text>
              <Image source={{ uri: item.awayTeamLogo }} style={styles.teamLogo} />
            </View>
          </View>

          {/* Venue */}
          <Text style={styles.venueText}>{item.venue}</Text>

          {/* Expandable Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* MVP of the Match */}
              {item.status === 'completed' && (
                <View style={styles.mvpContainer}>
                  <View style={styles.mvpHeader}>
                    <FontAwesome6 name="trophy" size={16} color="#FFD700" />
                    <Text style={styles.mvpTitle}>MVP: {item.mvp.name}</Text>
                  </View>
                  <View style={styles.mvpContent}>
                    <Image source={{ uri: item.mvp.image }} style={styles.mvpImage} />
                    <View style={styles.mvpStatsContainer}>
                      <View style={styles.statBubble}>
                        <Text style={styles.statBubbleValue}>{item.mvp.points}</Text>
                        <Text style={styles.statBubbleLabel}>PTS</Text>
                      </View>
                      <View style={styles.statBubble}>
                        <Text style={styles.statBubbleValue}>{item.mvp.assists}</Text>
                        <Text style={styles.statBubbleLabel}>AST</Text>
                      </View>
                      <View style={styles.statBubble}>
                        <Text style={styles.statBubbleValue}>{item.mvp.rebounds}</Text>
                        <Text style={styles.statBubbleLabel}>REB</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Match Stats */}
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Match Stats</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statRow}>
                    <Text style={styles.homeStatValue}>{item.homeFG}%</Text>
                    <View style={styles.statBarContainer}>
                      <View style={styles.statLabelContainer}>
                        <Text style={styles.statLabel}>Field Goals</Text>
                      </View>
                      <View style={styles.statBarWrapper}>
                        <View style={[styles.statBar, styles.homeStatBar, { width: `${item.homeFG}%` }]} />
                        <View style={[styles.statBar, styles.awayStatBar, { width: `${item.awayFG}%` }]} />
                      </View>
                    </View>
                    <Text style={styles.awayStatValue}>{item.awayFG}%</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.homeStatValue}>{item.homeRebounds}</Text>
                    <View style={styles.statBarContainer}>
                      <View style={styles.statLabelContainer}>
                        <Text style={styles.statLabel}>Rebounds</Text>
                      </View>
                      <View style={styles.statBarWrapper}>
                        <View 
                          style={[
                            styles.statBar, 
                            styles.homeStatBar, 
                            { width: `${(item.homeRebounds / (item.homeRebounds + item.awayRebounds)) * 100}%` }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.statBar, 
                            styles.awayStatBar, 
                            { width: `${(item.awayRebounds / (item.homeRebounds + item.awayRebounds)) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    <Text style={styles.awayStatValue}>{item.awayRebounds}</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.homeStatValue}>{item.homeAssists}</Text>
                    <View style={styles.statBarContainer}>
                      <View style={styles.statLabelContainer}>
                        <Text style={styles.statLabel}>Assists</Text>
                      </View>
                      <View style={styles.statBarWrapper}>
                        <View 
                          style={[
                            styles.statBar, 
                            styles.homeStatBar, 
                            { width: `${(item.homeAssists / (item.homeAssists + item.awayAssists)) * 100}%` }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.statBar, 
                            styles.awayStatBar, 
                            { width: `${(item.awayAssists / (item.homeAssists + item.awayAssists)) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    <Text style={styles.awayStatValue}>{item.awayAssists}</Text>
                  </View>
                </View>
              </View>

              {/* Highlights */}
              {item.highlights && item.highlights.length > 0 && (
                <View style={styles.highlightsContainer}>
                  <Text style={styles.highlightsTitle}>Highlights</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
                    {item.highlights.map((highlight, index) => (
                      <TouchableOpacity key={index} style={styles.highlightThumbnail}>
                        <Image source={{ uri: highlight }} style={styles.highlightImage} />
                        <View style={styles.playIconContainer}>
                          <FontAwesome6 name="play" size={16} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* View Full Details Button */}
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Match Details</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#FFD700" />
              </TouchableOpacity>
            </View>
          )}
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
          {/* League Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>League</Text>
            <View style={styles.filterOptions}>
              {['NBA', 'EuroLeague', 'NCAA', 'FIBA'].map(league => (
                <TouchableOpacity 
                  key={league}
                  style={[
                    styles.filterOption,
                    filterOptions.league === league && styles.filterOptionSelected
                  ]}
                  onPress={() => toggleLeagueFilter(league)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.league === league && styles.filterOptionTextSelected
                  ]}>{league}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
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

    if (status === "failed" && error) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="exclamation-circle" size={50} color="#FF4444" />
          <Text style={styles.emptyText}>Error Loading Match History</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
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
              style={[styles.tab, activeTab === 'live' && styles.activeTab]} 
              onPress={() => handleTabChange('live')}
            >
              <View style={styles.tabContent}>
                <View style={styles.liveDotSmall} />
                <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>Live</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} 
              onPress={() => handleTabChange('upcoming')}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
              onPress={() => handleTabChange('completed')}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
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
  matchCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  matchCardExpanded: {
    backgroundColor: "#222",
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
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  awayTeamContainer: {
    justifyContent: "flex-end",
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  teamName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  winningScore: {
    color: "#FFD700",
  },
  losingScore: {
    color: "#AAA",
  },
  tieScore: {
    color: "#FFF",
  },
  vsText: {
    color: "#AAA",
    fontSize: 18,
    fontWeight: "bold",
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
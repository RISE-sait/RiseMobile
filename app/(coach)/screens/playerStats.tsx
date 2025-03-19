import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, StatusBar, Animated, StyleSheet, View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import players from "../../(coach)/data/players";
import { COLORS } from "../../../constants/colors";
import { seasonStats, performanceTrendData, recentGames, comparisonData, shotChartData, radarData } from "../../(coach)/data/mockData";

// Import components
import PlayerHeader from "../../components/playerStats/PlayerHeader";
import PlayerSelector from "../../components/playerStats/PlayerSelector";
import CategoryTabs from "../../components/playerStats/CategoryTabs";
import SeasonSelector from "../../components/playerStats/SeasonSelector";
import KeyStats from "../../components/playerStats/KeyStats";
import CoachActions from "../../components/playerStats/CoachActions";
import PerformanceTrend from "../../components/playerStats/PerformanceTrend";
import RecentGames from "../../components/playerStats/RecentGames";
import ComparisonChart from "../../components/playerStats/ComparisonChart";
import ShotChart from "../../components/playerStats/ShotChart";
import StrengthsWeaknesses from "../../components/playerStats/StrengthsWeaknesses";

// Stat categories list 
const statCategories = [
  { id: "overview", label: "Overview" },
  { id: "offense", label: "Offense" },
  { id: "shooting", label: "Shooting" },
  { id: "defense", label: "Defense" },
  { id: "advanced", label: "Advanced" },
];



const PlayerStats = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const player = players.find((p) => p.id === params.id) || null;

  const [activeCategory, setActiveCategory] = useState("overview");
  const [activeSeason, setActiveSeason] = useState("2023-24");

  // Get current season stats (or fallback to default)
  const currentSeasonStats =
    seasonStats.find((s) => s.season === activeSeason) || {
      ppg: 0,
      rpg: 0,
      apg: 0,
      spg: 0,
      bpg: 0,
      fg: 0,
      threePt: 0,
      ft: 0,
    };
  

  // Scroll animation reference
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
  
      <PlayerHeader player={player} scrollY={scrollY} />
  
      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <PlayerSelector players={players} selectedPlayer={player} />
  
        {/* Show message when no player is selected */}
        {!player ? (
          <View style={styles.noPlayerContainer}>
            <Text style={styles.noPlayerText}>Select a player to view statistics</Text>
          </View>
        ) : (
          <>
            <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} statCategories={statCategories} />
            <SeasonSelector activeSeason={activeSeason} setActiveSeason={setActiveSeason} seasonStats={seasonStats} />
            <KeyStats stats={currentSeasonStats} />
            <CoachActions playerId={player?.id} />
            <PerformanceTrend performanceTrendData={performanceTrendData} />
            <RecentGames recentGames={recentGames} />
            <ComparisonChart comparisonData={comparisonData} />
            <ShotChart shotChartData={shotChartData} />
            <StrengthsWeaknesses strengths={player?.strengths || []} weaknesses={player?.weaknesses || []} />
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}  
  

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollViewContent: { paddingBottom: 40 },
  
    // Styles for "Select a player" message
    noPlayerContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 50,
    },
    noPlayerText: {
      color: COLORS.textSecondary,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
  });
  
export default PlayerStats;

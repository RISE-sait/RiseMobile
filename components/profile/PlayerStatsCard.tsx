import React, { useEffect, useRef } from "react"
import { View, Text, Animated, TouchableOpacity } from "react-native"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import {
  faStar,
  faBasketball,
  faHandsHelping,
  faChartLine,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons"

interface StatItem {
  value: number
  label: string
  icon: any
  color: string
  previousValue?: number
}

interface PlayerStatsCardProps {
  overallRating: number
  pointsPerGame: number
  assistsPerGame: number
  reboundsPerGame?: number
  stealsPerGame?: number
  blocksPerGame?: number
  fieldGoalPercentage?: number
  previousStats?: {
    pointsPerGame?: number
    assistsPerGame?: number
    reboundsPerGame?: number
  }
  onViewDetailedStats?: () => void
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  overallRating=0,
  pointsPerGame=0,
  assistsPerGame=0,
  reboundsPerGame = 0,
  stealsPerGame = 0,
  blocksPerGame = 0,
  fieldGoalPercentage = 0,
  previousStats = {},
  onViewDetailedStats,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const [expanded, setExpanded] = React.useState(false)

  // Animate card on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Primary stats that are always shown
  const primaryStats: StatItem[] = [
    {
      value: overallRating,
      label: "Rating",
      icon: faStar,
      color: "#FCA311",
      previousValue: undefined, // Ratings don't typically have previous values
    },
    {
      value: pointsPerGame,
      label: "PPG",
      icon: faBasketball,
      color: "#E63946",
      previousValue: previousStats.pointsPerGame,
    },
    {
      value: assistsPerGame,
      label: "APG",
      icon: faHandsHelping,
      color: "#4361EE",
      previousValue: previousStats.assistsPerGame,
    },
  ]

  // Secondary stats that are shown when expanded
  const secondaryStats: StatItem[] = [
    {
      value: reboundsPerGame,
      label: "RPG",
      icon: faChartLine,
      color: "#4CC9F0",
      previousValue: previousStats.reboundsPerGame,
    },
    {
      value: stealsPerGame,
      label: "SPG",
      icon: faChartLine,
      color: "#7209B7",
      previousValue: undefined,
    },
    {
      value: blocksPerGame,
      label: "BPG",
      icon: faChartLine,
      color: "#F72585",
      previousValue: undefined,
    },
  ]

  // Render a stat item with optional trend indicator
  const renderStatItem = (stat: StatItem) => {
    const showTrend = stat.previousValue !== undefined
    const isImproved = showTrend && stat.value > stat.previousValue!
    const isDeclined = showTrend && stat.value < stat.previousValue!

    return (
      <View className="items-center" key={stat.label}>
        <View
          className="w-12 h-12 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: `${stat.color}20` }}
        >
          <FontAwesomeIcon icon={stat.icon} size={18} color={stat.color} />
        </View>

        <View className="flex-row items-center">
          <Text className="text-white-100 text-2xl font-bold">
            {stat.value.toFixed(stat.label === "Rating" ? 0 : 1)}
          </Text>

          {showTrend && (isImproved || isDeclined) && (
            <FontAwesomeIcon
              icon={isImproved ? faChevronUp : faChevronDown}
              size={12}
              color={isImproved ? "#4ade80" : "#ef4444"}
              style={{ marginLeft: 4, marginTop: 2 }}
            />
          )}
        </View>

        <Text className="text-gray-400 text-sm">{stat.label}</Text>
      </View>
    )
  }

  return (
    <Animated.View
      className="px-4 w-full my-5"
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <View className="bg-[#1A1A1A] py-5 px-4 rounded-3xl shadow-lg shadow-black">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white-100 text-xl font-bold uppercase">Player Stats</Text>

          <TouchableOpacity className="bg-[#252525] px-3 py-1 rounded-full" onPress={() => setExpanded(!expanded)}>
            <Text className="text-gold-100 text-xs font-semibold">{expanded ? "LESS" : "MORE"}</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Stats */}
        <View className="flex-row justify-around mb-4">{primaryStats.map(renderStatItem)}</View>

        {/* Secondary Stats (Expandable) */}
        {expanded && (
          <>
            <View className="h-px bg-[#333] my-4" />
            <View className="flex-row justify-around mt-2">{secondaryStats.map(renderStatItem)}</View>

            {/* Field Goal Percentage */}
            <View className="mt-6 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">Field Goal %</Text>
                <Text className="text-white-100 text-sm font-bold">{fieldGoalPercentage}%</Text>
              </View>
              <View className="h-2 bg-[#252525] rounded-full overflow-hidden">
                <View className="h-full bg-gold-100 rounded-full" style={{ width: `${fieldGoalPercentage}%` }} />
              </View>
            </View>
          </>
        )}

        {/* View Detailed Stats Button */}
        {onViewDetailedStats && (
          <TouchableOpacity className="bg-gold-100 py-3 rounded-xl mt-6" onPress={onViewDetailedStats}>
            <Text className="text-black text-center font-bold">VIEW DETAILED STATS</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )
}

export default PlayerStatsCard


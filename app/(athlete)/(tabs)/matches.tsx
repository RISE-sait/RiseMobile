// Replace your MatchesScreen component with this fixed version:

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated, InteractionManager } from "react-native"
import dayjs from "dayjs"
import { SafeAreaView } from "react-native-safe-area-context"
import MatchCard from "../../../components/events/MatchCard"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { fetchMatches, clearMatches } from "../../../store/slices/gamesSlice"
import LoadingIndicator from "../../../components/feedback/LoadingIndicator"
import EmptyState from "../../../components/feedback/EmptyState"
import { useAuth } from "@/utils/auth"
import Constants from "expo-constants"

const { width } = Dimensions.get("window")

// Fixed function to generate exactly 13 days (6 before + today + 6 after)
const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  const startDate = today.subtract(6, "day");
  const endDate = today.add(6, "day");
  const totalDays = 13; // Always 13 days
  
  return Array.from({ length: totalDays }, (_, i) => startDate.add(i, "day"));
}

const MatchesScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const matches = useAppSelector((state) => state.games.items)
  const status = useAppSelector((state) => state.games.status)
  const error = useAppSelector((state) => state.games.error)
  const token = useAppSelector((state) => state.user.data?.token)
  const { getValidToken, forceReLogin } = useAuth()

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [weekDates] = useState(() => generateWeekDates()) // Use function to ensure fresh generation
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const fetchInteractionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null)

  // Center on today function
  const centerOnToday = useCallback(() => {
    const todayIndex = weekDates.findIndex((date) => date.isSame(dayjs(), "day"))
    
    if (flatListRef.current && todayIndex !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: todayIndex, 
          animated: true,
          viewPosition: 0.5 // Center the item
        })
      }, 300)
    }
  }, [weekDates])

  // Reusable token getter with fallback logic
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const authToken = await getValidToken()
      if (!authToken) {
        await forceReLogin("Session expired. Please log in again.")
      }
      return authToken
    } catch (err) {
      console.error("Error obtaining auth token:", err)
      return null
    }
  }, [forceReLogin, getValidToken])

  useEffect(() => {
    if (fetchInteractionRef.current) {
      fetchInteractionRef.current.cancel()
    }

    fetchInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
      const authToken = await getAuthToken()

      if (authToken) {
        dispatch(clearMatches())
        dispatch(fetchMatches(authToken))
      }
    })

    return () => {
      fetchInteractionRef.current?.cancel()
      fetchInteractionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    // Center on today when component mounts
    centerOnToday()
  }, [centerOnToday])

  // Filter matches by selected date
  const filteredMatches = matches.filter((match) => {
    const matchDate = match.date || dayjs().format("YYYY-MM-DD")
    return matchDate === selectedDate
  })

  // Debug logging - MATCHES PAGE

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate
    const isToday = item.isSame(dayjs(), "day")

    const label = isToday
      ? "Today"
      : item.isSame(dayjs().subtract(1, "day"), "day")
        ? "Yesterday"
        : item.isSame(dayjs().add(1, "day"), "day")
          ? "Tomorrow"
          : item.format("DD MMM")

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        className={`mx-1 rounded-lg items-center justify-center ${isSelected ? "bg-gold-100" : "bg-white-100/10"}`}
        style={{
          width: 70,
          height: 50,
          shadowColor: isSelected ? "#FCA311" : "#000",
          shadowOpacity: isSelected ? 0.5 : 0.1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
        }}
        onPress={() => setSelectedDate(item.format("YYYY-MM-DD"))}
      >
        <Text className={`font-semibold text-xs uppercase ${isSelected ? "text-black" : "text-gray-200"}`}>
          {label}
        </Text>
      </TouchableOpacity>
    )
  }

  // Render loading state
  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2 justify-center items-center">
        <LoadingIndicator size="large" color="#FCA311" />
        <Text className="text-white-100 mt-4">Loading matches...</Text>
      </SafeAreaView>
    )
  }

  // Render error state
  if (status === "failed" && error) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2 justify-center items-center">
        <EmptyState
          icon="exclamation-circle"
          title="Error Loading Matches"
          message={error}
          actionLabel="Try Again"
          onAction={() => {
            const fetchData = async () => {
              const authToken = await getAuthToken()

              if (authToken) {
                dispatch(clearMatches())
                dispatch(fetchMatches(authToken))
              }
            }

            fetchData()
          }}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pb-4 border-b border-white-100/10 flex-row justify-between items-center">
          <Text className="text-white-100 text-3xl font-bold">Matches</Text>
          <TouchableOpacity
            onPress={() => {
              fetchInteractionRef.current?.cancel()
              fetchInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
                const authToken = await getAuthToken()

                if (authToken) {
                  dispatch(clearMatches())
                  dispatch(fetchMatches(authToken))
                }
              })
            }}
          >
            <Text className="text-gold-100 font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Calendar */}
        <FlatList
          ref={flatListRef}
          data={weekDates}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.format("YYYY-MM-DD")}
          renderItem={renderDateItem}
          contentContainerStyle={{ paddingHorizontal: width / 2 - 35, marginVertical: 15 }}
          getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
          initialScrollIndex={6} // Start at index 6 (today, since we have 6 days before)
          onScrollToIndexFailed={(info) => {
            // Fallback: scroll to the nearest valid index
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ 
                index: Math.min(info.index, weekDates.length - 1), 
                animated: true 
              })
            }, 100)
          }}
        />

        {/* Match Cards or Empty State */}
        {filteredMatches.length ? (
          <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
            {filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)}
          </ScrollView>
        ) : (
          <EmptyState
            icon="calendar-days"
            title="No Matches Found"
            message="You don't have any matches scheduled for this date. Check other dates or contact your coach for upcoming games."
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default MatchesScreen

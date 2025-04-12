"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated } from "react-native"
import dayjs from "dayjs"
import { SafeAreaView } from "react-native-safe-area-context"
import MatchCard from "../../../components/events/MatchCard"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { fetchMatches } from "../../../store/slices/gamesSlice"
import LoadingIndicator from "../../../components/feedback/LoadingIndicator"
import EmptyState from "../../../components/feedback/EmptyState"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs()
  return Array.from({ length: 17 }, (_, i) => today.add(i - 8, "day"))
}

const MatchesScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: matches, status, error } = useAppSelector((state) => state.games)
  const token = useAppSelector((state) => state.user.data?.token)

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [weekDates] = useState(generateWeekDates)
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fetch matches when component mounts
    const fetchData = async () => {
      let authToken = token

      if (!authToken) {
        try {
          const userString = await AsyncStorage.getItem("user")
          if (userString) {
            const userData = JSON.parse(userString)
            authToken = userData.token
          }
        } catch (err) {
          console.error("Error getting token from AsyncStorage:", err)
        }
      }

      if (authToken) {
        dispatch(fetchMatches(authToken))
      }
    }

    fetchData()
  }, [dispatch, token])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    const todayIndex = weekDates.findIndex((date) => date.isSame(dayjs(), "day"))

    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: todayIndex, animated: true })
      }, 300)
    }
  }, [weekDates])

  // Filter matches by selected date
  const filteredMatches = matches.filter((match) => {
    const matchDate = match.created_at ? dayjs(match.created_at).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
    return matchDate === selectedDate
  })

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate

    const label = item.isSame(dayjs(), "day")
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
              let authToken = token

              if (!authToken) {
                try {
                  const userString = await AsyncStorage.getItem("user")
                  if (userString) {
                    const userData = JSON.parse(userString)
                    authToken = userData.token
                  }
                } catch (err) {
                  console.error("Error getting token from AsyncStorage:", err)
                }
              }

              if (authToken) {
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
              const fetchData = async () => {
                let authToken = token

                if (!authToken) {
                  try {
                    const userString = await AsyncStorage.getItem("user")
                    if (userString) {
                      const userData = JSON.parse(userString)
                      authToken = userData.token
                    }
                  } catch (err) {
                    console.error("Error getting token from AsyncStorage:", err)
                  }
                }

                if (authToken) {
                  dispatch(fetchMatches(authToken))
                }
              }

              fetchData()
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
          contentContainerStyle={{ paddingHorizontal: width / 2 - 70, marginVertical: 15 }}
          getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
        />

        {/* Match Cards */}
        <ScrollView className="px-4">
          {filteredMatches.length ? (
            filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)
          ) : (
            <View className="mt-10 items-center">
              <FontAwesome6 name="calendar-xmark" size={40} color="#555" />
              <Text className="text-gray-400 mt-3 font-semibold">No matches scheduled for this date.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default MatchesScreen

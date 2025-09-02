import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated } from "react-native"
import dayjs from "dayjs"
import { SafeAreaView } from "react-native-safe-area-context"
import MatchCard from "../../../components/events/MatchCard"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { fetchMatches, clearMatches } from "../../../store/slices/gamesSlice"
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
  const matches = useAppSelector((state) => state.games.items)
  const status = useAppSelector((state) => state.games.status)
  const error = useAppSelector((state) => state.games.error)
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
        dispatch(clearMatches())
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

  // Debug logging
  console.log("🔍 DEBUG: Matches status:", status)
  console.log("🔍 DEBUG: Total matches:", matches.length)
  console.log("🔍 DEBUG: Filtered matches for", selectedDate, ":", filteredMatches.length)

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
                  dispatch(clearMatches())
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

        {/* Match Cards or Empty State */}
        {filteredMatches.length ? (
          <ScrollView className="px-4">
            {filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center px-6 py-12">
            <FontAwesome6 name="calendar-days" size={60} color="#FFD700" />
            <Text className="text-white text-xl font-semibold mt-4 text-center">
              No Matches Found
            </Text>
            <Text className="text-gray-400 text-base mt-2 text-center leading-6">
              You don't have any upcoming matches or tournaments scheduled.
            </Text>
            
            {/* Helpful suggestions */}
            <View className="mt-6 bg-gray-800/50 rounded-lg p-4 w-full max-w-sm">
              <Text className="text-gray-300 text-sm text-center leading-5">
                💡 To see matches here, you need to:
              </Text>
              <View className="mt-3 space-y-2">
                <Text className="text-gray-400 text-sm">
                  • Be registered for a team or program
                </Text>
                <Text className="text-gray-400 text-sm">
                  • Have matches scheduled for your teams
                </Text>
                <Text className="text-gray-400 text-sm">
                  • Participate in tournaments or competitions
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              className="mt-6 bg-[#FFD700] px-6 py-3 rounded-lg"
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
                    dispatch(clearMatches())
                    dispatch(fetchMatches(authToken))
                  }
                }

                fetchData()
              }}
            >
              <Text className="text-black font-semibold">Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default MatchesScreen

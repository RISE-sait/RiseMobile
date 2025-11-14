import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated, StyleSheet, Alert, InteractionManager } from "react-native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MatchCard from "../../../components/events/MatchCard";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import LoadingIndicator from "../../../components/feedback/LoadingIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMatches, clearMatches } from "@/store/slices/gamesSlice";
import EmptyState from "@/components/feedback/EmptyState";
import { deleteGame } from "@/utils/api";
import { fetchTeams } from "@/store/slices/teamsSlice";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/utils/auth";

const { width } = Dimensions.get("window");

// Define color constants
const COLORS = {
  primary: "#FFD700",
  background: "#0C0B0B",
};

// Fixed function to generate exactly 13 days (6 before + today + 6 after)
const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  const startDate = today.subtract(6, "day");
  const totalDays = 13; // Always 13 days

  return Array.from({ length: totalDays }, (_, i) => startDate.add(i, "day"));
};

const CoachMatches: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const matches = useAppSelector((state) => state.games.items);
  const status = useAppSelector((state) => state.games.status);
  const error = useAppSelector((state) => state.games.error);
  const token = useAppSelector((state) => state.user.data?.token);
  const { getValidToken, forceReLogin } = useAuth();

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [weekDates] = useState(() => generateWeekDates());
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const fetchInteractionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

  // Center on today function
  const centerOnToday = useCallback(() => {
    const todayIndex = weekDates.findIndex((date) => date.isSame(dayjs(), "day"));

    if (flatListRef.current && todayIndex !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }, 300);
    }
  }, [weekDates]);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const authToken = await getValidToken();
      if (!authToken) {
        await forceReLogin("Session expired. Please log in again.");
      }
      return authToken;
    } catch (err) {
      console.error("Error obtaining auth token:", err);
      return null;
    }
  }, [forceReLogin, getValidToken]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Center on today when component mounts
    centerOnToday();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fetchInteractionRef.current) {
      fetchInteractionRef.current.cancel();
    }

    fetchInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
      const authToken = await getAuthToken();
      if (!authToken) return;

      dispatch(clearMatches());
      dispatch(fetchMatches(authToken));
      dispatch(fetchTeams(authToken) as any);
    });

    return () => {
      fetchInteractionRef.current?.cancel();
      fetchInteractionRef.current = null;
    };
  }, [dispatch, getAuthToken]);

  // Navigation handlers
  const openCreateGameModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(coach)/screens/createMatch");
  };

  const openEditGameModal = (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(coach)/screens/createMatch",
      params: { gameId: game.id },
    });
  };

  const handleDeleteGame = async (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Delete Game",
      `Are you sure you want to delete "${game.name || "this game"}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const authToken = await getAuthToken();
              if (!authToken) return;

              await deleteGame(game.id, authToken);
              dispatch(clearMatches());
              dispatch(fetchMatches(authToken));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              console.error("Error deleting game:", error);
              const errorMsg =
                error.response?.data?.error?.message || error.message || "Failed to delete game";
              Alert.alert("Error", errorMsg);
            }
          },
        },
      ]
    );
  };

  // Filter matches by selected date
  const filteredMatches = matches.filter((match) => {
    const matchDate = match.date || dayjs().format("YYYY-MM-DD");
    return matchDate === selectedDate;
  });

  // Render loading state
  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2 justify-center items-center">
        <LoadingIndicator size="large" color="#FCA311" />
        <Text className="text-white-100 mt-4">Loading matches...</Text>
      </SafeAreaView>
    );
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
          onAction={async () => {
            const authToken = await getAuthToken();
            if (!authToken) return;

            dispatch(clearMatches());
            dispatch(fetchMatches(authToken));
          }}
        />
      </SafeAreaView>
    );
  }

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate;
    const isToday = item.isSame(dayjs(), "day");

    const label = isToday
      ? "Today"
      : item.isSame(dayjs().subtract(1, "day"), "day")
      ? "Yesterday"
      : item.isSame(dayjs().add(1, "day"), "day")
      ? "Tomorrow"
      : item.format("DD MMM");

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        className={`mx-1 rounded-lg items-center justify-center ${
          isSelected ? "bg-gold-100" : "bg-white-100/10"
        }`}
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
        <Text
          className={`font-semibold text-xs uppercase ${
            isSelected ? "text-black" : "text-gray-200"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        {/* Header */}
        <View className="px-6 pb-4 border-b border-white-100/10 flex-row justify-between items-center">
          <Text className="text-white-100 text-3xl font-bold">Matches</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity style={styles.createButton} onPress={openCreateGameModal}>
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const authToken = await getAuthToken();
                if (!authToken) return;

                dispatch(clearMatches());
                dispatch(fetchMatches(authToken));
              }}
            >
              <Text
                className="text-gold-100 font-semibold"
                onPress={() => {
                  fetchInteractionRef.current?.cancel();
                  fetchInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
                    const authToken = await getAuthToken();
                    if (!authToken) return;

                    dispatch(clearMatches());
                    dispatch(fetchMatches(authToken));
                  });
                }}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
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
                animated: true,
              });
            }, 100);
          }}
        />

        {/* Match Cards or Empty State */}
        {filteredMatches.length ? (
          <ScrollView className="px-4">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showActions={true}
                onEdit={openEditGameModal}
                onDelete={handleDeleteGame}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            icon="calendar-days"
            title="No Matches Found"
            message="No matches scheduled for this date. Schedule games for your teams or check other dates."
            actionLabel="Refresh"
            onAction={async () => {
              const authToken = await getAuthToken();
              if (!authToken) return;

              dispatch(clearMatches());
              dispatch(fetchMatches(authToken));
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default CoachMatches;

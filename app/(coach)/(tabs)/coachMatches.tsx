import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated, Modal, TextInput, StyleSheet, ActivityIndicator, Alert } from "react-native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchCard from "../../../components/events/MatchCard";
import { StatusBar } from "expo-status-bar";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"
import LoadingIndicator from "../../../components/feedback/LoadingIndicator"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMatches, clearMatches } from "@/store/slices/gamesSlice"
import EmptyState from "@/components/feedback/EmptyState"
import { createGame, updateGame, deleteGame, getLocations } from "@/utils/api"
import { fetchTeams } from "@/store/slices/teamsSlice"
import { ErrorToast } from "@/components/auth/ErrorToast"
import DateTimeSelector from "@/components/practiceBooking/DateTimeSelector"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window");

// Define color constants matching the team management screen
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
};

// Fixed function to generate exactly 13 days (6 before + today + 6 after)
const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  const startDate = today.subtract(6, "day");
  const endDate = today.add(6, "day");
  const totalDays = 13; // Always 13 days
  
  return Array.from({ length: totalDays }, (_, i) => startDate.add(i, "day"));
};

const CoachMatches: React.FC = () => {
  const dispatch = useAppDispatch()
  const matches = useAppSelector((state) => state.games.items)
  const status = useAppSelector((state) => state.games.status)
  const error = useAppSelector((state) => state.games.error)
  const token = useAppSelector((state) => state.user.data?.token)
  const teams = useAppSelector((state) => state.teams.items)
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [weekDates] = useState(() => generateWeekDates()); // Use function to ensure fresh generation
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Game creation modal state
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [externalTeamName, setExternalTeamName] = useState("");
  const [isExternalTeam, setIsExternalTeam] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [gameDate, setGameDate] = useState(new Date());
  const [gameTime, setGameTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Center on today when component mounts
    centerOnToday()
  }, [centerOnToday]);

  useEffect(() => {
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
        // Clear existing matches to force fresh fetch with new API
        dispatch(clearMatches())
        dispatch(fetchMatches(authToken))
        // Fetch teams for game creation
        dispatch(fetchTeams(authToken) as any)
      }
    }

    fetchData()
  }, [dispatch, token])

  // Fetch locations for game creation
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      } catch (error) {
        console.error("Failed to load locations:", error);
        setLocations([]);
      }
    };

    loadLocations();
  }, []);

  // Animation for modal
  useEffect(() => {
    if (showGameModal) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showGameModal]);

  // Modal handlers
  const openCreateGameModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingGame(null);
    setHomeTeamId("");
    setAwayTeamId("");
    setExternalTeamName("");
    setIsExternalTeam(false);
    setLocationId("");
    setGameDate(new Date());
    setGameTime(new Date());
    setShowGameModal(true);
  };

  const openEditGameModal = (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingGame(game);
    setHomeTeamId(game.home_team_id || "");
    setAwayTeamId(game.away_team_id || "");
    // Check if away team is external
    if (game.away_team_id === "external") {
      setIsExternalTeam(true);
      setExternalTeamName(game.away_team_name || "");
    } else {
      setIsExternalTeam(false);
      setExternalTeamName("");
    }
    setLocationId(game.location_id || "");

    // Parse the start_time if available
    if (game.start_time) {
      const startDate = new Date(game.start_time);
      setGameDate(startDate);
      setGameTime(startDate);
    } else {
      setGameDate(new Date());
      setGameTime(new Date());
    }

    setShowGameModal(true);
  };

  const handleDeleteGame = async (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Use ErrorToast with confirmation pattern instead of Alert
    setErrorMessage(`Delete game "${game.name || 'this game'}"? This action cannot be undone.`);

    // For now, we'll need to add a confirmation mechanism
    // Since ErrorToast doesn't support confirm dialogs, we'll use Alert.alert only for delete confirmation
    // This is acceptable as it's a destructive action that needs explicit confirmation
    Alert.alert(
      "Delete Game",
      `Are you sure you want to delete "${game.name || 'this game'}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              setErrorMessage("Authentication token not found. Please log in again.");
              setTimeout(() => setErrorMessage(null), 3000);
              return;
            }

            try {
              await deleteGame(game.id, token);
              // Refresh games list
              dispatch(clearMatches());
              dispatch(fetchMatches(token));
            } catch (error: any) {
              console.error("Error deleting game:", error);
              const errorMsg = error.response?.data?.error?.message || error.message || "Failed to delete game";

              setErrorMessage(errorMsg);
              setTimeout(() => setErrorMessage(null), 3000);
            }
          },
        },
      ]
    );
  };

  const closeGameModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGameModal(false);
    setTimeout(() => {
      setEditingGame(null);
      setHomeTeamId("");
      setAwayTeamId("");
      setExternalTeamName("");
      setIsExternalTeam(false);
      setLocationId("");
      setGameDate(new Date());
      setGameTime(new Date());
    }, 300);
  };

  const handleSaveGame = async () => {
    // Validation with ErrorToast instead of Alert
    if (!homeTeamId) {
      setErrorMessage("Please select a home team");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!isExternalTeam && !awayTeamId) {
      setErrorMessage("Please select an away team");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (isExternalTeam && !externalTeamName.trim()) {
      setErrorMessage("Please enter external team name");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!locationId) {
      setErrorMessage("Please select a location");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!token) {
      setErrorMessage("Authentication token not found. Please log in again.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setSubmitting(true);
    try {
      // Combine date and time into a single datetime
      const combinedDateTime = dayjs(gameDate)
        .hour(gameTime.getHours())
        .minute(gameTime.getMinutes())
        .toISOString();

      // For external teams, we use "external" as a placeholder for away_team_id
      // Note: Backend should handle external team names separately if needed
      // The external team name is stored in externalTeamName state but not sent to API
      // because the current API schema doesn't support an external_team_name field
      const gameData = {
        home_team_id: homeTeamId,
        away_team_id: isExternalTeam ? "external" : awayTeamId,
        location_id: locationId,
        start_time: combinedDateTime,
        status: "scheduled",
      };

      if (editingGame) {
        // Update existing game
        await updateGame(editingGame.id!, gameData, token);
        // Show success message via ErrorToast (green background would be ideal but ErrorToast shows errors)
        // For now, just close modal and refresh - user will see the updated game in the list
      } else {
        // Create new game
        await createGame(gameData, token);
      }

      // Refresh games list
      dispatch(clearMatches());
      dispatch(fetchMatches(token));
      closeGameModal();
    } catch (error: any) {
      console.error("Error saving game:", error);
      const errorMsg = error.response?.data?.error?.message || error.message || "Failed to save game";

      // Use ErrorToast for non-blocking error display
      setErrorMessage(errorMsg);

      // Auto-clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Debug logging

  // Filter matches by selected date - use match.date instead of created_at
  const filteredMatches = matches.filter((match) => {
    const matchDate = match.date || dayjs().format("YYYY-MM-DD")
    return matchDate === selectedDate
  });

  // Render loading state - moved to proper place
  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2 justify-center items-center">
        <LoadingIndicator size="large" color="#FCA311" />
        <Text className="text-white-100 mt-4">Loading matches...</Text>
      </SafeAreaView>
    )
  }

  // Render error state - moved to proper place  
  if (status === "failed" && error) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2 justify-center items-center">
        <EmptyState
          icon="exclamation-circle"
          title="Error Loading Matches"
          message={error}
          actionLabel="Try Again"
          onAction={async () => {
            let authToken = token
            if (!authToken) {
              const userString = await AsyncStorage.getItem("user")
              if (userString) {
                authToken = JSON.parse(userString)?.token
              }
            }

            if (authToken) {
              dispatch(clearMatches())
              dispatch(fetchMatches(authToken))
            }
          }}
        />
      </SafeAreaView>
    )
  }

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate;
    const isToday = item.isSame(dayjs(), "day")

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
            <TouchableOpacity
              style={styles.createButton}
              onPress={openCreateGameModal}
            >
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                let authToken = token
                if (!authToken) {
                  const userString = await AsyncStorage.getItem("user")
                  if (userString) {
                    authToken = JSON.parse(userString)?.token
                  }
                }

                if (authToken) {
                  dispatch(clearMatches())
                  dispatch(fetchMatches(authToken))
                }
              }}
            >
              <Text className="text-gold-100 font-semibold">Refresh</Text>
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
                animated: true 
              })
            }, 100)
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
              let authToken = token
              if (!authToken) {
                const userString = await AsyncStorage.getItem("user")
                if (userString) {
                  authToken = JSON.parse(userString)?.token
                }
              }

              if (authToken) {
                dispatch(clearMatches())
                dispatch(fetchMatches(authToken))
              }
            }}
          />
        )}
      </Animated.View>

      {/* Game Creation/Edit Modal */}
      {showGameModal && (
        <Modal transparent visible={showGameModal} animationType="none" onRequestClose={closeGameModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeGameModal}>
            <Animated.View
              style={[
                styles.gameModal,
                {
                  opacity: modalAnim,
                  transform: [
                    {
                      translateY: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingGame ? "Edit Game" : "Create Game"}</Text>
                    <TouchableOpacity onPress={closeGameModal}>
                      <AntDesign name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formContainer}>
                    {/* Home Team Selection */}
                    <Text style={styles.fieldLabel}>Home Team *</Text>
                    <View style={styles.pickerContainer}>
                      <TouchableOpacity
                        style={[styles.picker, !homeTeamId && styles.pickerPlaceholder]}
                        onPress={() => {
                          Alert.alert(
                            "Select Home Team",
                            "",
                            teams.map((team: any) => ({
                              text: team.name,
                              onPress: () => setHomeTeamId(team.id),
                            })).concat([{ text: "Cancel", style: "cancel" }])
                          );
                        }}
                      >
                        <Text style={[styles.pickerText, !homeTeamId && styles.pickerPlaceholderText]}>
                          {homeTeamId ? teams.find((t: any) => t.id === homeTeamId)?.name : "Select home team"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Away Team Type Toggle */}
                    <View style={styles.toggleContainer}>
                      <TouchableOpacity
                        style={[styles.toggleButton, !isExternalTeam && styles.toggleButtonActive]}
                        onPress={() => setIsExternalTeam(false)}
                      >
                        <Text style={[styles.toggleButtonText, !isExternalTeam && styles.toggleButtonTextActive]}>
                          Internal Team
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.toggleButton, isExternalTeam && styles.toggleButtonActive]}
                        onPress={() => setIsExternalTeam(true)}
                      >
                        <Text style={[styles.toggleButtonText, isExternalTeam && styles.toggleButtonTextActive]}>
                          External Team
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Away Team Selection or Input */}
                    {!isExternalTeam ? (
                      <>
                        <Text style={styles.fieldLabel}>Away Team *</Text>
                        <View style={styles.pickerContainer}>
                          <TouchableOpacity
                            style={[styles.picker, !awayTeamId && styles.pickerPlaceholder]}
                            onPress={() => {
                              Alert.alert(
                                "Select Away Team",
                                "",
                                teams
                                  .filter((team: any) => team.id !== homeTeamId)
                                  .map((team: any) => ({
                                    text: team.name,
                                    onPress: () => setAwayTeamId(team.id),
                                  }))
                                  .concat([{ text: "Cancel", style: "cancel" }])
                              );
                            }}
                          >
                            <Text style={[styles.pickerText, !awayTeamId && styles.pickerPlaceholderText]}>
                              {awayTeamId ? teams.find((t: any) => t.id === awayTeamId)?.name : "Select away team"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.fieldLabel}>External Team Name *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter external team name"
                          placeholderTextColor={COLORS.textSecondary}
                          value={externalTeamName}
                          onChangeText={setExternalTeamName}
                          editable={!submitting}
                        />
                      </>
                    )}

                    {/* Location Selection */}
                    <Text style={styles.fieldLabel}>Location *</Text>
                    <View style={styles.pickerContainer}>
                      <TouchableOpacity
                        style={[styles.picker, !locationId && styles.pickerPlaceholder]}
                        onPress={() => {
                          Alert.alert(
                            "Select Location",
                            "",
                            locations.map((location: any) => ({
                              text: `${location.name} - ${location.address}`,
                              onPress: () => setLocationId(location.id),
                            })).concat([{ text: "Cancel", style: "cancel" }])
                          );
                        }}
                      >
                        <Text style={[styles.pickerText, !locationId && styles.pickerPlaceholderText]}>
                          {locationId ? locations.find((l: any) => l.id === locationId)?.name : "Select location"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Date and Time Pickers */}
                    <DateTimeSelector
                      label="Game Date *"
                      date={gameDate}
                      setDate={setGameDate}
                      showPicker={showDatePicker}
                      setShowPicker={setShowDatePicker}
                      mode="date"
                    />

                    <DateTimeSelector
                      label="Game Time *"
                      date={gameTime}
                      setDate={setGameTime}
                      showPicker={showTimePicker}
                      setShowPicker={setShowTimePicker}
                      mode="time"
                    />

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={closeGameModal}
                        disabled={submitting}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={handleSaveGame}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <Text style={styles.saveButtonText}>{editingGame ? "Update" : "Create"}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Error Toast for non-blocking error display */}
      <ErrorToast message={errorMessage} />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  gameModal: {
    width: width * 0.9,
    maxHeight: "85%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  formContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerPlaceholder: {
    borderColor: COLORS.textSecondary,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  pickerPlaceholderText: {
    color: COLORS.textSecondary,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: COLORS.cardDark,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CoachMatches;
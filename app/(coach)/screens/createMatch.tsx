import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMatches, clearMatches } from "@/store/slices/gamesSlice";
import { selectAllTeams, selectTeamsLoading } from "@/store/slices/teamsSlice";
import { createGame, updateGame, getLocations, getExternalTeams, createExternalTeam } from "@/utils/api";
import { ErrorToast } from "@/components/auth/ErrorToast";
import DateTimeSelector from "@/components/practiceBooking/DateTimeSelector";
import * as Haptics from "expo-haptics";

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
};

export default function CreateMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();

  const gameId = params.gameId as string | undefined;
  const token = useAppSelector((state) => state.user.data?.token);
  const teams = useAppSelector(selectAllTeams);
  const teamsLoading = useAppSelector(selectTeamsLoading);
  const games = useAppSelector((state) => state.games.items);

  // Form states
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [gameDate, setGameDate] = useState(new Date());
  const [gameTime, setGameTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Data states
  const [locations, setLocations] = useState<any[]>([]);
  const [externalTeams, setExternalTeams] = useState<any[]>([]);

  // Picker states
  const [showHomeTeamPicker, setShowHomeTeamPicker] = useState(false);
  const [showAwayTeamPicker, setShowAwayTeamPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // External team creation states
  const [showExternalTeamModal, setShowExternalTeamModal] = useState(false);
  const [externalTeamName, setExternalTeamName] = useState("");
  const [externalTeamCapacity, setExternalTeamCapacity] = useState("");
  const [externalTeamLogoUrl, setExternalTeamLogoUrl] = useState("");
  const [creatingExternalTeam, setCreatingExternalTeam] = useState(false);

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editingGame = gameId ? games.find((g) => g.id === gameId) : null;
  const isEditMode = !!editingGame;

  // Load locations and external teams
  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsData, externalTeamsData] = await Promise.all([
          getLocations(),
          getExternalTeams(),
        ]);

        const locationsArray = Array.isArray(locationsData) ? locationsData : [];
        const externalTeamsArray = Array.isArray(externalTeamsData) ? externalTeamsData : [];

        console.log("Loaded data:", {
          locations: locationsArray.length,
          externalTeams: externalTeamsArray.length,
        });

        setLocations(locationsArray);
        setExternalTeams(externalTeamsArray);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLocations([]);
        setExternalTeams([]);
      }
    };

    loadData();
  }, []);

  // Initialize form with editing game data or defaults
  useEffect(() => {
    if (editingGame) {
      console.log("Edit mode initializing with game:", {
        id: editingGame.id,
        home_team_id: editingGame.home_team_id,
        away_team_id: editingGame.away_team_id,
        location_id: editingGame.location_id,
        start_time: editingGame.start_time,
      });

      setHomeTeamId(editingGame.home_team_id || "");
      setAwayTeamId(editingGame.away_team_id || "");
      setLocationId(editingGame.location_id || "");

      if (editingGame.start_time) {
        const startDate = new Date(editingGame.start_time);
        setGameDate(startDate);
        setGameTime(startDate);
      }
    } else {
      // Set default home team for create mode
      const defaultHomeTeam = teams && teams.length > 0 ? teams[0].id : "";
      setHomeTeamId(defaultHomeTeam);
    }
  }, [editingGame, teams]);

  const handleSave = async () => {
    // Validation
    if (!homeTeamId) {
      setErrorMessage("Please select a home team");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!awayTeamId) {
      setErrorMessage("Please select an away team");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (homeTeamId === awayTeamId) {
      setErrorMessage("Home team and away team must be different");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!locationId) {
      setErrorMessage("Please select a location");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // Date/time validation
    const combinedDateTime = dayjs(gameDate)
      .hour(gameTime.getHours())
      .minute(gameTime.getMinutes());

    const now = dayjs();

    if (combinedDateTime.isBefore(now)) {
      setErrorMessage("Game date and time must be in the future");
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
      const combinedDateTime = dayjs(gameDate)
        .hour(gameTime.getHours())
        .minute(gameTime.getMinutes())
        .toISOString();

      const gameData = {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        location_id: locationId,
        start_time: combinedDateTime,
        status: "scheduled" as const,
      };

      if (editingGame) {
        await updateGame(editingGame.id!, gameData, token);
      } else {
        await createGame(gameData, token);
      }

      // Refresh games list
      dispatch(clearMatches());
      dispatch(fetchMatches(token));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      console.error("Error saving game:", error);
      const errorMsg = error.response?.data?.error?.message || error.message || "Failed to save game";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExternalTeam = async () => {
    if (!externalTeamName.trim()) {
      setErrorMessage("Please enter team name");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const capacity = parseInt(externalTeamCapacity);
    if (!externalTeamCapacity || isNaN(capacity) || capacity <= 0) {
      setErrorMessage("Please enter a valid capacity (greater than 0)");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (!token) {
      setErrorMessage("Authentication token not found. Please log in again.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setCreatingExternalTeam(true);
    try {
      const teamData: { name: string; capacity: number; logo_url?: string } = {
        name: externalTeamName.trim(),
        capacity,
      };

      if (externalTeamLogoUrl.trim()) {
        teamData.logo_url = externalTeamLogoUrl.trim();
      }

      await createExternalTeam(teamData, token);

      // Refresh external teams list
      const updatedExternalTeams = await getExternalTeams();
      setExternalTeams(Array.isArray(updatedExternalTeams) ? updatedExternalTeams : []);

      // Close modal and reset form
      setShowExternalTeamModal(false);
      setExternalTeamName("");
      setExternalTeamCapacity("");
      setExternalTeamLogoUrl("");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Error creating external team:", error);
      const errorMsg = error.response?.data?.error?.message || error.message || "Failed to create external team";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setCreatingExternalTeam(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit Game" : "Create Game"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Home Team Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Home Team *</Text>
          <TouchableOpacity
            style={[styles.picker, !homeTeamId && styles.pickerPlaceholder]}
            onPress={() => setShowHomeTeamPicker(!showHomeTeamPicker)}
          >
            <Text style={[styles.pickerText, !homeTeamId && styles.pickerPlaceholderText]}>
              {homeTeamId ? teams?.find((t: any) => t.id === homeTeamId)?.name : "Select home team"}
            </Text>
            <Ionicons
              name={showHomeTeamPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Away Team Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Away Team *</Text>
          <TouchableOpacity
            style={[styles.picker, !awayTeamId && styles.pickerPlaceholder]}
            onPress={() => setShowAwayTeamPicker(!showAwayTeamPicker)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.pickerText, !awayTeamId && styles.pickerPlaceholderText]}>
                {awayTeamId
                  ? (teams?.find((t: any) => t.id === awayTeamId)?.name ||
                     externalTeams.find((t: any) => t.id === awayTeamId)?.name)
                  : "Select away team"}
              </Text>
              {awayTeamId && externalTeams.find((t: any) => t.id === awayTeamId) && (
                <Text style={styles.teamSubtext}>External Team</Text>
              )}
            </View>
            <Ionicons
              name={showAwayTeamPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Location Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Location *</Text>
          <TouchableOpacity
            style={[styles.picker, !locationId && styles.pickerPlaceholder]}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={[styles.pickerText, !locationId && styles.pickerPlaceholderText]}>
              {locationId ? locations.find((l: any) => l.id === locationId)?.name : "Select location"}
            </Text>
            <Ionicons
              name={showLocationPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.textSecondary}
            />
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditMode ? "Update" : "Create"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Picker Sheets */}
      {/* Home Team Picker */}
      {showHomeTeamPicker && (
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Home Team</Text>
              <TouchableOpacity onPress={() => setShowHomeTeamPicker(false)}>
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {teams && teams.length > 0 ? (
                teams.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.pickerItem,
                      homeTeamId === team.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setHomeTeamId(team.id);
                      setShowHomeTeamPicker(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        homeTeamId === team.id && styles.pickerItemTextSelected,
                      ]}
                    >
                      {team.name}
                    </Text>
                    {homeTeamId === team.id && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {teamsLoading === "pending" ? "Loading teams..." : "No teams available. Please create a team first."}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Away Team Picker */}
      {showAwayTeamPicker && (
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Away Team</Text>
              <TouchableOpacity onPress={() => setShowAwayTeamPicker(false)}>
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {/* Create External Team Button */}
              <TouchableOpacity
                style={[styles.pickerItem, styles.createExternalTeamButton]}
                onPress={() => {
                  setShowAwayTeamPicker(false);
                  setShowExternalTeamModal(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={[styles.pickerItemText, { color: COLORS.primary, marginLeft: 8 }]}>
                  Create External Team
                </Text>
              </TouchableOpacity>

              {/* Internal Teams */}
              {teams?.filter((team: any) => team.id !== homeTeamId).length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Internal Teams</Text>
                  {teams
                    .filter((team: any) => team.id !== homeTeamId)
                    .map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.pickerItem,
                          awayTeamId === team.id && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setAwayTeamId(team.id);
                          setShowAwayTeamPicker(false);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            awayTeamId === team.id && styles.pickerItemTextSelected,
                          ]}
                        >
                          {team.name}
                        </Text>
                        {awayTeamId === team.id && (
                          <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                </>
              )}

              {/* External Teams */}
              {externalTeams.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>External Teams</Text>
                  {externalTeams.map((team: any) => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.pickerItem,
                        awayTeamId === team.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setAwayTeamId(team.id);
                        setShowAwayTeamPicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.pickerItemText,
                            awayTeamId === team.id && styles.pickerItemTextSelected,
                          ]}
                        >
                          {team.name}
                        </Text>
                        <Text style={styles.teamSubtext}>External Team</Text>
                      </View>
                      {awayTeamId === team.id && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Empty state */}
              {(!teams || teams.length <= 1) && externalTeams.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No teams available for selection.</Text>
                  <Text style={[styles.emptyStateText, { fontSize: 12, marginTop: 8 }]}>
                    Create an external team using the button above or add more internal teams.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Location Picker */}
      {showLocationPicker && (
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {locations && locations.length > 0 ? (
                locations.map((location: any) => (
                  <TouchableOpacity
                    key={location.id}
                    style={[
                      styles.pickerItem,
                      locationId === location.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setLocationId(location.id);
                      setShowLocationPicker(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          locationId === location.id && styles.pickerItemTextSelected,
                        ]}
                      >
                        {location.name}
                      </Text>
                      <Text style={styles.teamSubtext}>{location.address}</Text>
                    </View>
                    {locationId === location.id && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Loading locations...</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* External Team Creation Modal */}
      {showExternalTeamModal && (
        <View style={styles.pickerSheet}>
          <View style={styles.pickerSheetContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Create External Team</Text>
              <TouchableOpacity
                onPress={() => setShowExternalTeamModal(false)}
                disabled={creatingExternalTeam}
              >
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList} keyboardShouldPersistTaps="handled">
              <View style={{ padding: 16 }}>
                <Text style={styles.fieldLabel}>Team Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter team name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={externalTeamName}
                  onChangeText={setExternalTeamName}
                  editable={!creatingExternalTeam}
                />

                <Text style={styles.fieldLabel}>Capacity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter capacity (e.g., 15)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={externalTeamCapacity}
                  onChangeText={setExternalTeamCapacity}
                  keyboardType="number-pad"
                  editable={!creatingExternalTeam}
                />

                <Text style={styles.fieldLabel}>Logo URL (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter logo URL"
                  placeholderTextColor={COLORS.textSecondary}
                  value={externalTeamLogoUrl}
                  onChangeText={setExternalTeamLogoUrl}
                  autoCapitalize="none"
                  editable={!creatingExternalTeam}
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setShowExternalTeamModal(false);
                      setExternalTeamName("");
                      setExternalTeamCapacity("");
                      setExternalTeamLogoUrl("");
                    }}
                    disabled={creatingExternalTeam}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleCreateExternalTeam}
                    disabled={creatingExternalTeam}
                  >
                    {creatingExternalTeam ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.saveButtonText}>Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Error Toast */}
      <ErrorToast message={errorMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
  teamSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
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
  // Picker sheet styles
  pickerSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerSheetContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  pickerItemSelected: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
    borderBottomColor: COLORS.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  pickerItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  createExternalTeamButton: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 12,
    textTransform: "uppercase",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

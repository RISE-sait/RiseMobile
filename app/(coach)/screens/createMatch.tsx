import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
  primary: "#FCA311",
  primaryDark: "#D4890E",
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

const { width } = Dimensions.get("window");

export default function CreateMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();

  // Animation refs
  const modalAnim = useRef(new Animated.Value(0)).current;

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
  const [gameEndTime, setGameEndTime] = useState(() => {
    // Default end time is 2 hours after start time
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 2);
    return defaultEnd;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
  const [externalTeamLogo, setExternalTeamLogo] = useState<string | null>(null);
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

      if (editingGame.end_time) {
        const endDate = new Date(editingGame.end_time);
        setGameEndTime(endDate);
      } else if (editingGame.start_time) {
        // Default to 2 hours after start if no end time
        const defaultEnd = new Date(editingGame.start_time);
        defaultEnd.setHours(defaultEnd.getHours() + 2);
        setGameEndTime(defaultEnd);
      }
    } else {
      // Set default home team for create mode
      const defaultHomeTeam = teams && teams.length > 0 ? teams[0].id : "";
      setHomeTeamId(defaultHomeTeam);
    }
  }, [editingGame, teams]);

  // Animation helpers
  const openModal = () => {
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Open external team modal with animation
  const openExternalTeamModal = () => {
    setShowAwayTeamPicker(false);
    setExternalTeamName("");
    setExternalTeamCapacity("");
    setExternalTeamLogo(null);
    setShowExternalTeamModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openModal();
  };

  // Close external team modal
  const closeExternalTeamModal = () => {
    closeModal();
    setTimeout(() => {
      setShowExternalTeamModal(false);
      setExternalTeamName("");
      setExternalTeamCapacity("");
      setExternalTeamLogo(null);
    }, 200);
  };

  // Pick logo for external team
  const pickExternalTeamLogo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photos to upload a team logo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setExternalTeamLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Upload logo to server
  const uploadExternalTeamLogo = async (imageUri: string): Promise<string | null> => {
    if (!token) return null;

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'team_logo.jpg';
      const match = /\.(.+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const uploadResponse = await fetch('https://api-461776259687.us-west2.run.app/upload/image?folder=teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", errorText);
        return null;
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.url || null;
    } catch (error) {
      console.error("Error uploading team logo:", error);
      return null;
    }
  };

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

    const combinedEndDateTime = dayjs(gameDate)
      .hour(gameEndTime.getHours())
      .minute(gameEndTime.getMinutes());

    const now = dayjs();

    if (combinedDateTime.isBefore(now)) {
      setErrorMessage("Game date and time must be in the future");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (combinedEndDateTime.isBefore(combinedDateTime) || combinedEndDateTime.isSame(combinedDateTime)) {
      setErrorMessage("End time must be after start time");
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
      const startDateTime = dayjs(gameDate)
        .hour(gameTime.getHours())
        .minute(gameTime.getMinutes())
        .toISOString();

      const endDateTime = dayjs(gameDate)
        .hour(gameEndTime.getHours())
        .minute(gameEndTime.getMinutes())
        .toISOString();

      const gameData = {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        location_id: locationId,
        start_time: startDateTime,
        end_time: endDateTime,
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
      // Upload logo if selected
      let logoUrl: string | undefined = undefined;
      if (externalTeamLogo && !externalTeamLogo.startsWith('http')) {
        const uploadedUrl = await uploadExternalTeamLogo(externalTeamLogo);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      } else if (externalTeamLogo && externalTeamLogo.startsWith('http')) {
        logoUrl = externalTeamLogo;
      }

      const teamData: { name: string; capacity: number; logo_url?: string } = {
        name: externalTeamName.trim(),
        capacity,
      };

      if (logoUrl) {
        teamData.logo_url = logoUrl;
      }

      await createExternalTeam(teamData, token);

      // Refresh external teams list
      const updatedExternalTeams = await getExternalTeams();
      setExternalTeams(Array.isArray(updatedExternalTeams) ? updatedExternalTeams : []);

      // Close modal and reset form
      closeExternalTeamModal();

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
          label="Start Time *"
          date={gameTime}
          setDate={setGameTime}
          showPicker={showTimePicker}
          setShowPicker={setShowTimePicker}
          mode="time"
        />

        <DateTimeSelector
          label="End Time *"
          date={gameEndTime}
          setDate={setGameEndTime}
          showPicker={showEndTimePicker}
          setShowPicker={setShowEndTimePicker}
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

      {/* Home Team Picker Modal */}
      <Modal transparent visible={showHomeTeamPicker} animationType="fade" onRequestClose={() => setShowHomeTeamPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHomeTeamPicker(false)}>
          <View style={styles.pickerModal}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Home Team</Text>
                <TouchableOpacity onPress={() => setShowHomeTeamPicker(false)}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList} showsVerticalScrollIndicator={false}>
                {teams && teams.length > 0 ? (
                  teams.map((team: any) => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.pickerModalItem,
                        homeTeamId === team.id && styles.pickerModalItemSelected,
                      ]}
                      onPress={() => {
                        setHomeTeamId(team.id);
                        setShowHomeTeamPicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.pickerItemContent}>
                        {team.logo_url ? (
                          <Image source={{ uri: team.logo_url }} style={styles.teamLogoSmall} />
                        ) : (
                          <View style={styles.teamLogoPlaceholder}>
                            <Ionicons name="people" size={16} color={COLORS.textSecondary} />
                          </View>
                        )}
                        <Text
                          style={[
                            styles.pickerModalItemText,
                            homeTeamId === team.id && styles.pickerModalItemTextSelected,
                          ]}
                        >
                          {team.name}
                        </Text>
                      </View>
                      {homeTeamId === team.id && (
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
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
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Away Team Picker Modal */}
      <Modal transparent visible={showAwayTeamPicker} animationType="fade" onRequestClose={() => setShowAwayTeamPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAwayTeamPicker(false)}>
          <View style={styles.pickerModal}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Away Team</Text>
                <TouchableOpacity onPress={() => setShowAwayTeamPicker(false)}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList} showsVerticalScrollIndicator={false}>
                {/* Create External Team Button */}
                <TouchableOpacity
                  style={styles.createExternalTeamBtn}
                  onPress={openExternalTeamModal}
                >
                  <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                  <Text style={styles.createExternalTeamText}>Create External Team</Text>
                </TouchableOpacity>

                {/* Internal Teams */}
                {teams?.filter((team: any) => team.id !== homeTeamId).length > 0 && (
                  <>
                    <Text style={styles.pickerSectionHeader}>Your Teams</Text>
                    {teams
                      .filter((team: any) => team.id !== homeTeamId)
                      .map((team: any) => (
                        <TouchableOpacity
                          key={team.id}
                          style={[
                            styles.pickerModalItem,
                            awayTeamId === team.id && styles.pickerModalItemSelected,
                          ]}
                          onPress={() => {
                            setAwayTeamId(team.id);
                            setShowAwayTeamPicker(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <View style={styles.pickerItemContent}>
                            {team.logo_url ? (
                              <Image source={{ uri: team.logo_url }} style={styles.teamLogoSmall} />
                            ) : (
                              <View style={styles.teamLogoPlaceholder}>
                                <Ionicons name="people" size={16} color={COLORS.textSecondary} />
                              </View>
                            )}
                            <Text
                              style={[
                                styles.pickerModalItemText,
                                awayTeamId === team.id && styles.pickerModalItemTextSelected,
                              ]}
                            >
                              {team.name}
                            </Text>
                          </View>
                          {awayTeamId === team.id && (
                            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                  </>
                )}

                {/* External Teams */}
                {externalTeams.length > 0 && (
                  <>
                    <Text style={styles.pickerSectionHeader}>External Teams</Text>
                    {externalTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.pickerModalItem,
                          awayTeamId === team.id && styles.pickerModalItemSelected,
                        ]}
                        onPress={() => {
                          setAwayTeamId(team.id);
                          setShowAwayTeamPicker(false);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          {team.logo_url ? (
                            <Image source={{ uri: team.logo_url }} style={styles.teamLogoSmall} />
                          ) : (
                            <View style={styles.teamLogoPlaceholder}>
                              <Ionicons name="globe-outline" size={16} color={COLORS.textSecondary} />
                            </View>
                          )}
                          <View>
                            <Text
                              style={[
                                styles.pickerModalItemText,
                                awayTeamId === team.id && styles.pickerModalItemTextSelected,
                              ]}
                            >
                              {team.name}
                            </Text>
                            <Text style={styles.pickerItemSubtext}>External Team</Text>
                          </View>
                        </View>
                        {awayTeamId === team.id && (
                          <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
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
                      Create an external team using the button above.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Picker Modal */}
      <Modal transparent visible={showLocationPicker} animationType="fade" onRequestClose={() => setShowLocationPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocationPicker(false)}>
          <View style={styles.pickerModal}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerModalList} showsVerticalScrollIndicator={false}>
                {locations && locations.length > 0 ? (
                  locations.map((location: any) => (
                    <TouchableOpacity
                      key={location.id}
                      style={[
                        styles.pickerModalItem,
                        locationId === location.id && styles.pickerModalItemSelected,
                      ]}
                      onPress={() => {
                        setLocationId(location.id);
                        setShowLocationPicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.pickerItemContent}>
                        <View style={styles.locationIconContainer}>
                          <Ionicons name="location" size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.pickerModalItemText,
                              locationId === location.id && styles.pickerModalItemTextSelected,
                            ]}
                          >
                            {location.name}
                          </Text>
                          <Text style={styles.pickerItemSubtext}>{location.address}</Text>
                        </View>
                      </View>
                      {locationId === location.id && (
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Loading locations...</Text>
                  </View>
                )}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* External Team Creation Modal */}
      {showExternalTeamModal && (
        <Modal transparent visible={showExternalTeamModal} animationType="none" onRequestClose={closeExternalTeamModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeExternalTeamModal}>
            <Animated.View
              style={[
                styles.externalTeamModal,
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
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create External Team</Text>
                  <TouchableOpacity onPress={closeExternalTeamModal} disabled={creatingExternalTeam}>
                    <AntDesign name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalFormContainer}>
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

                  <Text style={styles.fieldLabel}>Team Logo</Text>
                  <TouchableOpacity
                    style={styles.logoUploadContainer}
                    onPress={pickExternalTeamLogo}
                    disabled={creatingExternalTeam}
                    activeOpacity={0.7}
                  >
                    {externalTeamLogo ? (
                      <View style={styles.logoPreviewWrapper}>
                        <Image
                          source={{ uri: externalTeamLogo, cache: 'reload' }}
                          style={styles.logoPreviewImage}
                        />
                        <View style={styles.logoChangeOverlay}>
                          <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons name="image-outline" size={32} color={COLORS.textSecondary} />
                        <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalCancelButton]}
                      onPress={closeExternalTeamModal}
                      disabled={creatingExternalTeam}
                    >
                      <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalSaveButton]}
                      onPress={handleCreateExternalTeam}
                      disabled={creatingExternalTeam}
                    >
                      {creatingExternalTeam ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.modalSaveButtonText}>Create</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
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
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  // Picker Modal Styles
  pickerModal: {
    width: width - 40,
    maxHeight: "70%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  pickerModalList: {
    maxHeight: 350,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  pickerModalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: COLORS.cardDark,
  },
  pickerModalItemSelected: {
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pickerModalItemText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },
  pickerModalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  pickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  pickerItemSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pickerSectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  teamLogoSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardDark,
  },
  teamLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  createExternalTeamBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  createExternalTeamText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  // Modal styles for external team creation
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  externalTeamModal: {
    width: width - 40,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalFormContainer: {
    padding: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#333",
  },
  modalCancelButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalSaveButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoUploadContainer: {
    marginBottom: 8,
    alignItems: "center",
  },
  logoPreviewWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "relative",
    backgroundColor: COLORS.cardDark,
  },
  logoPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  logoChangeOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardDark,
    borderWidth: 2,
    borderColor: "#333",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 5,
  },
});

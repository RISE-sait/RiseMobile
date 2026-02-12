import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { FontAwesome6, Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import BackButton from "@/components/buttons/BackButton"
import type { Team } from "@/types/team"
import { useSelector, useDispatch } from "react-redux"
import { fetchTeams, selectAllTeams, selectTeamsLoading, selectTeamsError, removeTeam } from "@/store/slices/teamsSlice"
import type { RootState } from "@/store"
import images from "@/constants/images"
import { createTeam, updateTeam, deleteTeam } from "@/utils/api"
import { getAllStaff } from "@/utils/api/admin"
import { ErrorToast } from "@/components/auth/ErrorToast"

const { width } = Dimensions.get("window")

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
}

const SelectTeamForRoster: React.FC = () => {
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // Get teams data from Redux store
  const teams = useSelector(selectAllTeams)
  const loading = useSelector(selectTeamsLoading) === 'pending'
  const error = useSelector(selectTeamsError)
  const dispatch = useDispatch()

  // Local state for refreshing only
  const [refreshing, setRefreshing] = useState(false)

  // Team management state
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamName, setTeamName] = useState("")
  const [teamCapacity, setTeamCapacity] = useState("")
  const [teamLogo, setTeamLogo] = useState<string | null>(null)
  const [selectedCoachId, setSelectedCoachId] = useState<string>("")
  const [coaches, setCoaches] = useState<Array<{ id: string; name: string }>>([])
  const [loadingCoaches, setLoadingCoaches] = useState(false)
  const [showCoachPicker, setShowCoachPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const modalAnim = useRef(new Animated.Value(0)).current

  // Navigation
  const router = useRouter()

  // Effects
  useEffect(() => {
    // Initial animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Fetch teams data using Redux
    if (user?.token) {
      dispatch(fetchTeams(user.token) as any)
    }
  }, [dispatch, user?.token])

  // Animation for modal
  useEffect(() => {
    if (showTeamModal) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [showTeamModal])

  const handleRefresh = async () => {
    setRefreshing(true)
    if (user?.token) {
      await dispatch(fetchTeams(user.token) as any)
    }
    setRefreshing(false)
  }

  const pickTeamLogo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photos to upload a team logo.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setTeamLogo(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  const uploadTeamLogo = async (imageUri: string): Promise<string | null> => {
    if (!user?.token) return null

    try {
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'team_logo.jpg'
      const match = /\.(.+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any)

      const uploadResponse = await fetch('https://api-461776259687.us-west2.run.app/upload/image?folder=teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("Upload failed:", errorText)
        return null
      }

      const uploadResult = await uploadResponse.json()
      return uploadResult.url || null
    } catch (error) {
      console.error("Error uploading team logo:", error)
      return null
    }
  }

  const handleTeamPress = (team: Team) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Navigate to team roster screen with selected team ID
    router.push(`/(coach)/screens/teamRoster?teamId=${team.id}&teamName=${encodeURIComponent(team.name || "")}`)
  }

  const fetchCoaches = async () => {
    if (!user?.token) return

    setLoadingCoaches(true)
    try {
      // Get all staff with role filter for "coach"
      const staffData = await getAllStaff(user.token, "coach")

      // Transform staff data to coaches list
      const coachesList = staffData.map((staff: any) => ({
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
      }))

      console.log("Fetched coaches:", coachesList)
      setCoaches(coachesList)
    } catch (error) {
      console.error("Error fetching coaches:", error)
    } finally {
      setLoadingCoaches(false)
    }
  }

  const openCreateTeamModal = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEditingTeam(null)
    setTeamName("")
    setTeamCapacity("")
    setTeamLogo(null)
    setSelectedCoachId(user?.id || "")
    await fetchCoaches()
    setShowTeamModal(true)
  }

  const openEditTeamModal = async (team: Team) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEditingTeam(team)
    setTeamName(team.name || "")
    setTeamCapacity(team.capacity?.toString() || "")
    setTeamLogo(team.logo_url || null)
    setSelectedCoachId(team.coach?.id || user?.id || "")
    await fetchCoaches()
    setShowTeamModal(true)
  }

  const closeTeamModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowTeamModal(false)
    setTimeout(() => {
      setEditingTeam(null)
      setTeamName("")
      setTeamCapacity("")
      setTeamLogo(null)
    }, 300)
  }

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert("Validation Error", "Please enter a team name")
      return
    }

    const capacity = parseInt(teamCapacity, 10)
    if (!teamCapacity || isNaN(capacity) || capacity <= 0) {
      Alert.alert("Validation Error", "Please enter a valid capacity (positive number)")
      return
    }

    if (!user?.token) {
      Alert.alert("Error", "Authentication token not found. Please log in again.")
      return
    }

    setSubmitting(true)
    try {
      // Upload logo if a new one was selected (local file path)
      let logoUrl: string | undefined = undefined
      const isLocalFile = teamLogo && !teamLogo.startsWith('http')
      if (isLocalFile) {
        const uploadedUrl = await uploadTeamLogo(teamLogo)
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        }
      } else if (teamLogo && teamLogo.startsWith('http')) {
        // Keep existing URL if not changed
        logoUrl = teamLogo
      }

      // Validate coach selection for admins
      const isAdmin = user.role === "admin" || user.role === "superadmin" || user.role === "super_admin"
      if (isAdmin && !selectedCoachId) {
        Alert.alert("Validation Error", "Please select a coach for this team")
        return
      }

      // Use selected coach or current user
      const coachId = selectedCoachId || user.id

      if (editingTeam) {
        // Update existing team - must include coach_id (required by backend)
        const updateData: { name: string; capacity: number; coach_id: string; logo_url?: string } = {
          name: teamName.trim(),
          capacity,
          coach_id: coachId,
        }
        if (logoUrl) {
          updateData.logo_url = logoUrl
        }
        await updateTeam(editingTeam.id!, updateData, user.token)
        Alert.alert("Success", "Team updated successfully")
      } else {
        // Debug logging
        console.log("Creating new team with data:", {
          name: teamName.trim(),
          capacity,
          coach_id: coachId,
          user_role: user.role,
          user_id: user.id,
          teams_count: teams?.length || 0,
          logo_url: logoUrl
        });

        // Create new team - include coach_id as required by backend
        const createData: { name: string; capacity: number; coach_id: string; logo_url?: string } = {
          name: teamName.trim(),
          capacity,
          coach_id: coachId,
        }
        if (logoUrl) {
          createData.logo_url = logoUrl
        }
        await createTeam(createData, user.token)
        Alert.alert("Success", "Team created successfully")
      }

      // Refresh teams list
      await dispatch(fetchTeams(user.token) as any)
      closeTeamModal()
    } catch (error: any) {
      console.error("Error saving team:", error)
      const errorMsg = error.response?.data?.error?.message || error.message || "Failed to save team"

      // Use ErrorToast instead of Alert for non-blocking error display
      setErrorMessage(errorMsg)

      // Auto-clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTeam = async (team: Team) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user?.token) {
              Alert.alert("Error", "Authentication token not found. Please log in again.")
              return
            }

            try {
              await deleteTeam(team.id!, user.token)
              
              // Remove team from Redux store immediately for instant UI update
              dispatch(removeTeam(team.id!))
              
              // Also refresh teams list from API to ensure consistency
              await dispatch(fetchTeams(user.token) as any)
              
              // Close any modals and show success message
              Alert.alert("Success", "Team deleted successfully")
            } catch (error: any) {
              console.error("Error deleting team:", error)
              const errorMsg = error.response?.data?.error?.message || error.message || "Failed to delete team"

              // Use ErrorToast instead of Alert for non-blocking error display
              setErrorMessage(errorMsg)

              // Auto-clear error message after 3 seconds
              setTimeout(() => setErrorMessage(null), 3000)
            }
          },
        },
      ]
    )
  }

  // Render methods
  const renderHeader = () => {
    const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "super_admin"
    const headerTitle = isAdmin ? "RISE Teams" : "My Teams"

    return (
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={openCreateTeamModal}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderTeamItem = ({ item }: { item: Team }) => (
    <Animated.View
      style={[
        styles.teamCardContainer,
        {
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.teamCard}>
        <TouchableOpacity
          style={styles.teamCardContent}
          activeOpacity={0.7}
          onPress={() => handleTeamPress(item)}
        >
          {/* Team Logo */}
          <View style={styles.teamIcon}>
            <Image
              source={item.logo_url ? { uri: item.logo_url } : images.teamLogo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>

          {/* Team Info */}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>

            <View style={styles.teamDetailRow}>
              {item.capacity && (
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityText}>
                    Capacity: {item.capacity}
                  </Text>
                </View>
              )}
            </View>

            {item.coach && (
              <View style={styles.coachInfo}>
                <Ionicons name="person" size={16} color={COLORS.textSecondary} />
                <Text style={styles.coachText}>
                  Coach: {item.coach.name || "Unknown"}
                </Text>
              </View>
            )}

            {item.roster && item.roster.length > 0 && (
              <View style={styles.rosterInfo}>
                <FontAwesome6 name="users" size={14} color={COLORS.textSecondary} />
                <Text style={styles.rosterText}>
                  {item.roster.length} player{item.roster.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Arrow Icon */}
          <View style={styles.arrowIcon}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* Team Action Buttons */}
        <View style={styles.teamActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditTeamModal(item)}
          >
            <MaterialIcons name="edit" size={18} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTeam(item)}
          >
            <MaterialIcons name="delete" size={18} color={COLORS.danger} />
            <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading teams...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="triangle-exclamation" size={50} color={COLORS.danger} />
          <Text style={styles.emptyText}>Error loading teams</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6 name="users-slash" size={50} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No teams found</Text>
        <Text style={styles.emptySubtext}>You don't have any teams assigned</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderHeader()}

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Manage your teams and view rosters
          </Text>
        </View>

        <FlatList
          data={teams}
          keyExtractor={(item) => item.id || "unknown"}
          renderItem={renderTeamItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.teamsList}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // Performance optimizations to prevent freeze
          maxToRenderPerBatch={8}
          windowSize={5}
          initialNumToRender={8}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      </Animated.View>

      {/* Team Create/Edit Modal */}
      {showTeamModal && (
        <Modal transparent visible={showTeamModal} animationType="none" onRequestClose={closeTeamModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                  <Animated.View
                    style={[
                      styles.teamModal,
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
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{editingTeam ? "Edit Team" : "Create Team"}</Text>
                      <TouchableOpacity onPress={closeTeamModal}>
                        <AntDesign name="close" size={24} color="white" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={styles.modalScrollView}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                <View style={styles.formContainer}>
                  <Text style={styles.fieldLabel}>Team Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter team name"
                    placeholderTextColor={COLORS.textSecondary}
                    value={teamName}
                    onChangeText={setTeamName}
                    editable={!submitting}
                    returnKeyType="next"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  <Text style={styles.fieldLabel}>Capacity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter team capacity"
                    placeholderTextColor={COLORS.textSecondary}
                    value={teamCapacity}
                    onChangeText={setTeamCapacity}
                    keyboardType="numeric"
                    editable={!submitting}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  {/* Coach Selection - Only for Admins */}
                  {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "super_admin") && (
                    <>
                      <Text style={styles.fieldLabel}>Assign Coach *</Text>
                      {loadingCoaches ? (
                        <View style={[styles.input, { justifyContent: 'center', alignItems: 'center' }]}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCoachPicker(!showCoachPicker)}
                            disabled={submitting}
                          >
                            <Text style={selectedCoachId ? styles.dropdownText : styles.dropdownPlaceholder}>
                              {selectedCoachId
                                ? coaches.find(c => c.id === selectedCoachId)?.name || "Select a coach"
                                : "Select a coach"}
                            </Text>
                            <Ionicons name={showCoachPicker ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                          {/* Inline Coach Picker - expanded below dropdown */}
                          {showCoachPicker && (
                            <View style={styles.inlinePickerContainer}>
                              {coaches.map((coach) => (
                                <TouchableOpacity
                                  key={coach.id}
                                  style={[
                                    styles.coachOption,
                                    selectedCoachId === coach.id && styles.coachOptionSelected
                                  ]}
                                  onPress={() => {
                                    setSelectedCoachId(coach.id)
                                    setShowCoachPicker(false)
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                  }}
                                >
                                  <View style={[
                                    styles.radioButton,
                                    selectedCoachId === coach.id && styles.radioButtonSelected
                                  ]}>
                                    {selectedCoachId === coach.id && (
                                      <View style={styles.radioButtonInner} />
                                    )}
                                  </View>
                                  <Text style={[
                                    styles.coachOptionText,
                                    selectedCoachId === coach.id && styles.coachOptionTextSelected
                                  ]}>
                                    {coach.name}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </>
                      )}
                    </>
                  )}

                  <Text style={styles.fieldLabel}>Team Logo</Text>
                  <TouchableOpacity
                    style={styles.logoUploadContainer}
                    onPress={pickTeamLogo}
                    disabled={submitting}
                    activeOpacity={0.7}
                  >
                    {teamLogo ? (
                      <View style={styles.logoPreviewWrapper}>
                        <Image
                          source={{ uri: teamLogo, cache: 'reload' }}
                          style={styles.logoPreviewImage}
                          onError={(e) => console.log("Image error:", e.nativeEvent.error)}
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
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={closeTeamModal}
                      disabled={submitting}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleSaveTeam}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.saveButtonText}>{editingTeam ? "Update" : "Create"}</Text>
                      )}
                    </TouchableOpacity>
                    </View>
                  </View>
                  </ScrollView>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Error Toast for non-blocking error display */}
      <ErrorToast message={errorMessage} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  teamsList: {
    paddingBottom: 20,
  },
  teamCardContainer: {
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  teamIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  teamDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  capacityBadge: {
    backgroundColor: `${COLORS.info}30`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: "bold",
  },
  coachInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  coachText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  rosterInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  rosterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  arrowIcon: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  teamActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: `${COLORS.primary}20`,
  },
  deleteButton: {
    backgroundColor: `${COLORS.danger}20`,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  teamModal: {
    width: width * 0.9,
    maxHeight: "85%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  modalScrollView: {
    maxHeight: 500,
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
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
  logoUploadContainer: {
    marginBottom: 16,
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
  dropdownButton: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlinePickerContainer: {
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownText: {
    color: COLORS.text,
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  coachPickerModal: {
    width: width * 0.85,
    maxHeight: "70%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  coachPickerList: {
    maxHeight: 400,
  },
  pickerContainer: {
    marginBottom: 16,
    maxHeight: 200,
  },
  coachOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  coachOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  coachOptionText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  coachOptionTextSelected: {
    color: COLORS.text,
    fontWeight: "600",
  },
})

export default SelectTeamForRoster
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import {
  faArrowLeft,
  faCamera,
  faCheck,
  faEnvelope,
  faPhone,
  faUser,
  faShirt,
  faList,
  faBasketball,
  faChalkboardTeacher,
  faUserTie,
  faChild,
} from "@fortawesome/free-solid-svg-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Input } from "@/components/ui/input"
import images from "@/constants/images"
import { COLORS } from "@/constants/colors"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  jerseyNumber?: string
  position?: string
  phoneNumber?: string
  specialties?: string[]
  experience?: string
  countryCode?: string
}

const { width } = Dimensions.get("window")

export default function EditProfileScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Common form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Role-specific fields
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [position, setPosition] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [newSpecialty, setNewSpecialty] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Animate content in when data is loaded
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isLoading])

  const loadUserData = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would fetch from your API
      // For now, we'll use AsyncStorage as a mock
      const storedUser = await AsyncStorage.getItem("user")

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)

        // Initialize common form fields
        setFirstName(parsedUser.firstName || "")
        setLastName(parsedUser.lastName || "")
        setEmail(parsedUser.email || "")
        setPhoneNumber(parsedUser.phoneNumber || "")
        setProfileImage(parsedUser.profileImage || null)

        // Initialize role-specific fields
        setJerseyNumber(parsedUser.jerseyNumber || "")
        setPosition(parsedUser.position || "")
        setSpecialties(parsedUser.specialties || [])
        setExperience(parsedUser.experience || "")
      } else {
        // If no user data, redirect back
        Alert.alert("Error", "User data not found")
        router.back()
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      Alert.alert("Error", "Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() !== "" && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (index: number) => {
    const updatedSpecialties = [...specialties]
    updatedSpecialties.splice(index, 1)
    setSpecialties(updatedSpecialties)
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      // Create base updated user object with common fields
      const updatedUser: User = {
        ...user!,
        firstName,
        lastName,
        email,
        phoneNumber,
        profileImage,
      }

      // Add role-specific fields based on user role
      if (user?.role === "athlete") {
        updatedUser.jerseyNumber = jerseyNumber
        updatedUser.position = position
      } else if (user?.role === "instructor") {
        updatedUser.specialties = specialties
        updatedUser.experience = experience
      }

      // In a real app, you would send this to your API
      // For now, we'll just save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser))

      // Show success message
      Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      console.error("Error saving user data:", error)
      Alert.alert("Error", "Failed to save profile changes")
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "athlete":
        return faBasketball
      case "coach":
        return faChalkboardTeacher
      case "instructor":
        return faUserTie
      case "parent":
        return faChild
      default:
        return faUser
    }
  }

  const getProfileImage = (role: string) => {
    if (profileImage) return { uri: profileImage }

    switch (role) {
      case "athlete":
        return images.headshot
      case "coach":
        return images.coachHeadshot
      case "instructor":
        return images.instructorHeadshot
      case "parent":
        return images.parentHeadshot
      default:
        return images.headshot
    }
  }

  const getAccentColor = (role: string) => {
    switch (role) {
      case "athlete":
        return COLORS.primary // Gold
      case "coach":
        return COLORS.primary // Blue
      case "instructor":
        return COLORS.primary // Yellow/Gold
      case "parent":
        return COLORS.primary // Green
      default:
        return COLORS.primary
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="large" color={user?.role ? getAccentColor(user.role) : COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} color={COLORS.text} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color={getAccentColor(user?.role || "")} />
          ) : (
            <FontAwesomeIcon icon={faCheck} color={getAccentColor(user?.role || "")} size={20} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Profile Banner */}
            <View style={styles.profileBanner}>
              <LinearGradient colors={[COLORS.background, COLORS.cardDark]} style={styles.bannerGradient} />

              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={getProfileImage(user?.role || "")}
                  style={[styles.profileImage, { borderColor: getAccentColor(user?.role || "") }]}
                  resizeMode="cover"
                />
                <TouchableOpacity style={[styles.cameraButton, { backgroundColor: getAccentColor(user?.role || "") }]}>
                  <FontAwesomeIcon icon={faCamera} color="#000000" size={16} />
                </TouchableOpacity>
              </View>

              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>
                  {firstName} {lastName}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: `${getAccentColor(user?.role || "")}20` }]}>
                  <FontAwesomeIcon
                    icon={getRoleIcon(user?.role || "")}
                    color={COLORS.text}
                    size={12}
                    style={styles.roleIcon}
                  />
                  <Text style={styles.roleText}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
                </View>
              </View>
            </View>

            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon
                    icon={faUser}
                    color={getAccentColor(user?.role || "")}
                    size={14}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.inputLabel}>First Name*</Text>
                </View>
                <Input
                  value={firstName}
                  onChangeText={setFirstName}
                  inputStyle={styles.input}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon
                    icon={faUser}
                    color={getAccentColor(user?.role || "")}
                    size={14}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.inputLabel}>Last Name*</Text>
                </View>
                <Input
                  value={lastName}
                  onChangeText={setLastName}
                  inputStyle={styles.input}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    color={getAccentColor(user?.role || "")}
                    size={14}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.inputLabel}>Email*</Text>
                </View>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  inputStyle={styles.input}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon
                    icon={faPhone}
                    color={getAccentColor(user?.role || "")}
                    size={14}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                </View>
                <Input
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  inputStyle={styles.input}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            {/* Role-specific sections */}
            {user?.role === "athlete" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Athlete Information</Text>

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <FontAwesomeIcon
                      icon={faShirt}
                      color={getAccentColor(user.role)}
                      size={14}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.inputLabel}>Jersey Number</Text>
                  </View>
                  <Input
                    value={jerseyNumber}
                    onChangeText={setJerseyNumber}
                    keyboardType="numeric"
                    inputStyle={styles.input}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <FontAwesomeIcon
                      icon={faList}
                      color={getAccentColor(user.role)}
                      size={14}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.inputLabel}>Position</Text>
                  </View>
                  <Input
                    value={position}
                    onChangeText={setPosition}
                    inputStyle={styles.input}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
            )}

            {user?.role === "instructor" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructor Information</Text>

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <FontAwesomeIcon
                      icon={faList}
                      color={getAccentColor(user.role)}
                      size={14}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.inputLabel}>Experience</Text>
                  </View>
                  <Input
                    value={experience}
                    onChangeText={setExperience}
                    multiline
                    numberOfLines={3}
                    inputStyle={[styles.input, styles.textArea]}
                    placeholderTextColor={COLORS.textSecondary}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <FontAwesomeIcon
                      icon={faList}
                      color={getAccentColor(user.role)}
                      size={14}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.inputLabel}>Specialties</Text>
                  </View>

                  <View style={styles.specialtyInputContainer}>
                    <Input
                      value={newSpecialty}
                      onChangeText={setNewSpecialty}
                      placeholder="Add a specialty"
                      inputStyle={[styles.input, { flex: 1 }]}
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={handleAddSpecialty}
                      style={[styles.addButton, { backgroundColor: getAccentColor(user.role) }]}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.specialtiesContainer}>
                    {specialties.map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSpecialty(index)} style={styles.removeButton}>
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveProfileButton}>
              <LinearGradient
                colors={
                  isSaving
                    ? ["#666666", "#444444"]
                    : [getAccentColor(user?.role || ""), getAccentColor(user?.role || "")]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color="#000000" />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
  },
  profileBanner: {
    height: 180,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  bannerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  nameContainer: {
    alignItems: "center",
  },
  nameText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    color: COLORS.text,
    fontSize: 14,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 16,
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderColor: COLORS.cardDark,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.text,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  specialtyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 14,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  specialtyText: {
    color: COLORS.text,
    fontSize: 14,
    marginRight: 4,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  saveProfileButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
})


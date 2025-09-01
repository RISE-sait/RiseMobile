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
} from "@fortawesome/free-solid-svg-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Input } from "@/components/ui/input"
import images from "@/constants/images"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useAuth } from "@/utils/auth"

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
  bio?: string
  teamLogo?: string
}

const { width } = Dimensions.get("window")

export default function EditProfileScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // ✅ Use Redux as primary data source
  const reduxUser = useSelector((state: RootState) => state.user.data)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [position, setPosition] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [reduxUser]) // ✅ Depend on reduxUser changes

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
      
      // ✅ Prioritize Redux data (same pattern as coachProfile.tsx)
      if (reduxUser) {
        console.log("📢 Loaded user from Redux state:", reduxUser)
        const userData = {
          ...reduxUser,
          firstName: reduxUser.firstName || reduxUser.first_name || "",
          lastName: reduxUser.lastName || reduxUser.last_name || "",
          countryCode: reduxUser.countryCode || reduxUser.country_code || "US",
        }
        setUser(userData)
        
        // Initialize form fields
        setFirstName(userData.firstName)
        setLastName(userData.lastName)
        setEmail(userData.email || "")
        setPhoneNumber(userData.phoneNumber || "")
        setJerseyNumber(userData.jerseyNumber || "")
        setPosition(userData.position || "")
        setProfileImage(userData.profileImage || null)
        return // ✅ Redux data available, return directly
      }

      // ⚠️ Only use AsyncStorage fallback when Redux data is not available
      console.log("⚠️ Redux user not available, trying AsyncStorage fallback...")
      const storedUser = await AsyncStorage.getItem("user")

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log("📢 Loaded user from AsyncStorage fallback:", parsedUser)
        setUser(parsedUser)

        // Initialize form fields
        setFirstName(parsedUser.firstName || "")
        setLastName(parsedUser.lastName || "")
        setEmail(parsedUser.email || "")
        setPhoneNumber(parsedUser.phoneNumber || "")
        setJerseyNumber(parsedUser.jerseyNumber || "")
        setPosition(parsedUser.position || "")
        setProfileImage(parsedUser.profileImage || null)
      } else {
        console.log("⚠️ No user found in Redux or AsyncStorage.")
        Alert.alert("Error", "Unable to load user data. Please try logging in again.")
        router.back()
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error)
      Alert.alert("Error", "Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      // Update user object with new values
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber,
        jerseyNumber,
        position,
        profileImage,
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="large" color="#FCA311" />
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
          <FontAwesomeIcon icon={faArrowLeft} color="#F0F0F0" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FCA311" />
          ) : (
            <FontAwesomeIcon icon={faCheck} color="#FCA311" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Profile Banner */}
            <View style={styles.profileBanner}>
              <LinearGradient colors={["#1D1C1E", "#0C0B0B"]} style={styles.bannerGradient} />

              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={profileImage ? { uri: profileImage } : images.headshot}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>
                  {firstName} {lastName}
                </Text>
                <View style={styles.roleBadge}>
                  <FontAwesomeIcon icon={faBasketball} color="#F0F0F0" size={12} style={styles.roleIcon} />
                  <Text style={styles.roleText}>Athlete</Text>
                </View>
              </View>
            </View>

            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {/* Locked Email Field */}
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faEnvelope} color="#999999" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Email (Locked)</Text>
                </View>
                <View style={styles.lockedInputContainer}>
                  <Text style={styles.lockedInputText}>{email}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faUser} color="#FCA311" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>First Name*</Text>
                </View>
                <Input
                  value={firstName}
                  onChangeText={setFirstName}
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faUser} color="#FCA311" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Last Name*</Text>
                </View>
                <Input
                  value={lastName}
                  onChangeText={setLastName}
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faPhone} color="#FCA311" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                </View>
                <Input
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Athlete Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Athlete Information</Text>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faShirt} color="#FCA311" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Jersey Number</Text>
                </View>
                <Input
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  keyboardType="numeric"
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faList} color="#FCA311" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Position</Text>
                </View>
                <Input
                  value={position}
                  onChangeText={setPosition}
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveProfileButton}>
              <LinearGradient
                colors={isSaving ? ["#D68B00", "#B57300"] : ["#FCA311", "#E69200"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
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
    backgroundColor: "#0C0B0B",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#F0F0F0",
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
    borderBottomColor: "#222222",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#F0F0F0",
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
    borderColor: "#FCA311",
  },
  nameContainer: {
    alignItems: "center",
  },
  nameText: {
    color: "#F0F0F0",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(252, 163, 17, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    color: "#F0F0F0",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#1D1C1E",
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
    color: "#F0F0F0",
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
    color: "#F0F0F0",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#252525",
    borderColor: "#333333",
    borderWidth: 1,
    borderRadius: 8,
    color: "#F0F0F0",
    padding: 12,
    fontSize: 16,
  },
  lockedInputContainer: {
    backgroundColor: "#252525",
    borderColor: "#333333",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    opacity: 0.7,
  },
  lockedInputText: {
    color: "#999999",
    fontSize: 16,
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
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#999999",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
})


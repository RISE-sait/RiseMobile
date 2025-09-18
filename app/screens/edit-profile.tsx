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
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store"
import { updateProfile } from "@/store/slices/userSlice"
import { API_URL } from "@/utils/api"
import axios from "axios"
import * as ImagePicker from 'expo-image-picker'

// 📱 Phone number utility functions
const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return ""
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "")
  
  // For 10-digit numbers, format as (xxx) xxx-xxxx
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  // For 11-digit numbers starting with 1, format as (xxx) xxx-xxxx
  else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone // Return original if format is unusual
}

const handlePhoneChange = (text: string, setPhoneNumber: (value: string) => void) => {
  // Format as user types for better UX
  const formatted = formatPhoneForDisplay(text)
  setPhoneNumber(formatted)
}

const formatPhoneForStorage = (phone: string): string => {
  if (!phone) return ""
  
  const cleaned = phone.replace(/\D/g, "") // Remove all non-digits
  
  // For Canadian/US numbers (10 digits), add +1 prefix
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  // For 11-digit numbers starting with 1, add + prefix
  else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`
  }
  // If already has + prefix, return as is
  else if (phone.startsWith("+")) {
    return phone
  }
  
  return phone // Return original if format is unusual
}

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
  
  // ✅ Use Redux as primary data source
  const reduxUser = useSelector((state: RootState) => state.user.data)
  const dispatch = useDispatch()

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
      
      // ✅ Prioritize Redux data (same pattern as other EditProfile components)
      if (reduxUser) {
        const userData = {
          ...reduxUser,
          firstName: reduxUser.firstName || reduxUser.first_name || "",
          lastName: reduxUser.lastName || reduxUser.last_name || "",
          countryCode: reduxUser.countryCode || reduxUser.country_code || "US",
        }
        setUser(userData)
        
        // Initialize common form fields
        setFirstName(userData.firstName)
        setLastName(userData.lastName)
        setEmail(userData.email || "")
        // ✅ Format phone for user-friendly display
        setPhoneNumber(formatPhoneForDisplay(userData.phoneNumber || ""))
        setProfileImage(userData.profileImage || null)

        // Initialize role-specific fields
        setJerseyNumber(userData.jerseyNumber || "")
        setPosition(userData.position || "")
        setSpecialties(userData.specialties || [])
        setExperience(userData.experience || "")
        return // ✅ Redux data available, return directly
      }

      // ⚠️ Only use AsyncStorage fallback when Redux data is not available
      const storedUser = await AsyncStorage.getItem("user")

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)

        // Initialize common form fields
        setFirstName(parsedUser.firstName || parsedUser.first_name || "")
        setLastName(parsedUser.lastName || parsedUser.last_name || "")
        setEmail(parsedUser.email || "")
        // ✅ Format phone for user-friendly display
        setPhoneNumber(formatPhoneForDisplay(parsedUser.phoneNumber || ""))
        setProfileImage(parsedUser.profileImage || null)

        // Initialize role-specific fields
        setJerseyNumber(parsedUser.jerseyNumber || "")
        setPosition(parsedUser.position || "")
        setSpecialties(parsedUser.specialties || [])
        setExperience(parsedUser.experience || "")
      } else {
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

      if (!user?.id || !user?.token) {
        Alert.alert("Error", "User authentication information is missing")
        return
      }

      // ✅ Call backend API to update user profile
      
      // ✅ Format phone number for storage (international format)
      const formattedPhone = formatPhoneForStorage(phoneNumber)

      // Prepare API request payload according to user.UpdateRequestDto schema
      const updatePayload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        country_alpha2_code: user.countryCode || "US",
        // Required fields with defaults
        dob: "2000-01-01",
        has_marketing_email_consent: false,
        has_sms_consent: false,
      }

      // ✅ Only include phone if it's provided and formatted correctly
      if (formattedPhone) {
        updatePayload.phone = formattedPhone
      }


      const response = await axios.put(
        `${API_URL}/users/${user.id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      )


      // Create updated user object with API response data
      const apiResponse = response.data
      const updatedUser: User = {
        ...user,
        firstName: apiResponse.first_name || firstName.trim(),
        lastName: apiResponse.last_name || lastName.trim(),
        email: apiResponse.email || email.trim(),
        phoneNumber: apiResponse.phone || phoneNumber?.trim(),
        countryCode: apiResponse.country_alpha2_code || user.countryCode,
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

      // ✅ Update Redux store with new user data
      dispatch(updateProfile(updatedUser))
      
      // Update AsyncStorage with new data for offline access
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser))

      // Show success message
      Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => router.back() }])
    } catch (error: any) {
      console.error("❌ Error updating user profile:", error.response?.data || error.message)
      
      let errorMessage = "Failed to save profile changes"
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid profile data. Please check your information."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      Alert.alert("Error", errorMessage)
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

  // Image selection functionality
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload profile pictures.',
        [{ text: 'OK' }]
      )
      return false
    }
    return true
  }

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add a profile picture',
      [
        {
          text: 'Camera',
          onPress: () => {
            openCamera()
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            openImageLibrary()
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {}
        },
      ]
    )
  }

  // Handle two-step image upload process
  const handleImageUpload = async (imageUri: string) => {

    if (!user?.token) {
      Alert.alert('Error', 'Authentication required')
      return
    }


    try {
      // Step 1: Upload image to cloud storage
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'profile.jpg'
      const match = /\.(.+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any)

      const uploadResponse = await fetch('https://api-461776259687.us-west2.run.app/upload/image?folder=profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
      }

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.url) {
        throw new Error('No URL returned from upload')
      }

      // Step 2: Update user profile with the uploaded image URL

      // Use the correct endpoints based on role
      const isCoach = user.role === 'coach' || user.role === 'staff' || user.role === 'instructor'
      const profileUpdateUrl = isCoach
        ? `https://api-461776259687.us-west2.run.app/staffs/${user.id}/profile`
        : `https://api-461776259687.us-west2.run.app/athletes/${user.id}/profile`


      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      }


      const profileUpdateResponse = await fetch(profileUpdateUrl, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          photo_url: uploadResult.url
        }),
      })


      if (!profileUpdateResponse.ok) {
        const errorText = await profileUpdateResponse.text()
        throw new Error(`Profile update failed: ${profileUpdateResponse.status} - ${errorText}`)
      }


      // Update local state to display new avatar
      setProfileImage(uploadResult.url)

      Alert.alert('Success', 'Profile picture updated successfully!')
    } catch (error) {
      console.error('❌ Image upload/update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload and update profile picture'
      Alert.alert('Error', errorMessage)
    }
  }

  const openCamera = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) {
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })


      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      } else {
      }
    } catch (error) {
      console.error('Camera error:', error)
      Alert.alert('Error', 'Failed to open camera')
    }
  }

  const openImageLibrary = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) {
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })


      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      } else {
      }
    } catch (error) {
      console.error('Photo library error:', error)
      Alert.alert('Error', 'Failed to open photo library')
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
                <TouchableOpacity
                  style={[styles.cameraButton, { backgroundColor: getAccentColor(user?.role || "") }]}
                  onPress={() => {
                    showImagePickerOptions()
                  }}
                  activeOpacity={0.7}
                >
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
                  inputStyle={[styles.input, styles.disabledInput]}
                  placeholderTextColor={COLORS.textSecondary}
                  editable={false}
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
                  onChangeText={(text) => handlePhoneChange(text, setPhoneNumber)}
                  keyboardType="phone-pad"
                  inputStyle={styles.input}
                  placeholderTextColor={COLORS.textSecondary}
                  placeholder="(604) 123-4567"
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
  disabledInput: {
    backgroundColor: COLORS.cardDark,
    color: COLORS.textSecondary,
    opacity: 0.6,
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


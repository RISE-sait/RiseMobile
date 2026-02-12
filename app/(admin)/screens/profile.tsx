import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from "react-native"
import { showAlert } from "@/utils/customAlert"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import {
  faArrowLeft,
  faCamera,
  faCheck,
  faEnvelope,
  faPhone,
  faUser,
  faUserShield,
  faImage,
} from "@fortawesome/free-solid-svg-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Input } from "@/components/ui/input"
import { COLORS } from "@/constants/colors"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setUser } from "@/store/slices/userSlice"
import { useAuth } from "@/utils/auth"
import * as ImagePicker from 'expo-image-picker'

export default function AdminProfileScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { getValidToken } = useAuth()
  const reduxUser = useAppSelector((state) => state.user.data)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Form fields
  const [firstName, setFirstName] = useState(reduxUser?.firstName || "")
  const [lastName, setLastName] = useState(reduxUser?.lastName || "")
  const [email, setEmail] = useState(reduxUser?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(reduxUser?.phoneNumber || "")
  const [profileImage, setProfileImage] = useState<string | null>(reduxUser?.profileImage || null)
  const [showImagePickerModal, setShowImagePickerModal] = useState(false)

  useEffect(() => {
    // Animate content in
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
  }, [])

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert("Error", "First name and last name are required", undefined, { type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      // Update Redux state
      if (reduxUser) {
        dispatch(
          setUser({
            ...reduxUser,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
          })
        )
      }
      showAlert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => router.back() }], { type: 'success' })
    } catch (error) {
      showAlert("Error", "Failed to update profile", undefined, { type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
      case "admin":
        return faUserShield
      default:
        return faUser
    }
  }

  const getRoleColor = () => {
    return COLORS.primary // Always use gold color for consistency
  }

  // Image selection functionality
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      showAlert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload profile pictures.',
        [{ text: 'OK' }],
        { type: 'warning' }
      )
      return false
    }
    return true
  }

  const showImagePickerOptions = () => {
    setShowImagePickerModal(true)
  }

  const handleImageUpload = async (imageUri: string) => {
    if (!reduxUser?.token) {
      showAlert('Error', 'Authentication required', undefined, { type: 'error' })
      return
    }

    try {
      // Upload image
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
          'Authorization': `Bearer ${reduxUser.token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadResult = await uploadResponse.json()

      if (uploadResult.url) {
        setProfileImage(uploadResult.url)
        showAlert('Success', 'Profile picture updated successfully!', undefined, { type: 'success' })
      }
    } catch (error) {
      showAlert('Error', 'Failed to upload profile picture', undefined, { type: 'error' })
    }
  }

  const openCamera = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      showAlert('Error', 'Failed to open camera', undefined, { type: 'error' })
    }
  }

  const openImageLibrary = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      showAlert('Error', 'Failed to open photo library', undefined, { type: 'error' })
    }
  }

  const roleColor = getRoleColor()

  return (
    <>
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
              <ActivityIndicator size="small" color={roleColor} />
            ) : (
              <FontAwesomeIcon icon={faCheck} color={roleColor} size={20} />
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
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={showImagePickerOptions}
                  activeOpacity={0.7}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={[styles.profileImage, { borderColor: roleColor }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.profileImagePlaceholder, { borderColor: roleColor }]}>
                      <FontAwesomeIcon icon={faUser} color={COLORS.textSecondary} size={40} />
                    </View>
                  )}
                  <View style={[styles.cameraButton, { backgroundColor: roleColor }]}>
                    <FontAwesomeIcon icon={faCamera} color="#000000" size={16} />
                  </View>
                </TouchableOpacity>

                <View style={styles.nameContainer}>
                  <Text style={styles.nameText}>
                    {firstName} {lastName}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20` }]}>
                    <FontAwesomeIcon
                      icon={getRoleIcon(reduxUser?.role)}
                      color={COLORS.text}
                      size={12}
                      style={styles.roleIcon}
                    />
                    <Text style={styles.roleText}>
                      {reduxUser?.role ? reduxUser.role.charAt(0).toUpperCase() + reduxUser.role.slice(1) : 'User'}
                    </Text>
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
                      color={roleColor}
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
                      color={roleColor}
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
                      color={roleColor}
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
                      color={roleColor}
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

              {/* Save Button */}
              <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveProfileButton}>
                <LinearGradient
                  colors={isSaving ? ["#666666", "#444444"] : [roleColor, roleColor]}
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

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowImagePickerModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Update Profile Picture</Text>

            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowImagePickerModal(false)
                  setTimeout(() => openCamera(), 300)
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: `${roleColor}20` }]}>
                  <FontAwesomeIcon icon={faCamera} color={roleColor} size={24} />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionText}>Take Photo</Text>
                  <Text style={styles.modalOptionSubtext}>Use your camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowImagePickerModal(false)
                  setTimeout(() => openImageLibrary(), 300)
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: `${roleColor}20` }]}>
                  <FontAwesomeIcon icon={faImage} color={roleColor} size={24} />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionText}>Choose from Library</Text>
                  <Text style={styles.modalOptionSubtext}>Select an existing photo</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowImagePickerModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
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
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: COLORS.cardDark,
    alignItems: "center",
    justifyContent: "center",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.cardDark,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
  },
  modalOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOptionSubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    alignItems: "center",
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
})

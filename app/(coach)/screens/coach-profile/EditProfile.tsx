import React, { useEffect, useState, useRef } from "react";
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
  KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faArrowLeft, 
  faCheck, 
  faEnvelope, 
  faPhone, 
  faUser, 
  faBasketball
} from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "@/components/ui/input";
import images from "@/constants/images";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAuth } from "@/utils/auth";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: string;
  countryCode: string;
  token: string;
  teamLogo?: string;
  phoneNumber?: string;
  bio?: string;
};

const { width } = Dimensions.get("window");

export default function EditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // ✅ Use Redux as primary data source
  const reduxUser = useSelector((state: RootState) => state.user.data);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [reduxUser]); // ✅ Depend on reduxUser changes

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
      ]).start();
    }
  }, [isLoading]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Prioritize Redux data (same pattern as coachProfile.tsx)
      if (reduxUser) {
        console.log("📢 Loaded user from Redux state:", reduxUser);
        const userData = {
          ...reduxUser,
          firstName: reduxUser.firstName || reduxUser.first_name || "",
          lastName: reduxUser.lastName || reduxUser.last_name || "",
          countryCode: reduxUser.countryCode || reduxUser.country_code || "US",
        };
        setUser(userData);
        
        // Initialize form fields
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email || "");
        setPhoneNumber(userData.phoneNumber || "");
        setBio(userData.bio || "");
        setProfileImage(userData.profileImage || null);
        setTeamLogo(userData.teamLogo || null);
        return; // ✅ Redux data available, return directly
      }

      // ⚠️ Only use AsyncStorage fallback when Redux data is not available
      console.log("⚠️ Redux user not available, trying AsyncStorage fallback...");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("📢 Loaded user from AsyncStorage fallback:", parsedUser);
        setUser(parsedUser);
        
        // Initialize form fields
        setFirstName(parsedUser.firstName || parsedUser.first_name || "");
        setLastName(parsedUser.lastName || parsedUser.last_name || "");
        setEmail(parsedUser.email || "");
        setPhoneNumber(parsedUser.phoneNumber || "");
        setBio(parsedUser.bio || "");
        setProfileImage(parsedUser.profileImage || null);
        setTeamLogo(parsedUser.teamLogo || null);
      } else {
        console.log("⚠️ No user found in Redux or AsyncStorage.");
        Alert.alert("Error", "Unable to load user data. Please try logging in again.");
        router.back();
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);
      
      // Update user object with new values
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        profileImage,
        teamLogo,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Show success message
      Alert.alert(
        "Success", 
        "Profile updated successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </SafeAreaView>
    );
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
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <FontAwesomeIcon icon={faCheck} color="#007AFF" size={20} />
          )}
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            {/* Profile Banner */}
            <View style={styles.profileBanner}>
              <LinearGradient
                colors={['#1A1A1A', '#0C0B0B']}
                style={styles.bannerGradient}
              />
              
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
    <Image 
      source={profileImage ? { uri: profileImage } : images.coachHeadshot} 
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
                  <Text style={styles.roleText}>Coach</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
  <Text style={styles.sectionTitle}>Team Information</Text>
  <View style={styles.teamLogoContainer}>
    <Image 
      source={teamLogo ? { uri: teamLogo } : images.teamLogo} 
      style={styles.teamLogo} 
    />
    <View style={styles.teamLogoContent}>
      <Text style={styles.teamLogoLabel}>Team Logo</Text>
    </View>
  </View>
</View>


            
            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faUser} color="#999999" size={14} style={styles.inputIcon} />
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
                  <FontAwesomeIcon icon={faUser} color="#999999" size={14} style={styles.inputIcon} />
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
                  <FontAwesomeIcon icon={faEnvelope} color="#999999" size={14} style={styles.inputIcon} />
                  <Text style={styles.inputLabel}>Email*</Text>
                </View>
                <Input 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  inputStyle={styles.input}
                  placeholderTextColor="#666666"
                />
              </View>
              
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <FontAwesomeIcon icon={faPhone} color="#999999" size={14} style={styles.inputIcon} />
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
            
          
            
            {/* Save Button */}
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveProfileButton}
            >
              <LinearGradient
                colors={isSaving ? ['#1A5B9B', '#0D4A8F'] : ['#007AFF', '#0055CC']}
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    marginBottom: 10,
    marginTop: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0C0B0B",
  },
  nameContainer: {
    alignItems: "center",
    marginBottom: 12,
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
    backgroundColor: "rgba(0, 122, 255, 0.2)",
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
    backgroundColor: "#1A1A1A",
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
  teamLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#252525",
  },
  teamLogoContent: {
    marginLeft: 16,
  },
  teamLogoLabel: {
    color: "#F0F0F0",
    fontSize: 16,
    marginBottom: 4,
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

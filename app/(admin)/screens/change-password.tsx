import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

// Password Field Component - moved outside to prevent re-creation on each render
const PasswordField = ({
  label,
  value,
  onChangeText,
  showPassword,
  onToggleShow,
  error,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
  placeholder?: string;
  icon: string;
}) => (
  <View className="mb-4">
    <Text className="text-gray-400 font-Outfit-Medium text-xs mb-2 uppercase tracking-wider">
      {label}
    </Text>
    <View
      className="bg-[#1A1A1A] rounded-2xl px-4 py-3.5 flex-row items-center"
      style={{
        borderWidth: 1,
        borderColor: error ? "rgba(255, 107, 107, 0.5)" : "rgba(255,255,255,0.06)",
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
      >
        <FontAwesome6 name={icon} size={14} color="#FCA311" />
      </View>
      <TextInput
        className="flex-1 text-white-100 font-Outfit-Regular text-lg"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        placeholder={placeholder}
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
        editable={true}
      />
      <TouchableOpacity
        onPress={onToggleShow}
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={18}
          color="#888"
        />
      </TouchableOpacity>
    </View>
    {error && (
      <Text className="text-[#FF6B6B] font-Outfit-Regular text-xs mt-1.5 ml-1">{error}</Text>
    )}
  </View>
);

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No user is currently logged in");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert(
        "Success",
        "Your password has been changed successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Password change error:", error);
      let errorMessage = "Failed to change password";

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ newPassword: "Password is too weak. Please choose a stronger password" });
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Session Expired",
          "For security reasons, please log out and log back in before changing your password."
        );
      } else {
        Alert.alert("Error", error.message || errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full items-center justify-center mr-3"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white-100 text-2xl font-Oswald-Bold">CHANGE PASSWORD</Text>
          <Text className="text-gray-400 font-Outfit-Regular text-sm">
            Update your account password
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <LinearGradient
          colors={["#5C3D1E", "#2A1D0F"]}
          className="p-4 mt-4 flex-row"
          style={{ borderWidth: 1, borderColor: "rgba(252, 163, 17, 0.2)", borderRadius: 16 }}
        >
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(252, 163, 17, 0.2)" }}
          >
            <FontAwesome6 name="shield-halved" size={20} color="#FCA311" />
          </View>
          <View className="flex-1">
            <Text className="text-white-100 font-Oswald-Medium text-lg">Password Requirements</Text>
            <Text className="text-gray-400 font-Outfit-Regular text-sm mt-1">
              Your password must be at least 6 characters long. We recommend using a mix of letters, numbers, and symbols.
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View className="mt-6">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
            }}
            showPassword={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            error={errors.currentPassword}
            placeholder="Enter your current password"
            icon="lock"
          />

          <PasswordField
            label="New Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
            }}
            showPassword={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
            placeholder="Enter your new password"
            icon="key"
          />

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            icon="circle-check"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="mt-6 py-4 rounded-2xl items-center"
          style={{ backgroundColor: isLoading ? "rgba(252, 163, 17, 0.5)" : "#FCA311" }}
          onPress={handleChangePassword}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black-100 font-Oswald-Bold text-base">Change Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

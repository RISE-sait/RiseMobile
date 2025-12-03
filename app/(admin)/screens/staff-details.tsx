import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/utils/auth";
import { getAllStaff, getStaffActivityLogs, type Staff, type StaffActivityLog } from "@/utils/api/admin";

// Info Row Component
const InfoRow = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 border-b border-[#222]"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View
      className="w-11 h-11 rounded-xl items-center justify-center mr-3"
      style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
    >
      <FontAwesome6 name={icon} size={18} color="#FCA311" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-500 font-Outfit-Regular text-sm">{label}</Text>
      <Text className="text-white-100 font-Outfit-Medium text-base mt-1">
        {value || "Not provided"}
      </Text>
    </View>
    {onPress && (
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </View>
    )}
  </TouchableOpacity>
);

export default function StaffDetailsScreen() {
  const router = useRouter();
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { getValidToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [activityLogs, setActivityLogs] = useState<StaffActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const hasFetchedRef = React.useRef(false);

  // Only fetch once on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchStaff = async () => {
      if (!staffId) return;

      try {
        const token = await getValidToken();
        if (!token) return;

        // Get all staff and find the one we need
        const allStaff = await getAllStaff(token);
        const foundStaff = allStaff.find((s) => s.id === staffId);
        setStaff(foundStaff || null);

        // Activity logs removed for now
        setLogsLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
        setLogsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "#FCA311";
      case "superadmin":
      case "super admin":
        return "#FF6B6B";
      case "it":
        return "#4ECDC4";
      case "receptionist":
        return "#9B59B6";
      case "coach":
        return "#4CAF50";
      case "instructor":
        return "#2196F3";
      case "barber":
        return "#FF9800";
      default:
        return "#FCA311";
    }
  };

  // Helper to get lighter shade of color for gradient
  const getLighterColor = (hex: string) => {
    // Convert hex to RGB and make it lighter
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Mix with white (lighter)
    const lighterR = Math.min(255, r + 50);
    const lighterG = Math.min(255, g + 50);
    const lighterB = Math.min(255, b + 50);
    return `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
  };

  const handleCall = () => {
    if (staff?.phone) {
      Linking.openURL(`tel:${staff.phone}`);
    }
  };

  const handleEmail = () => {
    if (staff?.email) {
      Linking.openURL(`mailto:${staff.email}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FCA311" />
      </SafeAreaView>
    );
  }

  if (!staff) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <View className="px-5 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#1A1A1A] rounded-full items-center justify-center mr-3"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white-100 text-2xl font-Oswald-Bold">STAFF</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
          >
            <FontAwesome6 name="user-tie" size={32} color="#FCA311" />
          </View>
          <Text className="text-white-100 font-Oswald-Medium text-lg">Staff Not Found</Text>
          <Text className="text-gray-400 font-Outfit-Regular mt-2">
            The staff member could not be loaded
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleColor = getRoleColor(staff.role_name);

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
        <Text className="text-white-100 text-2xl font-Oswald-Bold">STAFF DETAILS</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="items-center mt-6 mb-6">
          {staff.photo_url ? (
            <Image
              source={{ uri: staff.photo_url }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: `${roleColor}50`
              }}
            />
          ) : (
            <LinearGradient
              colors={[roleColor, getLighterColor(roleColor)]}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: roleColor
              }}
              className="items-center justify-center"
            >
              <Text className="text-white-100 font-Oswald-Bold text-4xl">
                {getInitials(staff.first_name, staff.last_name)}
              </Text>
            </LinearGradient>
          )}
          <Text className="text-white-100 font-Oswald-Bold text-3xl mt-4">
            {staff.first_name} {staff.last_name}
          </Text>
          <View className="flex-row items-center mt-3">
            <View
              className="px-4 py-1.5 rounded-full"
              style={{ backgroundColor: `${roleColor}20` }}
            >
              <Text
                className="font-Outfit-Medium text-base capitalize"
                style={{ color: roleColor }}
              >
                {staff.role_name}
              </Text>
            </View>
            {!staff.is_active && (
              <View
                className="px-4 py-1.5 rounded-full ml-2"
                style={{ backgroundColor: "rgba(255, 107, 107, 0.15)" }}
              >
                <Text className="text-[#FF6B6B] font-Outfit-Medium text-base">Inactive</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row mb-6 gap-3">
          <TouchableOpacity
            className="flex-1 bg-[#1A1A1A] rounded-2xl py-5 items-center"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            onPress={handleCall}
            disabled={!staff.phone}
            activeOpacity={0.7}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
            >
              <FontAwesome6 name="phone" size={22} color="#4CAF50" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-base">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#1A1A1A] rounded-2xl py-5 items-center"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            onPress={handleEmail}
            disabled={!staff.email}
            activeOpacity={0.7}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: "rgba(33, 150, 243, 0.15)" }}
            >
              <FontAwesome6 name="envelope" size={22} color="#2196F3" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-base">Email</Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: staff.is_active
              ? "rgba(76, 175, 80, 0.08)"
              : "rgba(255, 107, 107, 0.08)",
            borderWidth: 1,
            borderColor: staff.is_active
              ? "rgba(76, 175, 80, 0.2)"
              : "rgba(255, 107, 107, 0.2)",
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-3"
              style={{
                backgroundColor: staff.is_active
                  ? "rgba(76, 175, 80, 0.15)"
                  : "rgba(255, 107, 107, 0.15)",
              }}
            >
              <FontAwesome6
                name={staff.is_active ? "circle-check" : "circle-xmark"}
                size={24}
                color={staff.is_active ? "#4CAF50" : "#FF6B6B"}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-Oswald-Bold text-xl"
                style={{ color: staff.is_active ? "#4CAF50" : "#FF6B6B" }}
              >
                {staff.is_active ? "Active Staff Member" : "Inactive Staff Member"}
              </Text>
              <Text className="text-gray-400 font-Outfit-Regular text-sm mt-1">
                {staff.is_active
                  ? "This staff member can access the system"
                  : "This staff member's access is disabled"}
              </Text>
            </View>
          </View>
        </View>

        {/* Coach Stats (if applicable) */}
        {staff.role_name?.toLowerCase() === "coach" && staff.coach_stats && (
          <View
            className="bg-[#1A1A1A] rounded-2xl p-5 mb-6"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
          >
            <View className="py-3 border-b border-[#222]">
              <Text className="text-gold-100 font-Oswald-Bold text-base">COACHING STATS</Text>
            </View>
            <View className="flex-row justify-around py-5">
              <View className="items-center">
                <Text className="text-green-500 font-Oswald-Bold text-4xl">
                  {staff.coach_stats.wins}
                </Text>
                <Text className="text-gray-400 font-Outfit-Medium text-sm mt-1">Wins</Text>
              </View>
              <View className="w-px bg-gray-700" />
              <View className="items-center">
                <Text className="text-red-400 font-Oswald-Bold text-4xl">
                  {staff.coach_stats.losses}
                </Text>
                <Text className="text-gray-400 font-Outfit-Medium text-sm mt-1">Losses</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View
          className="bg-[#1A1A1A] rounded-2xl px-5 mb-6"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <View className="py-4 border-b border-[#222]">
            <Text className="text-gold-100 font-Oswald-Bold text-base">CONTACT INFORMATION</Text>
          </View>
          <InfoRow
            icon="envelope"
            label="Email"
            value={staff.email || "No email provided"}
            onPress={staff.email ? handleEmail : undefined}
          />
          <InfoRow
            icon="phone"
            label="Phone"
            value={staff.phone || "No phone provided"}
            onPress={staff.phone ? handleCall : undefined}
          />
          <InfoRow
            icon="flag"
            label="Country Code"
            value={staff.country_code || "Not specified"}
          />
          <InfoRow
            icon="briefcase"
            label="Role"
            value={staff.role_name || "Not specified"}
          />
          <InfoRow
            icon="calendar"
            label="Joined"
            value={staff.created_at ? new Date(staff.created_at).toLocaleDateString() : "Not available"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

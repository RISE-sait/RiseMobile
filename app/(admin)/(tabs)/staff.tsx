import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import {
  getAllStaff,
  getPendingStaff,
  approveStaff,
  rejectStaff,
  type Staff,
  type PendingStaff,
} from "@/utils/api/admin";

// Staff Card Component - Memoized to prevent unnecessary re-renders
const StaffCard = memo(({
  staff,
  onPress,
}: {
  staff: Staff;
  onPress: () => void;
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
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

  const roleColor = getRoleColor(staff.role_name);

  return (
    <TouchableOpacity
      className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {staff.photo_url ? (
        <Image
          source={{ uri: staff.photo_url }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
          }}
        />
      ) : (
        <View
          className="items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: roleColor
          }}
        >
          <Text className="text-white-100 font-Oswald-Bold text-xl">
            {getInitials(staff.first_name, staff.last_name)}
          </Text>
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-white-100 font-Oswald-Medium text-lg">
          {staff.first_name} {staff.last_name}
        </Text>
        <Text className="text-gray-400 font-Outfit-Regular text-sm mt-0.5">
          {staff.email}
        </Text>
        <View className="flex-row items-center mt-2">
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${roleColor}30` }}
          >
            <Text
              className="text-sm font-Outfit-Medium capitalize"
              style={{ color: roleColor }}
            >
              {staff.role_name}
            </Text>
          </View>
          {!staff.is_active && (
            <View className="px-2.5 py-1 rounded-full ml-2 bg-red-900/30">
              <Text className="text-red-400 font-Outfit-Medium text-sm">Inactive</Text>
            </View>
          )}
        </View>
      </View>
      <FontAwesome6 name="chevron-right" size={18} color="#666" />
    </TouchableOpacity>
  );
});

// Pending Staff Card Component - Memoized to prevent unnecessary re-renders
const PendingStaffCard = memo(({
  staff,
  onApprove,
  onReject,
  isProcessing,
}: {
  staff: PendingStaff;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <View className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 border border-gold-100/20">
      <View className="flex-row items-center">
        <View
          className="items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#FCA311"
          }}
        >
          <Text className="text-black-100 font-Oswald-Bold text-xl">
            {getInitials(staff.first_name, staff.last_name)}
          </Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white-100 font-Oswald-Medium text-lg">
            {staff.first_name} {staff.last_name}
          </Text>
          <Text className="text-gray-400 font-Outfit-Regular text-sm mt-0.5">
            {staff.email}
          </Text>
          {staff.phone && (
            <Text className="text-gray-500 font-Outfit-Regular text-sm mt-0.5">
              {staff.phone}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row mt-4 gap-3">
        <TouchableOpacity
          className="flex-1 py-3.5 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
          onPress={onApprove}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <>
              <FontAwesome6 name="circle-check" size={18} color="#4CAF50" />
              <Text className="font-Oswald-Medium text-base ml-2" style={{ color: "#4CAF50" }}>
                Approve
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3.5 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: "rgba(255, 107, 107, 0.15)" }}
          onPress={onReject}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <FontAwesome6 name="circle-xmark" size={18} color="#FF6B6B" />
              <Text className="font-Oswald-Medium text-base ml-2" style={{ color: "#FF6B6B" }}>
                Reject
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Tab Button Component - Memoized to prevent unnecessary re-renders
const TabButton = memo(({
  title,
  isActive,
  count,
  onPress,
}: {
  title: string;
  isActive: boolean;
  count?: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 py-3.5 items-center rounded-xl"
    style={{
      backgroundColor: isActive ? "#FCA311" : "#1A1A1A",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center">
      <Text
        className={`font-Oswald-Medium text-base ${isActive ? "text-black-100" : "text-gray-400"}`}
      >
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          className="ml-2 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: isActive ? "#000" : "#FCA311" }}
        >
          <Text
            className="text-sm font-Oswald-Bold"
            style={{ color: isActive ? "#FCA311" : "#000" }}
          >
            {count}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
));

// Empty State Component - Memoized
const EmptyState = memo(({ type }: { type: "staff" | "pending" }) => (
  <View className="flex-1 items-center justify-center py-20">
    <View className="bg-[#2A2A2A] p-5 rounded-full mb-4">
      <FontAwesome6
        name={type === "staff" ? "user-tie" : "circle-check"}
        size={48}
        color={type === "staff" ? "#FCA311" : "#4CAF50"}
      />
    </View>
    <Text className="text-white-100 font-Oswald-Medium text-xl">
      {type === "staff" ? "No Staff Members" : "All Caught Up!"}
    </Text>
    <Text className="text-gray-400 font-Outfit-Regular text-base text-center mt-2 px-8">
      {type === "staff"
        ? "Staff members will appear here once approved"
        : "No pending staff applications to review"}
    </Text>
  </View>
));

export default function StaffScreen() {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [pendingStaffList, setPendingStaffList] = useState<PendingStaff[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchStaffData = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const [staffData, pendingData] = await Promise.all([
        getAllStaff(token),
        getPendingStaff(token),
      ]);

      setStaffList(staffData || []);
      setPendingStaffList(pendingData || []);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [getValidToken]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStaffData();
  }, [fetchStaffData]);

  const handleApprove = async (staffId: string) => {
    Alert.alert(
      "Approve Staff",
      "Are you sure you want to approve this staff member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            setProcessingIds((prev) => new Set(prev).add(staffId));
            try {
              const token = await getValidToken();
              if (!token) return;

              const success = await approveStaff(token, staffId);
              if (success) {
                setPendingStaffList((prev) => prev.filter((s) => s.id !== staffId));
                Alert.alert("Success", "Staff member has been approved.");
                fetchStaffData();
              } else {
                Alert.alert("Error", "Failed to approve staff member.");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while approving staff.");
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(staffId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleReject = async (staffId: string) => {
    Alert.alert(
      "Reject Staff",
      "Are you sure you want to reject this staff application?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessingIds((prev) => new Set(prev).add(staffId));
            try {
              const token = await getValidToken();
              if (!token) return;

              const success = await rejectStaff(token, staffId);
              if (success) {
                setPendingStaffList((prev) => prev.filter((s) => s.id !== staffId));
                Alert.alert("Success", "Staff application has been rejected.");
              } else {
                Alert.alert("Error", "Failed to reject staff application.");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while rejecting staff.");
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(staffId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleStaffPress = (staff: Staff) => {
    router.push({
      pathname: "/(admin)/screens/staff-details",
      params: { staffId: staff.id },
    });
  };

  const staffCount = staffList?.length || 0;
  const pendingCount = pendingStaffList?.length || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header Section */}
      <View className="w-full px-10 mt-10">
        <Text className="text-white-100 font-Oswald-Bold text-2xl">STAFF</Text>

        {/* Stats Row */}
        <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mt-3 p-5">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                {staffCount}
              </Text>
              <Text className="text-gray-400 font-Oswald-Medium text-sm mt-1">Active Staff</Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                {pendingCount}
              </Text>
              <Text className="text-gray-400 font-Oswald-Medium text-sm mt-1">Pending</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="w-full px-10 mt-6 flex-row gap-3">
        <TabButton
          title="Active Staff"
          isActive={activeTab === "active"}
          onPress={() => setActiveTab("active")}
        />
        <TabButton
          title="Pending"
          isActive={activeTab === "pending"}
          count={pendingCount}
          onPress={() => setActiveTab("pending")}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : activeTab === "active" ? (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StaffCard
              staff={item}
              onPress={() => handleStaffPress(item)}
            />
          )}
          ListEmptyComponent={<EmptyState type="staff" />}
          contentContainerStyle={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <FlatList
          data={pendingStaffList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PendingStaffCard
              staff={item}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
              isProcessing={processingIds.has(item.id)}
            />
          )}
          ListEmptyComponent={<EmptyState type="pending" />}
          contentContainerStyle={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />
      )}
    </SafeAreaView>
  );
}

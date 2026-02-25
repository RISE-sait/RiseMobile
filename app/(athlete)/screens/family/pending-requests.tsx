import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import { getLinkRequests, cancelLinkRequest, confirmLink } from "@/utils/api/family";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setLinkRequests } from "@/store/slices/familySlice";
import type { LinkRequest } from "@/types/family";

const RequestCard = ({
  request,
  onCancel,
  onAccept,
  cancelling,
  showCodeInput,
  verificationCode,
  onCodeChange,
}: {
  request: LinkRequest;
  onCancel: () => void;
  onAccept?: (code: string) => void;
  cancelling: boolean;
  showCodeInput: boolean;
  verificationCode: string;
  onCodeChange: (code: string) => void;
}) => {
  // Determine what to show based on user_role
  const isChild = request.user_role === "child";
  const displayName = isChild ? request.new_parent_name : request.child_name;
  const displayEmail = isChild ? request.new_parent_email : request.child_email;
  const roleLabel = isChild ? "Parent Request" : "Child Request";

  return (
    <View className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]/50 p-4 mb-3">
      <View className="flex-row items-start mb-3">
        <View className="w-10 h-10 rounded-full bg-[#FCA311] items-center justify-center mr-3">
          <Text className="text-black text-sm font-Outfit-Bold">
            {displayName?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <FontAwesome6
              name={isChild ? "user" : "child"}
              size={10}
              color="#FCA311"
            />
            <Text className="text-gray-400 text-xs font-Outfit-SemiBold ml-1.5 uppercase">
              {roleLabel}
            </Text>
          </View>
          <Text className="text-white-100 text-base font-Outfit-SemiBold">{displayName}</Text>
          <Text className="text-gray-400 text-sm font-Outfit-Regular mt-0.5">
            {displayEmail}
          </Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome6 name="clock" size={10} color="#666" />
            <Text className="text-gray-500 text-xs font-Outfit-Regular ml-1.5">
              {new Date(request.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {isChild ? (
        // Child view - show code input and accept button
        <>
          {showCodeInput && (
            <View className="mb-3">
              <Text className="text-gray-400 text-xs font-Outfit-SemiBold mb-2 uppercase tracking-wide">
                Verification Code
              </Text>
              <TextInput
                value={verificationCode}
                onChangeText={onCodeChange}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                className="bg-[#0C0B0B] text-white-100 text-base font-Outfit-Regular px-4 py-3 rounded-lg border border-[#2A2A2A]"
              />
            </View>
          )}
          <TouchableOpacity
            onPress={() => onAccept?.(verificationCode)}
            disabled={cancelling || (showCodeInput && verificationCode.trim().length !== 6)}
            className={`py-3 rounded-lg items-center ${
              cancelling || (showCodeInput && verificationCode.trim().length !== 6)
                ? "bg-[#2A2A2A]"
                : "bg-[#FCA311]"
            }`}
            activeOpacity={0.7}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#FCA311" />
            ) : (
              <Text className="text-black text-sm font-Outfit-Bold">
                {showCodeInput ? "Confirm Code" : "Enter Code"}
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        // Parent view - show Cancel button
        <TouchableOpacity
          onPress={onCancel}
          disabled={cancelling}
          className={`py-3 rounded-lg items-center ${
            cancelling ? "bg-[#2A2A2A]" : "bg-red-500/10 border border-red-500/30"
          }`}
          activeOpacity={0.7}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text className="text-red-400 text-sm font-Outfit-SemiBold">Cancel Request</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const PendingRequestsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getValidToken } = useAuth();
  const linkRequests = useSelector((state: RootState) => state.family.linkRequests);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCodeInputId, setShowCodeInputId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const data = await getLinkRequests(token);
      dispatch(setLinkRequests(Array.isArray(data) ? data : []));
    } catch (error) {
      // Error already logged in API layer
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, getValidToken]);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  const handleAccept = async (request: LinkRequest, code: string) => {
    // If code input is not showing, show it first
    if (showCodeInputId !== request.id) {
      setShowCodeInputId(request.id);
      return;
    }

    // Validate code
    if (!code || code.trim().length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code");
      return;
    }

    setCancellingId(request.id);
    try {
      const token = await getValidToken();
      if (!token) return;

      console.log("✅ Accepting link request with code:", code.trim());
      await confirmLink(token, { code: code.trim() });
      console.log("🎉 Link request accepted!");

      Alert.alert("Success", "Link request accepted successfully!");
      setShowCodeInputId(null);
      setVerificationCode("");
      await fetchRequests();
    } catch (error: any) {
      console.error("❌ Accept error:", error.response?.data || error.message);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "Failed to accept the request. Please check the code and try again.";
      Alert.alert("Error", message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancel = (request: LinkRequest) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this link request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancellingId(request.id);
            try {
              const token = await getValidToken();
              if (!token) return;

              console.log("🗑️ Canceling link request...");
              await cancelLinkRequest(token);
              console.log("✅ Link request canceled");

              await fetchRequests();
            } catch (error: any) {
              console.error("❌ Cancel error:", error.response?.data || error.message);
              Alert.alert("Error", "Failed to cancel the request. Please try again.");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  // API doesn't return status field - all requests in the list are pending
  const pendingRequests = linkRequests;

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-3 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 py-2"
          activeOpacity={0.6}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white-100 text-lg font-Outfit-SemiBold">Pending Requests</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#FCA311" />
        </View>
      ) : pendingRequests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 rounded-full bg-[#1A1A1A] items-center justify-center mb-4">
            <FontAwesome6 name="clock" size={32} color="#666" />
          </View>
          <Text className="text-white-100 text-lg font-Outfit-SemiBold mb-2">
            No Pending Requests
          </Text>
          <Text className="text-gray-500 text-sm font-Outfit-Regular text-center">
            You don't have any pending link requests at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onCancel={() => handleCancel(item)}
              onAccept={(code) => handleAccept(item, code)}
              cancelling={cancellingId === item.id}
              showCodeInput={showCodeInputId === item.id}
              verificationCode={verificationCode}
              onCodeChange={setVerificationCode}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PendingRequestsScreen;

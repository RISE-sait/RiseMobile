import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
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
import { getLinkRequests, cancelLinkRequest } from "@/utils/api/family";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setLinkRequests } from "@/store/slices/familySlice";
import type { LinkRequest } from "@/types/family";

const RequestCard = ({
  request,
  onCancel,
  cancelling,
}: {
  request: LinkRequest;
  onCancel: () => void;
  cancelling: boolean;
}) => {
  const childName = request.child
    ? `${request.child.first_name} ${request.child.last_name}`
    : "Unknown";

  return (
    <View className="bg-[#1A1A1A] p-4 rounded-2xl mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-base font-Outfit-SemiBold">{childName}</Text>
          <Text className="text-gray-400 text-xs font-Outfit-Regular mt-1">
            Status: {request.status}
          </Text>
          {request.created_at && (
            <Text className="text-gray-500 text-xs font-Outfit-Regular mt-0.5">
              Requested: {new Date(request.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onCancel}
          disabled={cancelling}
          className="bg-red-900/40 px-4 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text className="text-red-400 text-sm font-Outfit-SemiBold">Cancel</Text>
          )}
        </TouchableOpacity>
      </View>
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
  }, [fetchRequests]);

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

              await cancelLinkRequest(token);
              await fetchRequests();
            } catch (error) {
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

  const pendingRequests = linkRequests.filter((r) => r.status === "pending");

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-Outfit-SemiBold">Pending Requests</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : pendingRequests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <FontAwesome6 name="inbox" size={48} color="#333" />
          <Text className="text-gray-500 text-base font-Outfit-Regular mt-4 text-center">
            No pending link requests
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
              cancelling={cancellingId === item.id}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
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

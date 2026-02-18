import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { useAuth } from "@/utils/auth";
import { getChildren, getLinkRequests } from "@/utils/api/family";
import { setChildren, setLinkRequests, setFamilyLoading, setFamilyError } from "@/store/slices/familySlice";
import { FontAwesome6 } from "@expo/vector-icons";
import type { Child } from "@/types/family";

const ChildRow = ({ child, onPress }: { child: Child; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-3 border-b border-gray-800"
    activeOpacity={0.7}
  >
    <View className="w-10 h-10 rounded-full bg-[#2A2A2A] items-center justify-center mr-3">
      <Text className="text-white text-base font-Outfit-SemiBold">
        {child.first_name?.charAt(0)?.toUpperCase()}{child.last_name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-white text-base font-Outfit-Medium">
        {child.first_name} {child.last_name}
      </Text>
      <Text className="text-gray-500 text-xs font-Outfit-Regular">
        {child.country_code || ""}
      </Text>
    </View>
    <FontAwesome6 name="chevron-right" size={14} color="#666" />
  </TouchableOpacity>
);

const FamilyCard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getValidToken } = useAuth();
  const { children, linkRequests, loading } = useSelector((state: RootState) => state.family);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchFamilyData = useCallback(async () => {
    try {
      dispatch(setFamilyLoading());
      const token = await getValidToken();
      if (!token) return;

      const [childrenData, requestsData] = await Promise.all([
        getChildren(token).catch(() => []),
        getLinkRequests(token).catch(() => []),
      ]);

      dispatch(setChildren(Array.isArray(childrenData) ? childrenData : []));
      dispatch(setLinkRequests(Array.isArray(requestsData) ? requestsData : []));
    } catch (error: any) {
      dispatch(setFamilyError(error.message || "Failed to load family data"));
    } finally {
      setHasFetched(true);
    }
  }, [dispatch, getValidToken]);

  useEffect(() => {
    if (!hasFetched) {
      fetchFamilyData();
    }
  }, [hasFetched, fetchFamilyData]);

  const pendingCount = linkRequests.filter((r) => r.status === "pending").length;

  // Hide the card entirely if the user has no children and no pending link requests
  // A "parent" is just an athlete who has children linked to them
  if (hasFetched && children.length === 0 && pendingCount === 0) {
    return null;
  }

  return (
    <View className="mt-6 mx-4 bg-[#1A1A1A] p-5 rounded-2xl shadow-lg shadow-black">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <FontAwesome6 name="people-group" size={18} color="#FCA311" />
          <Text className="text-white text-lg font-Outfit-SemiBold ml-2">My Family</Text>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(athlete)/screens/family/pending-requests")}
            className="bg-[#FCA311] px-3 py-1 rounded-full"
          >
            <Text className="text-black text-xs font-Outfit-SemiBold">
              {pendingCount} pending
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading state */}
      {loading === "pending" && !hasFetched && (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#FCA311" />
        </View>
      )}

      {/* Children list */}
      {hasFetched && children.length > 0 && (
        <View>
          {children.map((child) => (
            <ChildRow
              key={child.id}
              child={child}
              onPress={() =>
                router.push({
                  pathname: "/(athlete)/screens/family/child-dashboard",
                  params: { childId: child.id, childName: `${child.first_name} ${child.last_name}` },
                })
              }
            />
          ))}
        </View>
      )}

      {/* Empty state */}
      {hasFetched && children.length === 0 && loading !== "pending" && (
        <View className="py-4 items-center">
          <Text className="text-gray-500 text-sm font-Outfit-Regular mb-1">
            No children linked yet
          </Text>
          <Text className="text-gray-600 text-xs font-Outfit-Regular">
            Link your child's account to manage their activities
          </Text>
        </View>
      )}

      {/* Link a Child button */}
      <TouchableOpacity
        onPress={() => router.push("/(athlete)/screens/family/link-request")}
        className="mt-4 bg-[#FCA311] py-3 rounded-xl items-center flex-row justify-center"
        activeOpacity={0.8}
      >
        <FontAwesome6 name="plus" size={14} color="#000" />
        <Text className="text-black text-sm font-Outfit-SemiBold ml-2">Link a Child</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FamilyCard;

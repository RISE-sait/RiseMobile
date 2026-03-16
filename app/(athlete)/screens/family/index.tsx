import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { useAuth } from "@/utils/auth";
import { getChildren, getParent, getSiblings, getLinkRequests } from "@/utils/api/family";
import { setChildren, setParent, setSiblings, setLinkRequests, setFamilyLoading, setFamilyError } from "@/store/slices/familySlice";
import { FontAwesome6 } from "@expo/vector-icons";
import type { Child, Parent, Sibling } from "@/types/family";

const ChildRow = ({ child, onPress }: { child: Child; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-3 border-b border-[#2A2A2A]/30"
    activeOpacity={0.6}
  >
    <View className="w-10 h-10 rounded-full bg-[#FCA311] items-center justify-center mr-3">
      <Text className="text-black text-sm font-Outfit-Bold">
        {child.first_name?.charAt(0)?.toUpperCase()}{child.last_name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-base font-Outfit-SemiBold">
        {child.first_name} {child.last_name}
      </Text>
    </View>
    <FontAwesome6 name="chevron-right" size={12} color="#666" />
  </TouchableOpacity>
);

const ParentRow = ({ parent }: { parent: Parent }) => (
  <View className="flex-row items-center py-3 border-b border-[#2A2A2A]/30">
    <View className="w-10 h-10 rounded-full bg-[#8B5CF6] items-center justify-center mr-3">
      <FontAwesome6 name="user" size={14} color="#FFF" />
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-base font-Outfit-SemiBold">
        {parent.first_name} {parent.last_name}
      </Text>
      <Text className="text-gray-500 text-sm font-Outfit-Regular">Parent</Text>
    </View>
  </View>
);

const SiblingRow = ({ sibling }: { sibling: Sibling }) => (
  <View className="flex-row items-center py-3 border-b border-[#2A2A2A]/30">
    <View className="w-10 h-10 rounded-full bg-[#10B981] items-center justify-center mr-3">
      <Text className="text-white text-sm font-Outfit-Bold">
        {sibling.first_name?.charAt(0)?.toUpperCase()}{sibling.last_name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-base font-Outfit-SemiBold">
        {sibling.first_name} {sibling.last_name}
      </Text>
      <Text className="text-gray-500 text-sm font-Outfit-Regular">Sibling</Text>
    </View>
  </View>
);

const FamilyScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getValidToken } = useAuth();
  const { children, parent, siblings, linkRequests, loading } = useSelector((state: RootState) => state.family);
  const [hasFetched, setHasFetched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFamilyData = useCallback(async () => {
    try {
      dispatch(setFamilyLoading());
      const token = await getValidToken();
      if (!token) return;

      const [childrenData, parentData, siblingsData, requestsData] = await Promise.all([
        getChildren(token).catch(() => []),
        getParent(token).catch(() => null),
        getSiblings(token).catch(() => []),
        getLinkRequests(token).catch(() => []),
      ]);

      dispatch(setChildren(Array.isArray(childrenData) ? childrenData : []));
      dispatch(setParent(parentData));
      dispatch(setSiblings(Array.isArray(siblingsData) ? siblingsData : []));
      dispatch(setLinkRequests(Array.isArray(requestsData) ? requestsData : []));
    } catch (error: any) {
      dispatch(setFamilyError(error.message || "Failed to load family data"));
    } finally {
      setHasFetched(true);
      setRefreshing(false);
    }
  }, [dispatch, getValidToken]);

  useEffect(() => {
    if (!hasFetched) {
      fetchFamilyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFetched]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFamilyData();
  }, [fetchFamilyData]);

  const isChildUser = linkRequests.some((r) => r.user_role === "child") || parent !== null;
  const pendingCount = linkRequests.length;

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
        <View className="flex-1 flex-row items-center">
          <FontAwesome6 name="people-group" size={16} color="#FCA311" />
          <Text className="text-white-100 text-lg font-Outfit-SemiBold ml-2">Family</Text>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(athlete)/screens/family/pending-requests")}
            className="bg-[#FCA311] px-3 py-1.5 rounded-md"
            activeOpacity={0.7}
          >
            <Text className="text-black text-sm font-Outfit-Bold">
              {pendingCount}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FCA311"
          />
        }
      >
        {/* Loading state */}
        {loading === "pending" && !hasFetched && (
          <View className="py-10 items-center">
            <ActivityIndicator size="small" color="#FCA311" />
          </View>
        )}

        {/* Family members */}
        {hasFetched && (parent || siblings.length > 0 || children.length > 0) && (
          <View className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]/50 px-4 py-2 mb-4">
            {/* Parent section */}
            {parent && <ParentRow parent={parent} />}

            {/* Siblings section */}
            {siblings.length > 0 && siblings.map((sibling) => (
              <SiblingRow key={sibling.id} sibling={sibling} />
            ))}

            {/* Children section */}
            {children.length > 0 && children.map((child) => (
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
        {hasFetched && !parent && children.length === 0 && siblings.length === 0 && pendingCount === 0 && loading !== "pending" && (
          <View className="flex-1 items-center justify-center px-10 py-20">
            <View className="w-20 h-20 rounded-full bg-[#1A1A1A] items-center justify-center mb-4">
              <FontAwesome6 name="people-group" size={32} color="#666" />
            </View>
            <Text className="text-white-100 text-lg font-Outfit-SemiBold mb-2">
              No Family Members
            </Text>
            <Text className="text-gray-500 text-sm font-Outfit-Regular text-center">
              You don't have any family members linked yet
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {hasFetched && (
          <View>
            {isChildUser && pendingCount > 0 ? (
              // Child user with pending requests - show "View Parent Request" button
              <TouchableOpacity
                onPress={() => router.push("/(athlete)/screens/family/pending-requests")}
                className="bg-[#FCA311] py-3 rounded-lg items-center flex-row justify-center"
                activeOpacity={0.8}
              >
                <FontAwesome6 name="bell" size={14} color="#000" />
                <Text className="text-black text-base font-Outfit-SemiBold ml-2">View Parent Request</Text>
              </TouchableOpacity>
            ) : !isChildUser ? (
              // Parent user - show "Link Child" button
              <TouchableOpacity
                onPress={() => router.push("/(athlete)/screens/family/link-request")}
                className="bg-[#FCA311] py-3 rounded-lg items-center flex-row justify-center"
                activeOpacity={0.8}
              >
                <FontAwesome6 name="plus" size={14} color="#000" />
                <Text className="text-black text-base font-Outfit-SemiBold ml-2">Link Child</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FamilyScreen;

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
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
    className="flex-row items-center py-2.5 border-b border-[#2A2A2A]/30"
    activeOpacity={0.6}
  >
    <View className="w-8 h-8 rounded-full bg-[#FCA311] items-center justify-center mr-3">
      <Text className="text-black text-xs font-Outfit-Bold">
        {child.first_name?.charAt(0)?.toUpperCase()}{child.last_name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-sm font-Outfit-Medium">
        {child.first_name} {child.last_name}
      </Text>
    </View>
    <FontAwesome6 name="chevron-right" size={10} color="#666" />
  </TouchableOpacity>
);

const ParentRow = ({ parent }: { parent: Parent }) => (
  <View className="flex-row items-center py-2.5 border-b border-[#2A2A2A]/30">
    <View className="w-8 h-8 rounded-full bg-[#8B5CF6] items-center justify-center mr-3">
      <FontAwesome6 name="user" size={12} color="#FFF" />
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-sm font-Outfit-Medium">
        {parent.first_name} {parent.last_name}
      </Text>
      <Text className="text-gray-500 text-xs font-Outfit-Regular">Parent</Text>
    </View>
  </View>
);

const SiblingRow = ({ sibling }: { sibling: Sibling }) => (
  <View className="flex-row items-center py-2.5 border-b border-[#2A2A2A]/30">
    <View className="w-8 h-8 rounded-full bg-[#10B981] items-center justify-center mr-3">
      <Text className="text-white text-xs font-Outfit-Bold">
        {sibling.first_name?.charAt(0)?.toUpperCase()}{sibling.last_name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-white-100 text-sm font-Outfit-Medium">
        {sibling.first_name} {sibling.last_name}
      </Text>
      <Text className="text-gray-500 text-xs font-Outfit-Regular">Sibling</Text>
    </View>
  </View>
);

const FamilyCard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getValidToken } = useAuth();
  const { children, parent, siblings, linkRequests, loading } = useSelector((state: RootState) => state.family);
  const [hasFetched, setHasFetched] = useState(false);

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
    }
  }, [dispatch, getValidToken]);

  useEffect(() => {
    if (!hasFetched) {
      fetchFamilyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFetched]); // Only depend on hasFetched to prevent excessive API calls

  // Count all link requests (API doesn't return status field - if it exists, it's pending)
  // Check if user is a child (has pending requests where they are the child OR has a parent)
  const isChildUser = linkRequests.some((r) => r.user_role === "child") || parent !== null;
  const pendingCount = linkRequests.length;

  // Don't show the card if user has no family connections
  if (hasFetched && !parent && children.length === 0 && siblings.length === 0 && pendingCount === 0) {
    return null;
  }

  return (
    <View className="mt-6 mx-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]/50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#2A2A2A]/50">
        <View className="flex-row items-center">
          <FontAwesome6 name="people-group" size={14} color="#FCA311" />
          <Text className="text-white-100 text-sm font-Outfit-SemiBold ml-2">Family</Text>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(athlete)/screens/family/pending-requests")}
            className="bg-[#FCA311] px-2.5 py-1 rounded-md"
            activeOpacity={0.7}
          >
            <Text className="text-black text-xs font-Outfit-Bold">
              {pendingCount}
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

      {/* Family members */}
      {hasFetched && (parent || siblings.length > 0 || children.length > 0) && (
        <View className="px-4 py-2">
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

      {/* Empty state - only show for parents */}
      {hasFetched && !parent && children.length === 0 && siblings.length === 0 && loading !== "pending" && (
        <View className="py-5 px-4">
          <Text className="text-gray-500 text-xs font-Outfit-Regular">
            No family members linked
          </Text>
        </View>
      )}

      {/* Action button */}
      <View className="px-4 pb-4 pt-2">
        {isChildUser && pendingCount > 0 ? (
          // Child user with pending requests - show "View Parent Request" button
          <TouchableOpacity
            onPress={() => router.push("/(athlete)/screens/family/pending-requests")}
            className="bg-[#FCA311] py-2.5 rounded-lg items-center flex-row justify-center"
            activeOpacity={0.8}
          >
            <FontAwesome6 name="bell" size={12} color="#000" />
            <Text className="text-black text-sm font-Outfit-SemiBold ml-1.5">View Parent Request</Text>
          </TouchableOpacity>
        ) : !isChildUser ? (
          // Parent user - show "Link Child" button
          <TouchableOpacity
            onPress={() => router.push("/(athlete)/screens/family/link-request")}
            className="bg-[#FCA311] py-2.5 rounded-lg items-center flex-row justify-center"
            activeOpacity={0.8}
          >
            <FontAwesome6 name="plus" size={12} color="#000" />
            <Text className="text-black text-sm font-Outfit-SemiBold ml-1.5">Link Child</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default FamilyCard;

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import { getCustomers, type Customer } from "@/utils/api/admin";
import { getTeamById, addAthleteToTeam, removeAthleteFromTeam } from "@/utils/api/teams";

interface RosterMember {
  id?: string;
  name?: string;
  email?: string;
  photo_url?: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
}

interface Team {
  id: string;
  name: string;
  capacity: number;
  roster?: RosterMember[];
}

// Helper function defined outside component
const getInitials = (name: string) => {
  const parts = name.split(" ");
  return `${parts[0]?.charAt(0) || ""}${parts[1]?.charAt(0) || ""}`.toUpperCase();
};

// Memoized Available Athlete Item
const AvailableAthleteItem = memo(({
  athlete,
  onAdd,
  isProcessing,
  isFull,
}: {
  athlete: Customer;
  onAdd: () => void;
  isProcessing: boolean;
  isFull: boolean;
}) => (
  <View className="flex-row items-center justify-between py-4 border-b border-[#222]">
    <View className="flex-row items-center flex-1">
      {athlete.photo_url ? (
        <Image
          source={{ uri: athlete.photo_url }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <View
          style={{ width: 48, height: 48, borderRadius: 24 }}
          className="bg-gold-100 items-center justify-center"
        >
          <Text className="text-black-100 font-Oswald-Bold text-lg">
            {getInitials(`${athlete.first_name} ${athlete.last_name}`)}
          </Text>
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-white-100 font-Outfit-Medium text-lg">
          {athlete.first_name} {athlete.last_name}
        </Text>
        <Text className="text-gray-400 font-Outfit-Regular text-base mt-0.5">
          {athlete.email}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      className="px-5 py-2.5 rounded-lg"
      style={{ backgroundColor: isFull ? "#333" : "rgba(76, 175, 80, 0.15)" }}
      onPress={onAdd}
      disabled={isFull || isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : (
        <Text
          className="font-Outfit-Medium text-base"
          style={{ color: isFull ? "#666" : "#4CAF50" }}
        >
          Add
        </Text>
      )}
    </TouchableOpacity>
  </View>
));

// Memoized Roster Member Item
const RosterMemberItem = memo(({
  member,
  onRemove,
  isProcessing,
  isLast,
}: {
  member: RosterMember;
  onRemove: () => void;
  isProcessing: boolean;
  isLast: boolean;
}) => (
  <View
    className="flex-row items-center justify-between py-4"
    style={{
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: "#222",
    }}
  >
    <View className="flex-row items-center flex-1">
      {member.photo_url ? (
        <Image
          source={{ uri: member.photo_url }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <View
          style={{ width: 48, height: 48, borderRadius: 24 }}
          className="bg-gold-100 items-center justify-center"
        >
          <Text className="text-black-100 font-Oswald-Bold text-lg">
            {getInitials(member.name || "")}
          </Text>
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-white-100 font-Outfit-Medium text-lg">
          {member.name}
        </Text>
        {member.email && (
          <Text className="text-gray-400 font-Outfit-Regular text-base mt-0.5">
            {member.email}
          </Text>
        )}
      </View>
    </View>
    <TouchableOpacity
      className="px-5 py-2.5 rounded-lg"
      style={{ backgroundColor: "rgba(255, 107, 107, 0.15)" }}
      onPress={onRemove}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#FF6B6B" />
      ) : (
        <Text className="text-red-400 font-Outfit-Medium text-base">
          Remove
        </Text>
      )}
    </TouchableOpacity>
  </View>
));

// Memoized Empty States
const EmptyAthletesState = memo(({ hasSearch }: { hasSearch: boolean }) => (
  <View className="py-8 items-center">
    <FontAwesome6 name="users" size={40} color="#666" />
    <Text className="text-gray-400 font-Outfit-Regular text-base mt-2">
      {hasSearch ? "No athletes found" : "Search for athletes to add"}
    </Text>
  </View>
));

const EmptyRosterState = memo(() => (
  <View className="py-8 items-center">
    <FontAwesome6 name="users-slash" size={40} color="#666" />
    <Text className="text-gray-400 font-Outfit-Regular text-base mt-2">
      No players on roster yet
    </Text>
  </View>
));

export default function ManageRosterScreen() {
  const router = useRouter();
  const { teamId, teamName } = useLocalSearchParams<{ teamId: string; teamName: string }>();
  const { getValidToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [rosterMembers, setRosterMembers] = useState<RosterMember[]>([]);
  const [allAthletes, setAllAthletes] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fetch team and athletes only once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getValidToken();
        if (!token || !teamId) return;

        // Fetch team data
        const teamData = await getTeamById(teamId, token);
        setTeam(teamData);
        setRosterMembers(teamData.roster || []);

        // Fetch all athletes using pagination (max 20 per request)
        let allCustomers: Customer[] = [];
        let currentPage = 1;
        let totalPages = 1;

        // Fetch first page to get total pages
        const firstResult = await getCustomers(token, undefined, 1, 20);
        allCustomers = firstResult.customers;
        totalPages = firstResult.pages;

        // Fetch remaining pages if needed
        for (let page = 2; page <= totalPages; page++) {
          const result = await getCustomers(token, undefined, page, 20);
          allCustomers = [...allCustomers, ...result.customers];
        }

        setAllAthletes(allCustomers);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        console.error("Error response:", error?.response?.data);
        Alert.alert("Error", "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Memoized roster member IDs for fast lookup
  const rosterMemberIds = useMemo(() => {
    return new Set(rosterMembers.map((member) => member.id));
  }, [rosterMembers]);

  // Memoized filter athletes - only recalculates when dependencies change
  const availableAthletes = useMemo(() => {
    return allAthletes.filter((athlete) => {
      // Filter out athletes already on team (using Set for O(1) lookup)
      if (rosterMemberIds.has(athlete.id)) return false;

      // If no search query, return all available athletes
      if (!searchQuery) return true;

      // Filter by search query
      const query = searchQuery.toLowerCase();
      const fullName = `${athlete.first_name} ${athlete.last_name}`.toLowerCase();
      return fullName.includes(query) || athlete.email.toLowerCase().includes(query);
    });
  }, [allAthletes, rosterMemberIds, searchQuery]);

  // Memoized capacity check
  const isFull = useMemo(() => {
    return rosterMembers.length >= (team?.capacity || 0);
  }, [rosterMembers.length, team?.capacity]);

  // Add athlete to team
  const handleAddAthlete = async (athleteId: string) => {
    if (isFull) {
      Alert.alert("Team Full", "This team is at full capacity");
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(athleteId));
    try {
      const token = await getValidToken();
      if (!token) return;

      const result = await addAthleteToTeam(athleteId, teamId, token);

      if (result.success) {
        // Find the athlete and add to roster
        const athlete = allAthletes.find((a) => a.id === athleteId);
        if (athlete) {
          setRosterMembers([
            ...rosterMembers,
            {
              id: athlete.id,
              name: `${athlete.first_name} ${athlete.last_name}`,
              email: athlete.email,
              photo_url: athlete.photo_url,
            },
          ]);
        }
        Alert.alert("Success", "Athlete added to team");
      } else {
        Alert.alert("Error", result.error || "Failed to add athlete to team");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while adding athlete");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(athleteId);
        return newSet;
      });
    }
  };

  // Remove athlete from team
  const handleRemoveAthlete = async (athleteId: string) => {
    Alert.alert(
      "Remove Athlete",
      "Are you sure you want to remove this athlete from the team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setProcessingIds((prev) => new Set(prev).add(athleteId));
            try {
              const token = await getValidToken();
              if (!token) return;

              const result = await removeAthleteFromTeam(athleteId, token);

              if (result.success) {
                setRosterMembers(rosterMembers.filter((m) => m.id !== athleteId));
                Alert.alert("Success", "Athlete removed from team");
              } else {
                Alert.alert("Error", result.error || "Failed to remove athlete from team");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while removing athlete");
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(athleteId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FCA311" />
      </SafeAreaView>
    );
  }

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
        <Text className="text-white-100 text-2xl font-Oswald-Bold">MANAGE ROSTER</Text>
      </View>

      {/* Team Info */}
      <View className="px-5 mt-4">
        <View
          className="bg-[#1A1A1A] rounded-2xl p-5"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Text className="text-white-100 font-Oswald-Bold text-2xl mb-2">
            {team?.name || teamName}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-400 font-Outfit-Regular text-lg">
              {rosterMembers.length} / {team?.capacity || 0} players
            </Text>
            {isFull && (
              <View className="ml-3 bg-red-900/30 px-3 py-1.5 rounded-full">
                <Text className="text-red-400 font-Outfit-Medium text-base">Full</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Add Athletes Section */}
        <View
          className="bg-[#1A1A1A] rounded-2xl p-5 mb-6"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Text className="text-gold-100 font-Oswald-Bold text-lg mb-4">
            ADD ATHLETES
          </Text>

          {/* Search Input */}
          <View className="bg-[#0C0B0B] rounded-xl flex-row items-center px-4 py-3.5 mb-4">
            <Ionicons name="search" size={22} color="#FCA311" />
            <TextInput
              className="flex-1 text-white-100 font-Outfit-Regular text-lg ml-3"
              placeholder="Search by name or email..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={22} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Available Athletes List - Using FlatList for performance */}
          {availableAthletes.length > 0 ? (
            <View style={{ maxHeight: 256 }}>
              <FlatList
                data={availableAthletes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AvailableAthleteItem
                    athlete={item}
                    onAdd={() => handleAddAthlete(item.id)}
                    isProcessing={processingIds.has(item.id)}
                    isFull={isFull}
                  />
                )}
                showsVerticalScrollIndicator={false}
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={5}
              />
            </View>
          ) : (
            <EmptyAthletesState hasSearch={!!searchQuery} />
          )}

          {isFull && (
            <View className="mt-4 bg-red-900/20 px-4 py-3.5 rounded-lg border border-red-900/30">
              <Text className="text-red-400 font-Outfit-Regular text-base">
                Team is at full capacity. Remove a player to add new ones.
              </Text>
            </View>
          )}
        </View>

        {/* Current Roster Section */}
        <View
          className="bg-[#1A1A1A] rounded-2xl p-5"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Text className="text-gold-100 font-Oswald-Bold text-lg mb-4">
            CURRENT ROSTER ({rosterMembers.length})
          </Text>

          {rosterMembers.length > 0 ? (
            rosterMembers.map((member, index) => (
              <RosterMemberItem
                key={member.id}
                member={member}
                onRemove={() => handleRemoveAthlete(member.id!)}
                isProcessing={processingIds.has(member.id!)}
                isLast={index === rosterMembers.length - 1}
              />
            ))
          ) : (
            <EmptyRosterState />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

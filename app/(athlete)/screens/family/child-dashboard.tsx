import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import type { Child } from "@/types/family";
import { useAuth } from "@/utils/auth";
import { getChild, getChildSchedule, adminRemoveLink } from "@/utils/api/family";
import dayjs from "dayjs";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const BackgroundBlobs = () => (
  <View className="absolute inset-0" pointerEvents="none">
    <View
      style={{
        position: "absolute",
        top: -80,
        left: -60,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: "#FCA311",
        opacity: 0.08,
      }}
    />
    <View
      style={{
        position: "absolute",
        top: SCREEN_H * 0.35,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "#FCA311",
        opacity: 0.06,
      }}
    />
    <View
      style={{
        position: "absolute",
        bottom: 60,
        left: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "#FCA311",
        opacity: 0.05,
      }}
    />
  </View>
);

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "event" | "match" | "practice";
  location: string;
}

const typeConfig = {
  event: { icon: "calendar-day", color: "#FCA311", label: "Event" },
  match: { icon: "star", color: "#4CAF50", label: "Match" },
  practice: { icon: "users", color: "#2196F3", label: "Practice" },
} as const;

const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View
    className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]/50 items-center justify-center p-3"
    style={{ width: 140, height: 140 }}
  >
    <View className="flex-row items-center mb-2">
      <FontAwesome6 name={icon} size={14} color="#FCA311" />
      <Text className="text-gray-400 text-[11px] font-Outfit-SemiBold ml-2" numberOfLines={1}>
        {label}
      </Text>
    </View>
    <Text className="text-white-100 text-sm font-Outfit-SemiBold text-center">
      {value || "N/A"}
    </Text>
  </View>
);

const ChildDashboard = () => {
  const router = useRouter();
  const { getValidToken } = useAuth();
  const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const processScheduleData = (data: any): ScheduleItem[] => {
    const processed: ScheduleItem[] = [];

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((event: any) => {
        let date = event.date;
        if (!date && event.start_at) {
          date = event.start_at.includes("T")
            ? event.start_at.split("T")[0]
            : event.start_at.split(" ")[0];
        }
        if (!date) return;

        let time = "TBD";
        if (event.start_at) {
          try {
            const d = new Date(event.start_at);
            if (!isNaN(d.getTime())) {
              time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            }
          } catch {
            time = "TBD";
          }
        }

        processed.push({
          id: event.id,
          title: event.program?.name || event.name || event.title || "Event",
          date,
          time,
          type: "event",
          location:
            (typeof event.location === "object"
              ? event.location?.name || event.location?.address
              : event.location) || "TBD",
        });
      });
    }

    if (data.games && Array.isArray(data.games)) {
      data.games.forEach((game: any) => {
        processed.push({
          id: game.id,
          title: `${game.home_team_name || "Home"} vs ${game.away_team_name || "Away"}`,
          date: game.start_time ? game.start_time.split("T")[0] : new Date().toISOString().split("T")[0],
          time: game.start_time
            ? new Date(game.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : "TBD",
          type: "match",
          location: game.location_name || "TBD",
        });
      });
    }

    if (data.practices && Array.isArray(data.practices)) {
      data.practices.forEach((practice: any) => {
        processed.push({
          id: practice.id,
          title: `${practice.team_name || "Team"} Practice`,
          date: practice.start_time ? practice.start_time.split("T")[0] : new Date().toISOString().split("T")[0],
          time: practice.start_time
            ? new Date(practice.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : "TBD",
          type: "practice",
          location: practice.location_name || "TBD",
        });
      });
    }

    return processed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const fetchSchedule = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token || !childId) return;
      const data = await getChildSchedule(token, childId);
      setScheduleItems(processScheduleData(data));
    } catch {
      // silently fail
    } finally {
      setScheduleLoading(false);
    }
  }, [getValidToken, childId]);

  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getValidToken();
        if (!token) {
          setError("Authentication failed");
          return;
        }
        const data = await getChild(token, childId);
        setChild(data);
      } catch (err: any) {
        console.error("Failed to fetch child profile:", err);
        setError("Failed to load child profile");
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
    fetchSchedule();
  }, [childId]);

  const handleUnlink = () => {
    Alert.alert(
      "Unlink Child",
      `Are you sure you want to unlink ${child?.first_name} ${child?.last_name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            if (!child) return;

            setUnlinking(true);
            try {
              const token = await getValidToken();
              if (!token) {
                Alert.alert("Error", "Authentication failed. Please try again.");
                return;
              }

              await adminRemoveLink(token, child.id);
              Alert.alert("Success", "Child unlinked successfully");
              router.back();
            } catch (error: any) {
              console.error("Failed to unlink child:", error);
              Alert.alert("Error", "Failed to unlink child. Please try again.");
            } finally {
              setUnlinking(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="small" color="#FCA311" />
      </SafeAreaView>
    );
  }

  if (error || !child) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center px-6">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <FontAwesome6 name="circle-exclamation" size={32} color="#EF4444" />
        <Text className="text-white-100 text-base font-Outfit-Medium mt-3 text-center">
          {error || "Child profile not found"}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 py-2 px-4">
          <Text className="text-[#FCA311] text-sm font-Outfit-SemiBold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const upcomingItems = scheduleItems.filter((item) => {
    return dayjs(item.date).startOf("day").isSame(dayjs().startOf("day")) ||
      dayjs(item.date).isAfter(dayjs().startOf("day"));
  }).slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <BackgroundBlobs />

      {/* Header */}
      <View className="flex-row items-center px-5 py-3 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 py-2"
          activeOpacity={0.6}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white-100 text-lg font-Outfit-SemiBold">Child Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center mb-6">
          {child.photo_url ? (
            <Image
              source={{ uri: child.photo_url }}
              className="w-20 h-20 rounded-full mb-3"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-[#FCA311] items-center justify-center mb-3">
              <Text className="text-black text-2xl font-Outfit-Bold">
                {child.first_name?.charAt(0)?.toUpperCase()}
                {child.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white-100 text-xl font-Outfit-Bold">
            {child.first_name} {child.last_name}
          </Text>
          <Text className="text-gray-400 text-sm font-Outfit-Regular mt-1">
            Athlete
          </Text>
        </View>

        {/* Info Grid 2x2 */}
        <View className="mb-6 items-center">
          <View className="flex-row gap-3 mb-3">
            <InfoCard
              icon="cake-candles"
              label="Birthday"
              value={formatDate(child.dob)}
            />
            <InfoCard
              icon="earth-americas"
              label="Country"
              value={child.country_code ? `${getCountryFlag(child.country_code)} ${child.country_code}` : "N/A"}
            />
          </View>
          <View className="flex-row gap-3">
            <InfoCard
              icon="shield-halved"
              label="Team"
              value={child.team_name || "None"}
            />
            <InfoCard
              icon="envelope"
              label="Email"
              value={child.email || "N/A"}
            />
          </View>
        </View>

        {/* Upcoming Schedule */}
        <View className="mb-6 self-center" style={{ width: 292 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white-100 text-base font-Outfit-SemiBold">
              Upcoming Sessions
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/(athlete)/screens/family/child-schedule",
                  params: { childId: child.id, childName: `${child.first_name} ${child.last_name}` },
                })
              }
            >
              <Text className="text-[#FCA311] text-xs font-Outfit-SemiBold">View All</Text>
            </TouchableOpacity>
          </View>

          {scheduleLoading ? (
            <View className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]/50 items-center">
              <ActivityIndicator size="small" color="#FCA311" />
            </View>
          ) : upcomingItems.length > 0 ? (
            <View className="gap-2">
              {upcomingItems.map((item) => {
                const config = typeConfig[item.type] || typeConfig.event;
                const isToday = dayjs(item.date).startOf("day").isSame(dayjs().startOf("day"));

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      const detailPath =
                        item.type === "match"
                          ? `/screens/match-details/${item.id}`
                          : item.type === "practice"
                            ? `/screens/practice-details/${item.id}`
                            : `/screens/event-details/${item.id}`;
                      router.push(detailPath as any);
                    }}
                    className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]/50 flex-row items-center"
                  >
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Text className="text-[10px] font-Outfit-Bold text-gray-400">
                        {dayjs(item.date).format("MMM")}
                      </Text>
                      <Text className="text-sm font-Outfit-Bold text-white-100 -mt-0.5">
                        {dayjs(item.date).format("D")}
                      </Text>
                    </View>
                    <View className="flex-1 mr-2">
                      <Text className="text-white-100 text-sm font-Outfit-Medium" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text className="text-gray-400 text-xs font-Outfit-Regular mt-0.5">
                        {item.time} · {item.location}
                      </Text>
                    </View>
                    {isToday && (
                      <View className="bg-[#FCA311]/20 px-2 py-0.5 rounded-full">
                        <Text className="text-[#FCA311] text-[10px] font-Outfit-SemiBold">Today</Text>
                      </View>
                    )}
                    {!isToday && (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Text className="text-[10px] font-Outfit-Medium" style={{ color: config.color }}>
                          {config.label}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]/50 items-center">
              <FontAwesome6 name="calendar-xmark" size={20} color="#666" />
              <Text className="text-gray-400 text-sm font-Outfit-Regular mt-2">
                No upcoming sessions
              </Text>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleUnlink}
            disabled={unlinking}
            className="bg-red-500/10 rounded-xl p-4 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            {unlinking ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <FontAwesome6 name="link-slash" size={14} color="#EF4444" />
                <Text className="text-red-400 text-sm font-Outfit-SemiBold ml-2">
                  Unlink Child
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChildDashboard;

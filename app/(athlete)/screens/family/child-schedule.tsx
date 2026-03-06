import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import { getChildSchedule } from "@/utils/api/family";
import dayjs from "dayjs";

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

const ChildSchedule = () => {
  const router = useRouter();
  const { getValidToken } = useAuth();
  const { childId, childName } = useLocalSearchParams<{
    childId: string;
    childName: string;
  }>();

  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Upcoming");
  const hasFetchedRef = useRef(false);

  const processScheduleData = (data: any): ScheduleItem[] => {
    const processed: ScheduleItem[] = [];

    // Process events
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
              time = d.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
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

    // Process games/matches
    if (data.games && Array.isArray(data.games)) {
      data.games.forEach((game: any) => {
        const title = `${game.home_team_name || "Home"} vs ${game.away_team_name || "Away"}`;
        processed.push({
          id: game.id,
          title,
          date: game.start_time
            ? game.start_time.split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: game.start_time
            ? new Date(game.start_time).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "TBD",
          type: "match",
          location: game.location_name || "TBD",
        });
      });
    }

    // Process practices
    if (data.practices && Array.isArray(data.practices)) {
      data.practices.forEach((practice: any) => {
        processed.push({
          id: practice.id,
          title: `${practice.team_name || "Team"} Practice`,
          date: practice.start_time
            ? practice.start_time.split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: practice.start_time
            ? new Date(practice.start_time).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "TBD",
          type: "practice",
          location: practice.location_name || "TBD",
        });
      });
    }

    return processed.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const fetchSchedule = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token || !childId) return;
      const data = await getChildSchedule(token, childId);
      setItems(processScheduleData(data));
    } catch {
      // silently fail
    }
  }, [getValidToken, childId]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSchedule().finally(() => setLoading(false));
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule().finally(() => setRefreshing(false));
  };

  const getStatus = (date: string) => {
    const eventDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    if (eventDate.isBefore(today)) return "Past";
    if (eventDate.isSame(today)) return "Today";
    return "Upcoming";
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "All") return true;
    return getStatus(item.date) === activeFilter;
  });

  const renderItem = ({ item }: { item: ScheduleItem }) => {
    const config = typeConfig[item.type] || typeConfig.event;
    const status = getStatus(item.date);
    const isPast = status === "Past";

    const detailPath =
      item.type === "match"
        ? `/screens/match-details/${item.id}`
        : item.type === "practice"
          ? `/screens/practice-details/${item.id}`
          : `/screens/event-details/${item.id}`;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(detailPath as any)}
        className={`bg-[#1A1A1A] rounded-xl p-4 mb-3 border border-[#2A2A2A]/50 ${isPast ? "opacity-50" : ""}`}
      >
        <View className="flex-row items-start">
          {/* Type icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <FontAwesome6 name={config.icon} size={14} color={config.color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-white-100 text-sm font-Outfit-SemiBold flex-1 mr-2"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Text
                  className="text-xs font-Outfit-Medium"
                  style={{ color: config.color }}
                >
                  {config.label}
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <View className="flex-row items-center mb-1">
              <FontAwesome6 name="calendar" size={10} color="#888" />
              <Text className="text-gray-400 text-xs font-Outfit-Regular ml-1.5">
                {dayjs(item.date).format("ddd, MMM D, YYYY")}
              </Text>
              <Text className="text-gray-600 text-xs mx-1.5">|</Text>
              <FontAwesome6 name="clock" size={10} color="#888" />
              <Text className="text-gray-400 text-xs font-Outfit-Regular ml-1.5">
                {item.time}
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-center">
              <FontAwesome6 name="location-dot" size={10} color="#888" />
              <Text
                className="text-gray-400 text-xs font-Outfit-Regular ml-1.5"
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filters = ["Upcoming", "Today", "Past", "All"];

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-3 mb-1">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 py-2"
          activeOpacity={0.6}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFF" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white-100 text-lg font-Outfit-SemiBold">
            Schedule
          </Text>
          <Text className="text-gray-400 text-xs font-Outfit-Regular">
            {childName}
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <View className="flex-row px-5 pb-3">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full mr-2 ${
              activeFilter === filter ? "bg-[#FCA311]/20" : "bg-[#1A1A1A]"
            }`}
          >
            <Text
              className={`text-xs font-Outfit-Medium ${
                activeFilter === filter ? "text-[#FCA311]" : "text-gray-400"
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#FCA311" />
          <Text className="text-gray-400 text-sm font-Outfit-Regular mt-3">
            Loading schedule...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <View className="w-16 h-16 rounded-full bg-[#1A1A1A] items-center justify-center mb-4">
                <FontAwesome6
                  name="calendar-day"
                  size={24}
                  color="#666"
                />
              </View>
              <Text className="text-white-100 text-base font-Outfit-SemiBold mb-1">
                No sessions found
              </Text>
              <Text className="text-gray-400 text-sm font-Outfit-Regular text-center px-8">
                {activeFilter === "All"
                  ? `${childName} doesn't have any scheduled sessions yet`
                  : `No ${activeFilter.toLowerCase()} sessions for ${childName}`}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChildSchedule;

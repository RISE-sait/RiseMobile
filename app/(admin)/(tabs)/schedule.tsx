import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/utils/auth";
import {
  getTodaySchedule,
  type TodaySchedule,
  type ScheduleEvent,
  type ScheduleGame,
  type SchedulePractice,
} from "@/utils/api/admin";
import SharedCalendar from "@/components/shared/SharedCalendar";

// Tab Button - Memoized to prevent unnecessary re-renders
const TabButton = memo(({
  title,
  isActive,
  count,
  onPress,
}: {
  title: string;
  isActive: boolean;
  count: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 py-2.5 items-center rounded-xl"
    style={{
      backgroundColor: isActive ? "#FCA311" : "#1A1A1A",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center">
      <Text
        className={`font-Oswald-Medium text-sm ${isActive ? "text-black-100" : "text-gray-400"}`}
      >
        {title}
      </Text>
      {count > 0 && (
        <View
          className="ml-1.5 px-1.5 py-0.5 rounded-full min-w-[20px] items-center"
          style={{ backgroundColor: isActive ? "#000" : "#FCA311" }}
        >
          <Text
            className="text-xs font-Oswald-Bold"
            style={{ color: isActive ? "#FCA311" : "#000" }}
          >
            {count}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
));

// Event Card - Memoized to prevent unnecessary re-renders
const EventCard = memo(({ event, onPress }: { event: ScheduleEvent; onPress: () => void }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!event.start_at || !event.end_at) {
      return event.start_at ? formatDate(event.start_at) : "Date TBD";
    }

    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);

    // Check if same day
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
    ) {
      return formatDate(event.start_at);
    }

    // Multi-day event - show range
    const startFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFormatted = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-4">
      <LinearGradient
        colors={["rgba(252,163,17,0.15)", "rgba(252,163,17,0.03)"]}
        className="shadow-lg shadow-black overflow-hidden"
        style={[
          {
            padding: 20,
            borderRadius: 24,
          },
          Platform.select({
            ios: {
              paddingVertical: 20,
              borderRadius: 30,
              marginTop: 5,
            },
            android: {
              paddingVertical: 20,
              borderRadius: 24,
            },
          }),
        ]}
      >
        {/* Header - Program Name and Icon */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-gold-100 uppercase font-Oswald-Bold tracking-wide text-base">
              {event.program?.name || "EVENT"}
            </Text>
            <Text className="text-white-100 font-Oswald-Medium text-lg mt-1" numberOfLines={2}>
              {event.program?.name ? event.title : event.title}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-xl bg-gold-100/20 items-center justify-center ml-3">
            <FontAwesome6 name="calendar-day" size={20} color="#FCA311" />
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <Text className="text-gray-400 font-Outfit-Regular text-sm mb-3" numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {/* Date, Time and Location */}
        <View className="flex-row items-center flex-wrap gap-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-gold-100/10 items-center justify-center mr-2">
              <FontAwesome6 name="calendar" size={14} color="#FCA311" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-sm">
              {formatDateRange()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-gold-100/10 items-center justify-center mr-2">
              <FontAwesome6 name="clock" size={14} color="#FCA311" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-sm">
              {formatTime(event.start_at)} - {formatTime(event.end_at)}
            </Text>
          </View>
          {event.location?.name && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-gold-100/10 items-center justify-center mr-2">
                <FontAwesome6 name="location-dot" size={14} color="#FCA311" />
              </View>
              <Text className="text-white-100 font-Outfit-Medium text-sm">
                {event.location.name}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Game Card - Memoized to prevent unnecessary re-renders
const GameCard = memo(({ game, onPress }: { game: ScheduleGame; onPress: () => void }) => {
  const formatTime = (dateString: string) => {
    if (!dateString) return "Time TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get team names - handle both nested object and flat structure
  const homeTeamName = game.home_team?.name || (game as any).home_team_name || "TBD";
  const awayTeamName = game.away_team?.name || (game as any).away_team_name || "TBD";
  const matchup = `${homeTeamName} vs ${awayTeamName}`;

  // Handle different date field names (start_at or start_time)
  const startDateTime = game.start_at || (game as any).start_time;
  const endDateTime = game.end_at || (game as any).end_time;

  // Handle location - both nested object and flat structure
  const locationName = game.location?.name || (game as any).location_name;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-4">
      <LinearGradient
        colors={["rgba(76,175,80,0.15)", "rgba(76,175,80,0.03)"]}
        className="shadow-lg shadow-black overflow-hidden"
        style={[
          {
            padding: 20,
            borderRadius: 24,
          },
          Platform.select({
            ios: {
              paddingVertical: 20,
              borderRadius: 30,
              marginTop: 5,
            },
            android: {
              paddingVertical: 20,
              borderRadius: 24,
            },
          }),
        ]}
      >
        {/* Header - Game Type and Icon */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="uppercase font-Oswald-Bold tracking-wide text-base" style={{ color: "#4CAF50" }}>
              GAME
            </Text>
            <Text className="font-Oswald-Medium text-lg mt-1" numberOfLines={2} style={{ color: "#FFFFFF" }}>
              {game.title || matchup}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-xl bg-green-900/30 items-center justify-center ml-3">
            <FontAwesome6 name="trophy" size={20} color="#4CAF50" />
          </View>
        </View>

        {/* Teams - only show if not already in title */}
        {!game.title && (homeTeamName !== "TBD" || awayTeamName !== "TBD") && (
          <Text className="font-Outfit-Regular text-base mb-3" style={{ color: "#9CA3AF" }}>
            {matchup}
          </Text>
        )}

        {/* Date, Time and Location */}
        <View className="flex-row items-center flex-wrap gap-4">
          {startDateTime && (
            <>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-green-900/20 items-center justify-center mr-2">
                  <FontAwesome6 name="calendar" size={14} color="#4CAF50" />
                </View>
                <Text className="font-Outfit-Medium text-sm" style={{ color: "#FFFFFF" }}>
                  {formatDate(startDateTime)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-green-900/20 items-center justify-center mr-2">
                  <FontAwesome6 name="clock" size={14} color="#4CAF50" />
                </View>
                <Text className="font-Outfit-Medium text-sm" style={{ color: "#FFFFFF" }}>
                  {endDateTime ? `${formatTime(startDateTime)} - ${formatTime(endDateTime)}` : formatTime(startDateTime)}
                </Text>
              </View>
            </>
          )}
          {locationName && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-green-900/20 items-center justify-center mr-2">
                <FontAwesome6 name="location-dot" size={14} color="#4CAF50" />
              </View>
              <Text className="font-Outfit-Medium text-sm" style={{ color: "#FFFFFF" }}>
                {locationName}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Practice Card - Memoized to prevent unnecessary re-renders
const PracticeCard = memo(({ practice, onPress }: { practice: SchedulePractice; onPress: () => void }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const startTime = practice.start_at || practice.start_time || "";
  const endTime = practice.end_at || (practice as any).end_time || "";
  const teamName = practice.team?.name || practice.team_name;
  const locationName = practice.location?.name || practice.location_name;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-4">
      <LinearGradient
        colors={["rgba(33,150,243,0.15)", "rgba(33,150,243,0.03)"]}
        className="shadow-lg shadow-black overflow-hidden"
        style={[
          {
            padding: 20,
            borderRadius: 24,
          },
          Platform.select({
            ios: {
              paddingVertical: 20,
              borderRadius: 30,
              marginTop: 5,
            },
            android: {
              paddingVertical: 20,
              borderRadius: 24,
            },
          }),
        ]}
      >
        {/* Header - Practice Type and Icon */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-blue-400 uppercase font-Oswald-Bold tracking-wide text-base">
              PRACTICE
            </Text>
            <Text className="text-white-100 font-Oswald-Medium text-lg mt-1" numberOfLines={2}>
              {practice.title || (teamName ? `${teamName} Practice` : "Team Practice")}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-xl bg-blue-900/30 items-center justify-center ml-3">
            <FontAwesome6 name="dumbbell" size={20} color="#2196F3" />
          </View>
        </View>

        {/* Team */}
        {teamName && (
          <Text className="text-gray-400 font-Outfit-Regular text-sm mb-3">
            {teamName}
          </Text>
        )}

        {/* Date, Time and Location */}
        <View className="flex-row items-center flex-wrap gap-4">
          {startTime && (
            <>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-blue-900/20 items-center justify-center mr-2">
                  <FontAwesome6 name="calendar" size={14} color="#2196F3" />
                </View>
                <Text className="text-white-100 font-Outfit-Medium text-sm">
                  {formatDate(startTime)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-blue-900/20 items-center justify-center mr-2">
                  <FontAwesome6 name="clock" size={14} color="#2196F3" />
                </View>
                <Text className="text-white-100 font-Outfit-Medium text-sm">
                  {endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : formatTime(startTime)}
                </Text>
              </View>
            </>
          )}
          {locationName && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-blue-900/20 items-center justify-center mr-2">
                <FontAwesome6 name="location-dot" size={14} color="#2196F3" />
              </View>
              <Text className="text-white-100 font-Outfit-Medium text-sm">
                {locationName}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Empty State - Memoized to prevent unnecessary re-renders
const EmptyState = memo(({ type }: { type: string }) => {
  const getIcon = () => {
    switch (type) {
      case "events":
        return "calendar-day";
      case "games":
        return "trophy";
      case "practices":
        return "dumbbell";
      default:
        return "calendar-xmark";
    }
  };

  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="bg-[#2A2A2A] p-4 rounded-full mb-4">
        <FontAwesome6 name={getIcon()} size={40} color="#FCA311" />
      </View>
      <Text className="text-white-100 font-Oswald-Medium text-lg">Nothing Scheduled</Text>
      <Text className="text-gray-400 font-Outfit-Regular text-center mt-2">
        No {type} scheduled for today
      </Text>
    </View>
  );
});

export default function ScheduleScreen() {
  const { getValidToken } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeTab, setActiveTab] = useState<"all" | "events" | "games" | "practices">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState<TodaySchedule>({
    events: [],
    games: [],
    practices: [],
  });

  const fetchSchedule = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const data = await getTodaySchedule(token);
      setSchedule(data || { events: [], games: [], practices: [] });
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [getValidToken]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, [fetchSchedule]);

  // Memoized counts to prevent recalculation on every render
  const { eventsCount, gamesCount, practicesCount, totalCount } = useMemo(() => {
    const events = schedule?.events?.length || 0;
    const games = schedule?.games?.length || 0;
    const practices = schedule?.practices?.length || 0;
    return {
      eventsCount: events,
      gamesCount: games,
      practicesCount: practices,
      totalCount: events + games + practices,
    };
  }, [schedule]);

  // Deduplicate helper function - defined once outside useMemo
  const deduplicateById = useCallback(<T extends { id: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }, []);

  // Memoized sorted and deduplicated events
  const sortedEvents = useMemo(() => {
    return deduplicateById([...(schedule?.events || [])]).sort(
      (a, b) => new Date(a.start_at || "").getTime() - new Date(b.start_at || "").getTime()
    );
  }, [schedule?.events, deduplicateById]);

  // Memoized sorted and deduplicated games
  const sortedGames = useMemo(() => {
    return deduplicateById([...(schedule?.games || [])]).sort((a, b) => {
      const aTime = new Date((a as any).start_time || a.start_at || "").getTime();
      const bTime = new Date((b as any).start_time || b.start_at || "").getTime();
      return aTime - bTime;
    });
  }, [schedule?.games, deduplicateById]);

  // Memoized sorted and deduplicated practices
  const sortedPractices = useMemo(() => {
    return deduplicateById([...(schedule?.practices || [])]).sort((a, b) => {
      const aTime = new Date(a.start_at || a.start_time || "").getTime();
      const bTime = new Date(b.start_at || b.start_time || "").getTime();
      return aTime - bTime;
    });
  }, [schedule?.practices, deduplicateById]);

  // Memoized combined and sorted items for "All" tab
  const allItems = useMemo(() => {
    return [
      ...sortedEvents.map((e) => ({
        type: "event" as const,
        data: e,
        time: new Date(e.start_at || "")
      })),
      ...sortedGames.map((g) => ({
        type: "game" as const,
        data: g,
        time: new Date((g as any).start_time || g.start_at || "")
      })),
      ...sortedPractices.map((p) => ({
        type: "practice" as const,
        data: p,
        time: new Date(p.start_at || p.start_time || "")
      })),
    ].sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [sortedEvents, sortedGames, sortedPractices]);

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        if (allItems.length === 0) {
          return <EmptyState type="events, games, or practices" />;
        }
        return allItems.map((item) => {
          if (item.type === "event") {
            return (
              <EventCard
                key={`event-${item.data.id}`}
                event={item.data as ScheduleEvent}
                onPress={() => router.push(`/screens/event-details/${item.data.id}`)}
              />
            );
          } else if (item.type === "game") {
            return (
              <GameCard
                key={`game-${item.data.id}`}
                game={item.data as ScheduleGame}
                onPress={() => router.push(`/screens/match-details/${item.data.id}`)}
              />
            );
          } else {
            return (
              <PracticeCard
                key={`practice-${item.data.id}`}
                practice={item.data as SchedulePractice}
                onPress={() => router.push(`/screens/practice-details/${item.data.id}`)}
              />
            );
          }
        });
      case "events":
        if (eventsCount === 0) return <EmptyState type="events" />;
        return sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => router.push(`/screens/event-details/${event.id}`)}
          />
        ));
      case "games":
        if (gamesCount === 0) return <EmptyState type="games" />;
        return sortedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => router.push(`/screens/match-details/${game.id}`)}
          />
        ));
      case "practices":
        if (practicesCount === 0) return <EmptyState type="practices" />;
        return sortedPractices.map((practice) => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            onPress={() => router.push(`/screens/practice-details/${practice.id}`)}
          />
        ));
    }
  };

  // Get today's date formatted
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header Section - Always visible */}
      <View className="w-full px-10 mt-10">
        <Text className="text-white-100 font-Oswald-Bold text-2xl">SCHEDULE</Text>
        <Text className="text-gray-400 font-Outfit-Regular text-sm mt-1">{dateString}</Text>

        {/* Stats Row - Only in list view */}
        {viewMode === "list" && (
          <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mt-3 p-4">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-gold-100 font-Oswald-Bold text-3xl">
                  {totalCount}
                </Text>
                <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Total</Text>
              </View>
              <View className="w-px bg-gray-700" />
              <View className="items-center flex-1">
                <Text className="text-gold-100 font-Oswald-Bold text-3xl">
                  {gamesCount}
                </Text>
                <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Games</Text>
              </View>
              <View className="w-px bg-gray-700" />
              <View className="items-center flex-1">
                <Text className="text-gold-100 font-Oswald-Bold text-3xl">
                  {practicesCount}
                </Text>
                <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Practices</Text>
              </View>
            </View>
          </View>
        )}

        {/* View Mode Toggle - Always visible */}
        <View className="flex-row gap-2 mt-4 bg-[#1A1A1A] rounded-xl p-1">
          <TouchableOpacity
            className="flex-1 py-2.5 items-center rounded-lg"
            style={{
              backgroundColor: viewMode === "list" ? "#FCA311" : "transparent",
            }}
            onPress={() => setViewMode("list")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <FontAwesome6
                name="list"
                size={16}
                color={viewMode === "list" ? "#000" : "#9CA3AF"}
              />
              <Text
                className={`font-Oswald-Medium text-sm ml-2 ${
                  viewMode === "list" ? "text-black-100" : "text-gray-400"
                }`}
              >
                List
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2.5 items-center rounded-lg"
            style={{
              backgroundColor: viewMode === "calendar" ? "#FCA311" : "transparent",
            }}
            onPress={() => setViewMode("calendar")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <FontAwesome6
                name="calendar"
                size={16}
                color={viewMode === "calendar" ? "#000" : "#9CA3AF"}
              />
              <Text
                className={`font-Oswald-Medium text-sm ml-2 ${
                  viewMode === "calendar" ? "text-black-100" : "text-gray-400"
                }`}
              >
                Calendar
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "list" ? (
        <>

          {/* Tabs */}
          <View className="w-full px-10 mt-6 flex-row gap-2">
        <TabButton
          title="All"
          isActive={activeTab === "all"}
          count={totalCount}
          onPress={() => setActiveTab("all")}
        />
        <TabButton
          title="Events"
          isActive={activeTab === "events"}
          count={eventsCount}
          onPress={() => setActiveTab("events")}
        />
        <TabButton
          title="Games"
          isActive={activeTab === "games"}
          count={gamesCount}
          onPress={() => setActiveTab("games")}
        />
        <TabButton
          title="Practices"
          isActive={activeTab === "practices"}
          count={practicesCount}
          onPress={() => setActiveTab("practices")}
        />
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FCA311" />
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-10 mt-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#FCA311"
                  colors={["#FCA311"]}
                />
              }
            >
              {renderContent()}
            </ScrollView>
          )}
        </>
      ) : (
        /* Calendar View */
        <View style={{ flex: 1 }}>
          <SharedCalendar userRole="admin" title="" embedded={true} />
        </View>
      )}
    </SafeAreaView>
  );
}

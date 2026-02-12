import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/utils/auth";
import {
  getDashboardStats,
  getTodaySchedule,
  type DashboardStats,
  type TodaySchedule,
} from "@/utils/api/admin";
import ProfileHeader from "@/components/profile/ProfileHeader";
import GoToCards, { type NavigationOption } from "@/components/GoToCards";

// Skeleton Loader Component with shimmer animation
const SkeletonLoader = memo(({ width, height, borderRadius = 8, style }: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#2A2A2A',
          opacity,
        },
        style,
      ]}
    />
  );
});

// Dashboard Skeleton - Shows while loading
const DashboardSkeleton = memo(() => (
  <ScrollView
    className="flex-1"
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    showsVerticalScrollIndicator={false}
  >
    {/* Profile Header Skeleton */}
    <View className="w-full px-5 mt-10">
      <View className="bg-[#1A1A1A] rounded-2xl p-4 flex-row items-center">
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View className="ml-4 flex-1">
          <SkeletonLoader width={150} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={100} height={14} />
        </View>
      </View>
    </View>

    {/* Stats Overview Skeleton */}
    <View className="w-full px-10 mt-10">
      <SkeletonLoader width={120} height={24} style={{ marginBottom: 12 }} />
      <View className="bg-[#1A1A1A] rounded-xl overflow-hidden p-4">
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <SkeletonLoader width={50} height={36} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={70} height={12} />
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <SkeletonLoader width={50} height={36} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={50} height={12} />
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <SkeletonLoader width={50} height={36} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={60} height={12} />
          </View>
        </View>
      </View>
    </View>

    {/* Today's Schedule Skeleton */}
    <View className="w-full px-10 mt-10">
      <SkeletonLoader width={180} height={24} style={{ marginBottom: 12 }} />
      <View className="bg-[#1A1A1A] rounded-xl overflow-hidden p-4">
        <View className="flex-row items-center">
          <SkeletonLoader width={56} height={56} borderRadius={12} />
          <View className="ml-4 flex-1">
            <SkeletonLoader width={60} height={12} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="80%" height={20} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={120} height={14} />
          </View>
        </View>
      </View>
    </View>

    {/* Navigation Cards Skeleton */}
    <View className="w-full px-10 mt-10">
      <SkeletonLoader width={140} height={24} style={{ marginBottom: 12 }} />
      <View className="flex-row flex-wrap justify-between">
        <SkeletonLoader width="48%" height={100} borderRadius={16} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="48%" height={100} borderRadius={16} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="48%" height={100} borderRadius={16} />
      </View>
    </View>
  </ScrollView>
));

// Today's Schedule Section - Matching UpcomingCard style
const TodayScheduleCard = ({ schedule, onPress }: { schedule: TodaySchedule; onPress: () => void }) => {
  // Get the next event
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Time TBD";
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper to check if a date is today
  const isToday = (dateString: string) => {
    if (!dateString) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Filter and map items to only include today's events
  const allItems = [
    ...schedule.events.filter((e) => e.start_at && isToday(e.start_at)).map((e) => ({
      type: "event" as const,
      title: e.program?.name || e.title,
      time: e.start_at,
      location: e.location?.name,
      subtitle: e.program?.name ? e.title : undefined
    })),
    ...schedule.games.filter((g) => g.start_at && isToday(g.start_at)).map((g) => ({
      type: "game" as const,
      title: g.title || `${g.home_team?.name || "Home"} vs ${g.away_team?.name || "Away"}`,
      time: g.start_at,
      location: g.location?.name,
      subtitle: g.home_team && g.away_team ? `${g.home_team.name} vs ${g.away_team.name}` : undefined
    })),
    ...schedule.practices.filter((p) => {
      const startTime = p.start_at || p.start_time;
      return startTime && isToday(startTime);
    }).map((p) => ({
      type: "practice" as const,
      title: p.title || (p.team_name ? `${p.team_name} Practice` : "Practice"),
      time: p.start_at || p.start_time!,
      location: p.location?.name || p.location_name,
      subtitle: p.team?.name || p.team_name
    })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const totalEvents = allItems.length;

  // If no events today, return early with empty state
  if (totalEvents === 0) {
    return (
      <View className="w-full px-10 mt-10">
        <Text className="text-white-100 font-Oswald-Bold text-2xl">TODAY'S SCHEDULE</Text>
        <View className="bg-[#444444] h-32 rounded-xl overflow-hidden mt-3 flex justify-center items-center relative">
          <View className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-60" />
          <View className="flex items-center justify-center space-y-2">
            <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
            <Text className="text-gray-400 font-Oswald-Medium text-lg text-center">
              No events scheduled
            </Text>
            <Text className="text-gray-500 font-Oswald-Regular text-sm text-center px-4">
              Check back later for today's activities
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const nextItem = allItems[0];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "game":
        return "trophy";
      case "practice":
        return "dumbbell";
      default:
        return "calendar-day";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "game":
        return "#4CAF50";
      case "practice":
        return "#2196F3";
      default:
        return "#FCA311";
    }
  };

  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">TODAY'S SCHEDULE</Text>
      <TouchableOpacity
        className="bg-[#1A1A1A] rounded-xl overflow-hidden mt-3 relative"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Event count badge */}
        <View className="absolute top-3 right-3 bg-gold-100 px-3 py-1 rounded-full z-10">
          <Text className="text-black-100 font-Oswald-Bold text-xs">{totalEvents} EVENT{totalEvents > 1 ? 'S' : ''}</Text>
        </View>

        {/* Next event info */}
        <View className="px-4 py-5">
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${getTypeColor(nextItem.type)}20` }}
            >
              <FontAwesome6
                name={getTypeIcon(nextItem.type)}
                size={24}
                color={getTypeColor(nextItem.type)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 font-Oswald-Medium text-xs uppercase">Up Next</Text>
              <Text className="text-white-100 font-Oswald-Bold text-xl" numberOfLines={1}>
                {nextItem.title}
              </Text>
              {nextItem.subtitle && (
                <Text className="text-gray-400 font-Outfit-Regular text-sm" numberOfLines={1}>
                  {nextItem.subtitle}
                </Text>
              )}
              <View className="flex-row items-center mt-1">
                <Text className="text-gold-100 font-Oswald-Medium text-sm">
                  {formatTime(nextItem.time)}
                </Text>
                {nextItem.location && (
                  <>
                    <Text className="text-gray-500 mx-2">•</Text>
                    <Text className="text-gray-400 font-Outfit-Regular text-sm" numberOfLines={1}>
                      {nextItem.location}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Show indicator if more events */}
        {totalEvents > 1 && (
          <View className="border-t border-gray-800 px-4 py-3 flex-row items-center justify-center">
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 font-Oswald-Medium text-xs ml-1">
              Tap to view all {totalEvents} events
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Stats Overview - Simple stats display
const StatsOverview = ({ stats }: { stats: DashboardStats }) => {
  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">OVERVIEW</Text>
      <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mt-3 p-4">
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-gold-100 font-Oswald-Bold text-3xl">
              {stats.totalCustomers}
            </Text>
            <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Customers</Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <Text className="text-gold-100 font-Oswald-Bold text-3xl">
              {stats.activeStaff}
            </Text>
            <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Staff</Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <Text className="text-gold-100 font-Oswald-Bold text-3xl">
              {stats.pendingStaff}
            </Text>
            <Text className="text-gray-400 font-Oswald-Medium text-xs mt-1">Pending</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const { getValidToken } = useAuth();
  const reduxUser = useAppSelector((state) => state.user.data);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    todayCheckIns: 0,
    activeStaff: 0,
    pendingStaff: 0,
  });
  const [schedule, setSchedule] = useState<TodaySchedule>({
    events: [],
    games: [],
    practices: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) {
        console.error("No valid token available");
        return;
      }

      const [statsData, scheduleData] = await Promise.all([
        getDashboardStats(token),
        getTodaySchedule(token),
      ]);

      setStats(statsData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [getValidToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Navigation options - matching GoToCards format used in athlete/coach home
  const navigationOptions: NavigationOption[] = [
    {
      label: "Manage",
      route: "/(admin)/(tabs)/manage",
      icon: "calendar",
      description: "Teams, games & practices",
      colors: ["#FCA311", "#C36A04"] as [string, string],
    },
    {
      label: "Customers",
      route: "/(admin)/(tabs)/customers",
      icon: "users",
      description: "View all customers",
      colors: ["#8E2DE2", "#4A00E0"] as [string, string],
    },
    {
      label: "My Events",
      route: "/(admin)/screens/my-events",
      icon: "calendar-day",
      description: "Events you're registered for",
      colors: ["#2C3E50", "#3498DB"] as [string, string],
    },
    {
      label: "Staff",
      route: "/(admin)/(tabs)/staff",
      icon: "user-tie",
      description: "Manage staff members",
      colors: ["#0F2027", "#2C5364"] as [string, string],
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FCA311"
            colors={["#FCA311"]}
          />
        }
      >
        {/* Profile Header - Using same component as athlete/coach */}
        <View className="w-full px-5 mt-10">
          {reduxUser ? (
            reduxUser.profileImage ? (
              <ProfileHeader
                firstName={reduxUser.firstName || ""}
                lastName={reduxUser.lastName || ""}
                role={reduxUser.role || "Admin"}
                profileImage={{ uri: reduxUser.profileImage }}
                countryCode={reduxUser.countryCode}
                onPress={() => router.push("/(admin)/screens/profile")}
              />
            ) : (
              <View className="bg-[#111111] border border-[#222222] rounded-2xl p-4">
                <Text className="text-white-100 font-Oswald-Bold text-lg">
                  Welcome, {reduxUser.firstName}!
                </Text>
                <Text className="text-[#cccccc] text-sm mt-2">
                  Add a profile photo to personalize your account.
                </Text>
                <TouchableOpacity
                  className="mt-3 px-4 py-2 rounded-lg bg-[#FCA311]"
                  onPress={() => router.push("/(admin)/screens/profile")}
                  activeOpacity={0.85}
                >
                  <Text className="text-black-100 font-semibold text-sm">Upload photo</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <Text className="text-white-100 text-center">User data not available</Text>
          )}
        </View>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Today's Schedule - Similar to UpcomingCard */}
        <TodayScheduleCard
          schedule={schedule}
          onPress={() => router.push("/(admin)/(tabs)/schedule")}
        />

        {/* Navigation Cards - Using GoToCards component */}
        <GoToCards
          options={navigationOptions}
          handleNavigate={(route) => router.push(route as any)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

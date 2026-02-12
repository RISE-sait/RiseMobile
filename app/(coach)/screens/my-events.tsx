import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, RefreshControl, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import images from "@/constants/images";
import { resolveImageSource } from "@/utils/imageSource";
import axios from "axios";
import { API_URL } from "@/utils/api";

interface MyEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  program?: {
    id: string;
    name?: string;
    type?: string;
    photo_url?: string;
    description?: string;
  };
}

const MyEventsScreen: React.FC = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.data);
  const hasFetchedRef = useRef(false);

  const getToken = useCallback(async () => {
    let token = user?.token;
    if (!token) {
      const userString = await AsyncStorage.getItem("user");
      if (userString) token = JSON.parse(userString).token;
    }
    return token;
  }, [user?.token]);

  const fetchMyEvents = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/secure/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { events: rawEvents } = response.data;
      const processedEvents: MyEvent[] = [];

      if (rawEvents && Array.isArray(rawEvents)) {
        rawEvents.forEach((event: any) => {
          let eventDate = event.date;
          if (!eventDate && event.start_at) {
            if (event.start_at.includes('T')) {
              eventDate = event.start_at.split('T')[0];
            } else {
              eventDate = event.start_at.split(' ')[0];
            }
          }

          const parsedDate = dayjs(eventDate);
          if (!parsedDate.isValid()) {
            return;
          }

          let formattedTime = "TBD";
          if (event.start_at) {
            try {
              const date = new Date(event.start_at);
              if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              }
            } catch (e) {
              formattedTime = "TBD";
            }
          }

          processedEvents.push({
            id: event.id,
            title: event.program?.name || event.name || event.title || "Event",
            date: parsedDate.format("YYYY-MM-DD"),
            time: formattedTime,
            location: (typeof event.location === 'object'
              ? event.location?.name || event.location?.address
              : event.location) || "TBD",
            image: event.program?.photo_url || "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            description: event.program?.description || event.description || "",
            program: event.program,
          });
        });
      }

      const sortedEvents = processedEvents.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setEvents(sortedEvents);
    } catch (error: any) {
      console.error("Error fetching my events:", error);
    }
  }, [getToken]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);
    fetchMyEvents().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    filterEvents(activeFilter, selectedMonth);
  }, [events, activeFilter, selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyEvents().finally(() => setRefreshing(false));
  };

  const getEventStatus = (date: string) => {
    const eventDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");

    if (eventDate.isBefore(today)) return "Past";
    if (eventDate.isSame(today)) return "Today";
    return "Upcoming";
  };

  const filterEvents = (filter: string, month: dayjs.Dayjs) => {
    let filtered = events;

    const monthStart = month.startOf("month");
    const monthEnd = month.endOf("month");
    filtered = events.filter(event => {
      const eventDate = dayjs(event.date);
      return eventDate.isAfter(monthStart.subtract(1, "day")) && eventDate.isBefore(monthEnd.add(1, "day"));
    });

    if (filter === "All") {
      filtered = filtered.filter(event => getEventStatus(event.date) !== "Past");
    } else {
      filtered = filtered.filter(event => getEventStatus(event.date) === filter);
    }

    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (filter === "Past") {
        return dateB.getTime() - dateA.getTime();
      }
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredEvents(sortedFiltered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "#FCA311";
      case "Today": return "#4CAF50";
      case "Past": return "#9E9E9E";
      default: return "#FCA311";
    }
  };

  const renderEventItem = ({ item }: { item: MyEvent }) => {
    const status = getEventStatus(item.date);
    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.9}
        onPress={() => {
          router.push({
            pathname: "/screens/event-details/[id]",
            params: { id: item.id, source: "my-events" },
          });
        }}
      >
        <Image
          source={resolveImageSource(item.image || item.program?.photo_url, images.event)}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.eventDetails}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
          </View>
          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#FCA311" style={styles.infoIcon} />
              <Text style={styles.infoText}>{dayjs(item.date).format("MMM D, YYYY")}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#FCA311" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#FCA311" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMonthSelector = () => {
    const canGoBack = selectedMonth.isAfter(dayjs().subtract(3, "month"), "month");
    const canGoForward = selectedMonth.isBefore(dayjs().add(6, "months"), "month");

    return (
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          style={[styles.monthArrow, !canGoBack && styles.monthArrowDisabled]}
          onPress={() => canGoBack && setSelectedMonth(selectedMonth.subtract(1, "month"))}
          disabled={!canGoBack}
        >
          <Ionicons name="chevron-back" size={24} color={canGoBack ? "#FCA311" : "#444"} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{selectedMonth.format("MMMM YYYY")}</Text>
        <TouchableOpacity
          style={[styles.monthArrow, !canGoForward && styles.monthArrowDisabled]}
          onPress={() => canGoForward && setSelectedMonth(selectedMonth.add(1, "month"))}
          disabled={!canGoForward}
        >
          <Ionicons name="chevron-forward" size={24} color={canGoForward ? "#FCA311" : "#444"} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterChips = () => {
    const filters = ["All", "Upcoming", "Today", "Past"];
    return (
      <View style={styles.filtersContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === filter && styles.activeFilterChipText
            ]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={50} color="#FCA311" />
      <Text style={styles.emptyText}>No registered events</Text>
      <Text style={styles.emptySubtext}>
        {activeFilter !== "All"
          ? `You have no ${activeFilter.toLowerCase()} events in ${selectedMonth.format("MMMM YYYY")}`
          : `You haven't registered for any events yet`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            const canGoBack = router.canGoBack?.() ?? false;
            if (canGoBack) {
              router.back();
            } else {
              router.replace("/(coach)/(tabs)/coachHome");
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#F0F0F0" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>Events you're registered for</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      {renderMonthSelector()}
      {renderFilterChips()}

      {!loading && events.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.countText}>
            Showing {filteredEvents.length} of {events.length} registered events
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FCA311" />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0C0B0B" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 12, color: "#999", marginTop: 2 },
  monthSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  monthArrow: { padding: 8 },
  monthArrowDisabled: { opacity: 0.5 },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginHorizontal: 20,
    minWidth: 150,
    textAlign: "center",
  },
  filtersContainer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 15 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    marginRight: 10,
  },
  activeFilterChip: { backgroundColor: "rgba(252, 163, 17, 0.2)" },
  filterChipText: { color: "#999", fontWeight: "500", fontSize: 14 },
  activeFilterChipText: { color: "#FCA311", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#999", marginTop: 12, fontSize: 16 },
  listContent: { padding: 20, paddingTop: 5, paddingBottom: 100 },
  eventCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: { width: "100%", height: 160 },
  eventDetails: { padding: 16 },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold" },
  eventInfo: { marginTop: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoIcon: { marginRight: 8 },
  infoText: { color: "#999", fontSize: 14 },
  infoContainer: { paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#222" },
  countText: { color: "#999", fontSize: 12, textAlign: "center" },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40, marginTop: 40 },
  emptyText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", marginTop: 16 },
  emptySubtext: { color: "#999", fontSize: 14, textAlign: "center", marginTop: 8, marginBottom: 24 },
});

export default MyEventsScreen;

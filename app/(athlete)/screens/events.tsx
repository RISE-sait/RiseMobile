import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, RefreshControl, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "@/store/slices/eventsSlice";
import type { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import images from "@/constants/images";
import { resolveImageSource } from "@/utils/imageSource";
import Constants from "expo-constants";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  type: "game" | "match" | "practice" | "course" | "other";
  program?: { 
    id: string;
    photo_url?: string;
  };
}


const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.data);
  const reduxEvents = useSelector((state: RootState) => state.events);

  const getToken = useCallback(async () => {
    let token = user?.token;
    if (!token) {
      const userString = await AsyncStorage.getItem("user");
      if (userString) token = JSON.parse(userString).token;
    }
    return token;
  }, [user?.token]);

  const fetchData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    dispatch(fetchEvents(token) as any);
  }, [dispatch, getToken]);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  }, [fetchData]);

  useEffect(() => {
    const allEvents: Event[] = [];
    const seenEventIds = new Set<string>();

    // Convert Redux events
    // All items from the events API are "events" - they should navigate to event-details
    Object.values(reduxEvents.byDate).forEach((eventGroup: any[]) => {
      eventGroup.forEach((event) => {
        // ✅ Validate event ID exists and is unique
        if (event.id && !seenEventIds.has(event.id)) {
          // ✅ Validate date before adding to prevent "Invalid Date"
          const eventDate = dayjs(event.date);
          if (eventDate.isValid()) {
            seenEventIds.add(event.id);
            allEvents.push({
              id: event.id,
              title: event.title || "Untitled Event",
              date: eventDate.format("YYYY-MM-DD"),
              time: event.time || "TBD",
              location: event.location || "TBD",
              image: event.program?.photo_url || "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
              // Always use "other" for events from the events API - they should go to event-details
              // The visual "type" from the slice is just for display, not navigation
              type: "other",
              program: event.program?.id ? {
                id: event.program.id,
                photo_url: event.program.photo_url
              } : undefined,
            });
          } else {
            console.warn(`⚠️ Invalid date for event ${event.id}: ${event.date}`);
          }
        } else if (!event.id) {
          console.warn(`⚠️ Event missing ID, skipping:`, event);
        }
      });
    });


    // Note: Matches are NOT included here - they are viewed from the Matches tab
    // This Events screen only shows events from the events API

    // Sort events chronologically (earliest date first)
    const sortedEvents = allEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Limit to 100 most recent/upcoming events for performance
    const limitedEvents = sortedEvents.slice(0, 100);

    setEvents(limitedEvents);
  }, [reduxEvents.byDate]);

  useEffect(() => {
    filterEvents(activeFilter, selectedMonth);
  }, [events, activeFilter, selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const filterEvents = (filter: string, month: dayjs.Dayjs) => {
    let filtered = events;

    // First filter by month
    const monthStart = month.startOf("month");
    const monthEnd = month.endOf("month");
    filtered = events.filter(event => {
      const eventDate = dayjs(event.date);
      return eventDate.isAfter(monthStart.subtract(1, "day")) && eventDate.isBefore(monthEnd.add(1, "day"));
    });

    // Then apply status filter
    if (filter === "All") {
      // "All" shows only today and future events (no past events) for the selected month
      filtered = filtered.filter(event => getEventStatus(event.date) !== "Past");
    } else {
      // Map UI filter labels to status values
      const statusMapping: Record<string, string> = {
        "Upcoming": "Upcoming",
        "Today": "Today",
        "Past": "Past"
      };
      const backendStatus = statusMapping[filter] || filter;
      filtered = filtered.filter(event => getEventStatus(event.date) === backendStatus);
    }

    // Sort chronologically (earliest date first for upcoming, most recent first for past)
    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (filter === "Past") {
        // For past events, show most recent first
        return dateB.getTime() - dateA.getTime();
      }
      // For upcoming/all, show earliest first
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredEvents(sortedFiltered);
  };

  const getEventStatus = (date: string) => {
    const eventDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");

    if (eventDate.isBefore(today)) return "Past";
    if (eventDate.isSame(today)) return "Today";
    return "Upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "#FCA311";
      case "Today": return "#4CAF50";
      case "Past": return "#9E9E9E";
      default: return "#FCA311";
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const status = getEventStatus(item.date);
    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.9}
        onPress={() => {
          // All events from this screen go to event-details
          // (Matches are viewed from the Matches tab, not here)
          router.push({
            pathname: "/screens/event-details/[id]",
            params: {
              id: item.id,
              source: "homepage",
            },
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
              <Text style={styles.infoText}>{item.date}</Text>
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
    const canGoBack = selectedMonth.isAfter(dayjs().subtract(1, "month"), "month");
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
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>
        {activeFilter !== "All"
          ? `There are no ${activeFilter.toLowerCase()} events in ${selectedMonth.format("MMMM YYYY")}`
          : `No upcoming events in ${selectedMonth.format("MMMM YYYY")}`}
      </Text>
      {activeFilter !== "All" && (
        <TouchableOpacity style={styles.resetButton} onPress={() => setActiveFilter("All")}>
          <Text style={styles.resetButtonText}>Show All Events</Text>
        </TouchableOpacity>
      )}
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
              router.replace("/(athlete)/(tabs)/home");
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#F0F0F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={{ width: 40 }} />
      </View>
      {renderMonthSelector()}
      {renderFilterChips()}

      {/* Info Section */}
      {!loading && events.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Showing {filteredEvents.length} of {events.length} events • Sorted by date
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FCA311" />
          <Text style={styles.loadingText}>Loading events...</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  monthSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  monthArrow: {
    padding: 8,
  },
  monthArrowDisabled: {
    opacity: 0.5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginHorizontal: 20,
    minWidth: 150,
    textAlign: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: "rgba(252, 163, 17, 0.2)",
  },
  filterChipText: {
    color: "#999",
    fontWeight: "500",
    fontSize: 14,
  },
  activeFilterChipText: {
    color: "#FCA311",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#999",
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 5,
  },
  eventCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  eventDetails: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  eventInfo: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  infoText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "rgba(252, 163, 17, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#FCA311",
    fontWeight: "bold",
  },
});

export default EventsScreen;

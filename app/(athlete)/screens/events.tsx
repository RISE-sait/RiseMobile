import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, RefreshControl, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { usePathname, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "@/store/slices/eventsSlice";
import { fetchMatches } from "@/store/slices/gamesSlice";
import type { Match } from "@/types";
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
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.data);
  const reduxEvents = useSelector((state: RootState) => state.events);
  const reduxGames = useSelector((state: RootState) => state.games);

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
    dispatch(fetchMatches(token) as any);
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
    const seenEventIds = new Set<string>(); // ✅ Track seen event IDs to prevent duplicates

    // Convert Redux events
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
              type: event.type || "other",
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


    // Convert Redux matches
    reduxGames.items.forEach((match: Match) => {
      // ✅ Validate match ID exists and created_at exists
      if (match.id && match.created_at) {
        const createdDate = dayjs(match.created_at);
        // ✅ Validate date before formatting to prevent "Invalid Date"
        if (createdDate.isValid()) {
          const date = createdDate.format("YYYY-MM-DD");
          const time = createdDate.format("h:mm A");
          // ✅ Also check for duplicate match IDs
          if (!seenEventIds.has(match.id)) {
            seenEventIds.add(match.id);
            allEvents.push({
              id: match.id,
              title: match.name || `Match ${match.id.slice(0, 6)}`,
              date,
              time,
              location: "RISE Basketball Court",
              image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
              type: "match",
            });
          }
        } else {
          console.warn(`⚠️ Invalid date for match ${match.id}: ${match.created_at}`);
        }
      } else {
        if (!match.id) console.warn(`⚠️ Match missing ID, skipping:`, match);
        if (!match.created_at) console.warn(`⚠️ Match missing created_at, skipping:`, match);
      }
    });

    // Sort events by proximity to today (nearest dates first, regardless of past/future)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    const sortedEvents = allEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);

      // Calculate distance from today
      const distanceA = Math.abs(dateA.getTime() - today.getTime());
      const distanceB = Math.abs(dateB.getTime() - today.getTime());

      return distanceA - distanceB;
    });

    // Limit to 50 most recent/upcoming events for performance
    const limitedEvents = sortedEvents.slice(0, 50);

    setEvents(limitedEvents);
  }, [reduxEvents.byDate, reduxGames.items]);

  useEffect(() => {
    filterEvents(activeFilter);
  }, [events, activeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const filterEvents = (filter: string) => {
    let filtered = events;

    if (filter !== "All") {
      // Map UI filter labels to backend status values
      const statusMapping: Record<string, string> = {
        "SCHEDULED": "scheduled",
        "Ongoing": "Ongoing",
        "Past": "Past"
      };
      const backendStatus = statusMapping[filter] || filter;
      filtered = events.filter(event => getEventStatus(event.date) === backendStatus);
    }

    // Always sort filtered results by proximity to today (nearest dates first)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);

      // Calculate distance from today for proximity-based sorting
      const distanceA = Math.abs(dateA.getTime() - today.getTime());
      const distanceB = Math.abs(dateB.getTime() - today.getTime());

      return distanceA - distanceB;
    });

    setFilteredEvents(sortedFiltered);
  };

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    if (eventDate < today) return "Past";
    if (eventDate.toDateString() === today.toDateString()) return "Ongoing";
    return "scheduled";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "#FCA311";
      case "Ongoing": return "#4CAF50";
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
          // 🔍 Step 1: Log navigation state BEFORE navigation
          const routerState = router.getState?.();
          console.log("[Events] 🎯 BEFORE navigation:", {
            id: item.id,
            type: item.type,
            pathname,
            segments: segments.join("/") || "(root)",
            canGoBack: router.canGoBack?.() ?? null,
            routerState: routerState ? {
              index: routerState.index,
              routes: routerState.routes?.map((r: any) => ({
                name: r.name,
                key: r.key,
                params: r.params,
              })),
              routeCount: routerState.routes?.length,
            } : "unavailable",
          });

          if (item.type === "match" || item.type === "game") {
            // Navigate to match details - calls GET /games/{id}
            console.log("[Events] 🚀 Navigating to MATCH details:", item.id);
            router.push({
              pathname: "/screens/match-details/[id]",
              params: { id: item.id },
            });
          } else if (item.type === "practice") {
            // Navigate to practice details - calls GET /practices/{id}
            console.log("[Events] 🚀 Navigating to PRACTICE details:", item.id);
            router.push({
              pathname: "/screens/practice-details/[id]",
              params: { id: item.id },
            });
          } else {
            // Navigate to event details - calls GET /events/{id}
            console.log("[Events] 🚀 Navigating to EVENT details:", item.id);
            router.push({
              pathname: "/screens/event-details/[id]",
              params: {
                id: item.id,
                source: "homepage",
              },
            });
          }

          // 🔍 Step 1: Log navigation state AFTER navigation (with small delay)
          setTimeout(() => {
            const afterState = router.getState?.();
            console.log("[Events] ✅ AFTER navigation:", {
              pathname: router.pathname || "unknown",
              canGoBack: router.canGoBack?.() ?? null,
              routerState: afterState ? {
                index: afterState.index,
                routes: afterState.routes?.map((r: any) => ({
                  name: r.name,
                  key: r.key,
                })),
                routeCount: afterState.routes?.length,
              } : "unavailable",
            });
          }, 100);
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

  const renderFilterChips = () => {
    const filters = ["All", "SCHEDULED", "Ongoing", "Past"];
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
      <Ionicons name="calendar-outline" size={50} color="#333" />
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>
        {activeFilter !== "All"
          ? `There are no ${activeFilter.toLowerCase()} events`
          : "Check back later for upcoming events"}
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
            // 🔍 Step 4: Log events page back button
            const routerState = router.getState?.();
            console.log("[Events] 🔙 Back button pressed (uses replace, not back!)", {
              currentPathname: pathname,
              canGoBack: router.canGoBack?.() ?? null,
              routerState: routerState ? {
                index: routerState.index,
                routeCount: routerState.routes?.length,
              } : "unavailable",
            });
            router.replace("/(athlete)/(tabs)/home");
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#F0F0F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={{ width: 40 }} />
      </View>
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
          keyExtractor={(item) => `${item.type}-${item.id}`}
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

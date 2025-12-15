import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import { getCustomers, getArchivedCustomersCount, type Customer } from "@/utils/api/admin";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from "react-native-reanimated";

// Customer Card Component - Memoized to prevent unnecessary re-renders
const CustomerCard = memo(function CustomerCard({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <TouchableOpacity
      className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {customer.photo_url ? (
        <Image
          source={{ uri: customer.photo_url }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
        />
      ) : (
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FCA311" }} className="items-center justify-center">
          <Text className="text-black-100 font-Oswald-Bold text-xl">
            {getInitials(customer.first_name, customer.last_name)}
          </Text>
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-white-100 font-Oswald-Medium text-lg">
          {customer.first_name} {customer.last_name}
        </Text>
        <Text className="text-gray-400 font-Outfit-Regular text-sm mt-0.5">
          {customer.email}
        </Text>
        {customer.membership_info?.membership_name && (
          <View className="flex-row items-center mt-2">
            <View className="bg-green-900/30 px-2.5 py-1 rounded-full flex-row items-center">
              <FontAwesome6 name="id-card" size={12} color="#4CAF50" />
              <Text className="font-Outfit-Medium text-sm ml-1.5" style={{ color: "#4CAF50" }}>
                {customer.membership_info.membership_name}
              </Text>
            </View>
          </View>
        )}
      </View>
      {customer.is_archived && (
        <View className="bg-red-900/30 px-3 py-1.5 rounded-full mr-2">
          <Text className="text-red-400 font-Outfit-Medium text-sm">Archived</Text>
        </View>
      )}
      <FontAwesome6 name="chevron-right" size={18} color="#666" />
    </TouchableOpacity>
  );
});

// Pagination Indicator Component
const PaginationIndicator = memo(function PaginationIndicator({
  currentPage,
  totalPages,
  onPagePress,
}: {
  currentPage: number;
  totalPages: number;
  onPagePress: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Show max 7 page indicators with ellipsis
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <View className="flex-row items-center justify-center py-4 space-x-2">
      {/* Previous Button */}
      <TouchableOpacity
        onPress={() => currentPage > 1 && onPagePress(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg ${currentPage === 1 ? "opacity-30" : ""}`}
      >
        <FontAwesome6 name="chevron-left" size={16} color={currentPage === 1 ? "#666" : "#FCA311"} />
      </TouchableOpacity>

      {/* Page Numbers */}
      {renderPageNumbers().map((page, index) => (
        <TouchableOpacity
          key={`page-${index}`}
          onPress={() => typeof page === "number" && onPagePress(page)}
          disabled={page === "..." || page === currentPage}
          className={`min-w-[32px] h-8 items-center justify-center rounded-lg mx-0.5 ${
            page === currentPage
              ? "bg-gold-100"
              : page === "..."
              ? ""
              : "bg-[#2A2A2A]"
          }`}
        >
          <Text
            className={`font-Oswald-Medium text-sm ${
              page === currentPage ? "text-black-100" : "text-gray-400"
            }`}
          >
            {page}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Next Button */}
      <TouchableOpacity
        onPress={() => currentPage < totalPages && onPagePress(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg ${currentPage === totalPages ? "opacity-30" : ""}`}
      >
        <FontAwesome6 name="chevron-right" size={16} color={currentPage === totalPages ? "#666" : "#FCA311"} />
      </TouchableOpacity>
    </View>
  );
});

export default function CustomersScreen() {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Server-side stats - fetched from API, independent of pagination
  const [activeCount, setActiveCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Cache pages data to avoid refetching
  const pagesCache = useRef<Map<number, Customer[]>>(new Map());

  // Fetch global stats (Total, Active, Archived) - independent of pagination
  const fetchStats = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      // Fetch total customers and archived count in parallel
      const [customersResult, archivedResult] = await Promise.all([
        getCustomers(token, undefined, 1, 1), // Just to get total
        getArchivedCustomersCount(token),
      ]);

      const total = customersResult.total;
      const archived = archivedResult.total;
      const active = total - archived;

      setTotalCustomers(total);
      setArchivedCount(archived);
      setActiveCount(active >= 0 ? active : 0);
      setStatsLoaded(true);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [getValidToken]);

  const fetchCustomers = useCallback(
    async (page: number = 1, search?: string) => {
      try {
        const token = await getValidToken();
        if (!token) {
          return;
        }

        // Clear cache if search query changed
        if (search !== undefined) {
          pagesCache.current.clear();
        }

        // Check cache first (only for non-search queries)
        if (!search && pagesCache.current.has(page)) {
          setCustomers(pagesCache.current.get(page) || []);
          setCurrentPage(page);
          return;
        }

        setIsLoading(true);

        const result = await getCustomers(token, search, page, 20);

        // Cache the result
        if (!search) {
          pagesCache.current.set(page, result.customers);
        }

        setCustomers(result.customers);
        // Only update total from customers API if stats not loaded yet
        if (!statsLoaded) {
          setTotalCustomers(result.total);
        }
        setCurrentPage(result.page);
        setTotalPages(result.pages);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [getValidToken, statsLoaded]
  );

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchCustomers(1);
    fetchStats(); // Fetch global stats independent of pagination
    setIsFirstMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search debounce effect - only re-run when searchQuery changes (skip first mount)
  useEffect(() => {
    if (isFirstMount) return;

    const timeoutId = setTimeout(() => {
      pagesCache.current.clear(); // Clear cache on search
      fetchCustomers(1, searchQuery || undefined);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pagesCache.current.clear(); // Clear cache on refresh
    setStatsLoaded(false); // Reset stats to refetch
    fetchCustomers(1, searchQuery || undefined);
    fetchStats(); // Refresh global stats
  }, [fetchCustomers, fetchStats, searchQuery]);

  // Navigate to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchCustomers(page, searchQuery || undefined);
    }
  }, [fetchCustomers, searchQuery, totalPages, currentPage]);

  // Swipe gesture for page navigation
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 80; // Minimum swipe distance to trigger page change

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Only activate after 20px horizontal movement
    .failOffsetY([-20, 20]) // Fail if vertical movement exceeds 20px (allow vertical scroll)
    .onUpdate((event) => {
      // Limit translation to provide visual feedback
      const maxTranslation = 100;
      translateX.value = Math.max(-maxTranslation, Math.min(maxTranslation, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right → go to previous page (callback handles bounds check)
        runOnJS(goToPrevPage)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → go to next page (callback handles bounds check)
        runOnJS(goToNextPage)();
      }
      // Reset translation with spring animation
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleCustomerPress = (customer: Customer) => {
    router.push({
      pathname: "/(admin)/screens/customer-details",
      params: { customerId: customer.id },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header Section */}
      <View className="w-full px-10 mt-10">
        <Text className="text-white-100 font-Oswald-Bold text-2xl">CUSTOMERS</Text>

        {/* Stats Row */}
        <View className="bg-[#1A1A1A] rounded-xl overflow-hidden mt-3 p-5">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                {totalCustomers}
              </Text>
              <Text className="text-gray-400 font-Oswald-Medium text-sm mt-1">Total</Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                {activeCount}
              </Text>
              <Text className="text-gray-400 font-Oswald-Medium text-sm mt-1">Active</Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                {archivedCount}
              </Text>
              <Text className="text-gray-400 font-Oswald-Medium text-sm mt-1">Archived</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="w-full px-10 mt-6">
        <View className="bg-[#1A1A1A] rounded-xl flex-row items-center px-4 py-3">
          <Ionicons name="search" size={20} color="#FCA311" />
          <TextInput
            className="flex-1 text-white-100 font-Outfit-Regular text-base ml-3"
            placeholder="Search by name or email..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Customer List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : (
        <View className="flex-1">
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
              <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CustomerCard
                    customer={item}
                    onPress={() => handleCustomerPress(item)}
                  />
                )}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center py-20">
                    <View className="bg-[#2A2A2A] p-5 rounded-full mb-4">
                      <FontAwesome6 name="users" size={48} color="#FCA311" />
                    </View>
                    <Text className="text-white-100 font-Oswald-Medium text-xl">
                      {searchQuery ? "No Customers Found" : "No Customers Yet"}
                    </Text>
                    <Text className="text-gray-400 font-Outfit-Regular text-base text-center mt-2 px-10">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Customers will appear here once they register"}
                    </Text>
                  </View>
                }
                contentContainerStyle={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 20, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FCA311"
                    colors={["#FCA311"]}
                  />
                }
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={15}
                windowSize={10}
                initialNumToRender={15}
                updateCellsBatchingPeriod={50}
              />
            </Animated.View>
          </GestureDetector>

          {/* Pagination Indicator at bottom */}
          <View className="bg-[#0C0B0B] px-4 pb-6">
            <PaginationIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              onPagePress={goToPage}
            />
            {/* Page info text and swipe hint */}
            {customers.length > 0 && (
              <Text className="text-gray-500 font-Outfit-Regular text-center text-sm">
                Page {currentPage} of {totalPages} • {totalCustomers} total customers
                {totalPages > 1 && "\nSwipe left/right to navigate"}
              </Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

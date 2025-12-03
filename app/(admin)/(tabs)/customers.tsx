import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
import { getCustomers, type Customer } from "@/utils/api/admin";

// Customer Card Component - Memoized to prevent unnecessary re-renders
const CustomerCard = memo(({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) => {
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchCustomers = useCallback(
    async (page: number = 1, search?: string, append: boolean = false) => {
      try {
        const token = await getValidToken();
        if (!token) {
          return;
        }

        if (!append) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const result = await getCustomers(token, search, page, 20);

        if (append) {
          setCustomers((prev) => [...prev, ...result.customers]);
        } else {
          setCustomers(result.customers);
        }
        setTotalCustomers(result.total);
        setCurrentPage(result.page);
        setTotalPages(result.pages);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [getValidToken]
  );

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchCustomers(1);
    setIsFirstMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search debounce effect - only re-run when searchQuery changes (skip first mount)
  useEffect(() => {
    if (isFirstMount) return;

    const timeoutId = setTimeout(() => {
      fetchCustomers(1, searchQuery || undefined);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCustomers(1, searchQuery || undefined);
  }, [fetchCustomers, searchQuery]);

  const loadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchCustomers(currentPage + 1, searchQuery || undefined, true);
    }
  };

  const handleCustomerPress = (customer: Customer) => {
    router.push({
      pathname: "/(admin)/screens/customer-details",
      params: { customerId: customer.id },
    });
  };

  // Memoized active and archived counts to prevent recalculation on every render
  const { activeCount, archivedCount } = useMemo(() => {
    if (!customers || !Array.isArray(customers)) {
      return { activeCount: 0, archivedCount: 0 };
    }
    let active = 0;
    let archived = 0;
    // Single pass through array instead of two filter operations
    for (const customer of customers) {
      if (customer.is_archived) {
        archived++;
      } else {
        active++;
      }
    }
    return { activeCount: active, archivedCount: archived };
  }, [customers]);

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
          ListFooterComponent={
            <>
              {isLoadingMore && (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#FCA311" />
                </View>
              )}
              {currentPage >= totalPages && customers.length > 0 && (
                <Text className="text-gray-500 font-Outfit-Regular text-center py-4 text-sm">
                  No more customers to load
                </Text>
              )}
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
          windowSize={10}
          initialNumToRender={15}
          updateCellsBatchingPeriod={50}
        />
      )}
    </SafeAreaView>
  );
}

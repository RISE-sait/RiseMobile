import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/utils/auth";
import {
  searchCustomerForCheckIn,
  checkInCustomer,
  type Customer,
  type CustomerCheckIn,
} from "@/utils/api/admin";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Search Result Card
const CustomerSearchCard = ({
  customer,
  onCheckIn,
  isChecking,
}: {
  customer: Customer;
  onCheckIn: () => void;
  isChecking: boolean;
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <View
      className="bg-[#1A1A1A] rounded-2xl p-4 mb-3"
      style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
    >
      <View className="flex-row items-center">
        {customer.photo_url ? (
          <Image
            source={{ uri: customer.photo_url }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <LinearGradient
            colors={["#FCA311", "#C36A04"]}
            className="w-14 h-14 rounded-full items-center justify-center"
          >
            <Text className="text-white-100 font-Oswald-Bold text-xl">
              {getInitials(customer.first_name, customer.last_name)}
            </Text>
          </LinearGradient>
        )}
        <View className="flex-1 ml-3">
          <Text className="text-white-100 font-Oswald-Bold text-lg">
            {customer.first_name} {customer.last_name}
          </Text>
          <Text className="text-gray-400 font-Outfit-Regular text-sm">
            {customer.email}
          </Text>
          {customer.membership_info?.membership_name && (
            <View className="flex-row items-center mt-1.5">
              <View
                className="px-2 py-0.5 rounded-full flex-row items-center"
                style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
              >
                <FontAwesome6 name="id-card" size={10} color="#4CAF50" />
                <Text className="text-[#4CAF50] font-Outfit-Medium text-xs ml-1.5">
                  {customer.membership_info.membership_name}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        className="mt-4 py-3.5 rounded-xl items-center flex-row justify-center"
        style={{ backgroundColor: "#FCA311" }}
        onPress={onCheckIn}
        disabled={isChecking}
        activeOpacity={0.8}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <>
            <FontAwesome6 name="circle-check" size={18} color="#000" />
            <Text className="text-black-100 font-Oswald-Bold text-base ml-2">
              Check In
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Success Modal
const CheckInSuccess = ({
  customer,
  membershipInfo,
  onDone,
}: {
  customer: Customer;
  membershipInfo: CustomerCheckIn | null;
  onDone: () => void;
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <View className="flex-1 items-center justify-center px-5">
      <View
        className="bg-[#1A1A1A] rounded-3xl p-6 w-full items-center"
        style={{ borderWidth: 1, borderColor: "rgba(76, 175, 80, 0.2)" }}
      >
        {/* Success Icon */}
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
        >
          <FontAwesome6 name="circle-check" size={50} color="#4CAF50" />
        </View>

        {/* Title */}
        <Text className="text-white-100 text-2xl font-Oswald-Bold text-center">
          Check-In Successful!
        </Text>

        {/* Customer Info */}
        <View className="mt-6 items-center">
          {customer.photo_url ? (
            <Image
              source={{ uri: customer.photo_url }}
              className="w-20 h-20 rounded-full"
              style={{ borderWidth: 2, borderColor: "rgba(76, 175, 80, 0.3)" }}
            />
          ) : (
            <LinearGradient
              colors={["#FCA311", "#C36A04"]}
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ borderWidth: 2, borderColor: "rgba(252, 163, 17, 0.3)" }}
            >
              <Text className="text-white-100 font-Oswald-Bold text-2xl">
                {getInitials(customer.first_name, customer.last_name)}
              </Text>
            </LinearGradient>
          )}
          <Text className="text-white-100 font-Oswald-Bold text-xl mt-3">
            {customer.first_name} {customer.last_name}
          </Text>
        </View>

        {/* Membership Info */}
        {membershipInfo && (
          <View
            className="mt-4 rounded-xl p-4 w-full"
            style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome6 name="id-card" size={16} color="#4CAF50" />
              <Text className="text-[#4CAF50] font-Oswald-Medium text-base ml-2">
                {membershipInfo.membership_name || "Active Membership"}
              </Text>
            </View>
            {membershipInfo.plan_name && (
              <Text className="text-gray-400 font-Outfit-Regular text-xs text-center mt-1">
                Plan: {membershipInfo.plan_name}
              </Text>
            )}
          </View>
        )}

        {/* Done Button */}
        <TouchableOpacity
          className="mt-6 py-4 rounded-xl w-full items-center"
          style={{ backgroundColor: "#FCA311" }}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text className="text-black-100 font-Oswald-Bold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CheckInScreen() {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [checkedInCustomer, setCheckedInCustomer] = useState<Customer | null>(null);
  const [checkInResult, setCheckInResult] = useState<CustomerCheckIn | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = await getValidToken();
      if (!token) return;

      const results = await searchCustomerForCheckIn(token, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, getValidToken]);

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleCheckIn = async (customer: Customer) => {
    setCheckingInId(customer.id);
    try {
      const token = await getValidToken();
      if (!token) return;

      const result = await checkInCustomer(token, customer.id);

      // Success haptic
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setCheckedInCustomer(customer);
      setCheckInResult(result);
      setShowSuccess(true);
    } catch (error: any) {
      // Error haptic
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert(
        "Check-In Failed",
        error?.message || "Unable to check in customer. Please try again."
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setCheckedInCustomer(null);
    setCheckInResult(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (showSuccess && checkedInCustomer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <CheckInSuccess
          customer={checkedInCustomer}
          membershipInfo={checkInResult}
          onDone={handleDone}
        />
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
        <View className="flex-1">
          <Text className="text-white-100 text-2xl font-Oswald-Bold">CHECK-IN</Text>
          <Text className="text-gray-400 font-Outfit-Regular text-sm">
            Search customer to check in
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 mt-4">
        <View
          className="bg-[#1A1A1A] rounded-2xl flex-row items-center px-4 py-3"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
          >
            <Ionicons name="search" size={16} color="#FCA311" />
          </View>
          <TextInput
            className="flex-1 text-white-100 font-Outfit-Regular text-base"
            placeholder="Search by name or email..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <Ionicons name="close" size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isSearching ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#FCA311" />
            <Text className="text-gray-400 font-Outfit-Regular mt-3">Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 font-Outfit-Medium text-sm uppercase tracking-wider">
                Search Results
              </Text>
              <Text className="text-gray-500 font-Outfit-Regular text-xs">
                {searchResults.length} found
              </Text>
            </View>
            {searchResults.map((customer) => (
              <CustomerSearchCard
                key={customer.id}
                customer={customer}
                onCheckIn={() => handleCheckIn(customer)}
                isChecking={checkingInId === customer.id}
              />
            ))}
          </>
        ) : searchQuery.length >= 2 ? (
          <View className="py-10 items-center">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
            >
              <FontAwesome6 name="magnifying-glass" size={32} color="#FCA311" />
            </View>
            <Text className="text-white-100 font-Oswald-Medium text-lg">No Results</Text>
            <Text className="text-gray-400 font-Outfit-Regular text-center mt-2 px-10">
              No customers found matching "{searchQuery}"
            </Text>
          </View>
        ) : (
          <View className="py-10 items-center">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
            >
              <FontAwesome6 name="user-plus" size={32} color="#FCA311" />
            </View>
            <Text className="text-white-100 font-Oswald-Medium text-lg">Search Customers</Text>
            <Text className="text-gray-400 font-Outfit-Regular text-center mt-2 px-10">
              Enter at least 2 characters to search
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

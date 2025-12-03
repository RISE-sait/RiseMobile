import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/utils/auth";
import {
  getCustomerById,
  getCustomerCredits,
  getCustomerTransactions,
  getCustomerWeeklyUsage,
  getCustomerSubsidies,
  type Customer,
  type CustomerCredits,
  type CustomerTransaction,
  type CustomerWeeklyUsage,
  type Subsidy,
} from "@/utils/api/admin";

// Info Row Component
const InfoRow = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 border-b border-[#222]"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View
      className="w-11 h-11 rounded-xl items-center justify-center mr-3"
      style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
    >
      <FontAwesome6 name={icon} size={18} color="#FCA311" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-500 font-Outfit-Regular text-sm">{label}</Text>
      <Text className="text-white-100 font-Outfit-Medium text-base mt-1">
        {value || "Not provided"}
      </Text>
    </View>
    {onPress && (
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </View>
    )}
  </TouchableOpacity>
);

// Tab Button Component
const TabButton = ({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 py-3 items-center rounded-lg"
    style={{
      backgroundColor: isActive ? "#FCA311" : "transparent",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      className={`font-Oswald-Medium text-base ${isActive ? "text-black-100" : "text-gray-400"}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default function CustomerDetailsScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { getValidToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "membership" | "credits" | "subsidies">("personal");

  // Credits data
  const [credits, setCredits] = useState<CustomerCredits | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<CustomerWeeklyUsage | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsLoaded, setCreditsLoaded] = useState(false); // Track if credits data was loaded
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Subsidies data
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [subsidiesLoading, setSubsidiesLoading] = useState(false);
  const [subsidiesLoaded, setSubsidiesLoaded] = useState(false); // Track if subsidies data was loaded

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;

    try {
      const token = await getValidToken();
      if (!token) return;

      const data = await getCustomerById(token, customerId);
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, getValidToken]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // Fetch credits data when Credits tab is activated
  const fetchCreditsData = useCallback(async () => {
    // Prevent duplicate fetches - check if already loading or already loaded
    if (!customerId || creditsLoading || creditsLoaded) return;
    setCreditsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) return;

      const [creditsData, transactionsData, weeklyUsageData] = await Promise.all([
        getCustomerCredits(token, customerId),
        getCustomerTransactions(token, customerId, { limit: 20, offset: 0 }),
        getCustomerWeeklyUsage(token, customerId),
      ]);

      setCredits(creditsData);
      setTransactions(transactionsData?.transactions || []);
      setWeeklyUsage(weeklyUsageData);
      setCreditsLoaded(true); // Mark as loaded
    } catch (error) {
      console.error("Error fetching credits data:", error);
    } finally {
      setCreditsLoading(false);
    }
  }, [customerId, creditsLoading, creditsLoaded, getValidToken]);

  // Fetch subsidies data when Subsidies tab is activated
  const fetchSubsidiesData = useCallback(async () => {
    // Prevent duplicate fetches - check if already loading or already loaded
    if (!customerId || subsidiesLoading || subsidiesLoaded) return;
    setSubsidiesLoading(true);

    try {
      const token = await getValidToken();
      if (!token) return;

      const subsidiesData = await getCustomerSubsidies(token, customerId, { limit: 50, page: 1 });
      setSubsidies(subsidiesData?.data || []);
      setSubsidiesLoaded(true); // Mark as loaded
    } catch (error) {
      console.error("Error fetching subsidies data:", error);
    } finally {
      setSubsidiesLoading(false);
    }
  }, [customerId, subsidiesLoading, subsidiesLoaded, getValidToken]);

  // Fetch data when tab changes - with proper dependency tracking
  useEffect(() => {
    if (activeTab === "credits" && !creditsLoaded && !creditsLoading) {
      fetchCreditsData();
    } else if (activeTab === "subsidies" && !subsidiesLoaded && !subsidiesLoading) {
      fetchSubsidiesData();
    }
  }, [activeTab, creditsLoaded, creditsLoading, subsidiesLoaded, subsidiesLoading, fetchCreditsData, fetchSubsidiesData]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL(`mailto:${customer.email}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FCA311" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <View className="px-5 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#1A1A1A] rounded-full items-center justify-center mr-3"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white-100 text-2xl font-Oswald-Bold">CUSTOMER</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
          >
            <FontAwesome6 name="user" size={32} color="#FCA311" />
          </View>
          <Text className="text-white-100 font-Oswald-Medium text-lg">Customer Not Found</Text>
          <Text className="text-gray-400 font-Outfit-Regular mt-2">
            The customer could not be loaded
          </Text>
        </View>
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
        <Text className="text-white-100 text-2xl font-Oswald-Bold">CUSTOMER DETAILS</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="items-center mt-6 mb-6">
          {customer.photo_url ? (
            <Image
              source={{ uri: customer.photo_url }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: "rgba(252, 163, 17, 0.3)"
              }}
            />
          ) : (
            <LinearGradient
              colors={["#FCA311", "#C36A04"]}
              className="items-center justify-center"
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: "rgba(252, 163, 17, 0.3)"
              }}
            >
              <Text className="text-white-100 font-Oswald-Bold text-4xl">
                {getInitials(customer.first_name, customer.last_name)}
              </Text>
            </LinearGradient>
          )}
          <Text className="text-white-100 font-Oswald-Bold text-3xl mt-4">
            {customer.first_name} {customer.last_name}
          </Text>
          {customer.is_archived && (
            <View
              className="px-4 py-1.5 rounded-full mt-3"
              style={{ backgroundColor: "rgba(255, 107, 107, 0.15)" }}
            >
              <Text className="text-[#FF6B6B] font-Outfit-Medium text-base">Account Archived</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="flex-row mb-6 gap-3">
          <TouchableOpacity
            className="flex-1 bg-[#1A1A1A] rounded-2xl py-5 items-center"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            onPress={handleCall}
            disabled={!customer.phone}
            activeOpacity={0.7}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
            >
              <FontAwesome6 name="phone" size={22} color="#4CAF50" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-base">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#1A1A1A] rounded-2xl py-5 items-center"
            style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            onPress={handleEmail}
            disabled={!customer.email}
            activeOpacity={0.7}
          >
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: "rgba(33, 150, 243, 0.15)" }}
            >
              <FontAwesome6 name="envelope" size={22} color="#2196F3" />
            </View>
            <Text className="text-white-100 font-Outfit-Medium text-base">Email</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-[#1A1A1A] rounded-xl p-1 mb-6" style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
          <TabButton
            title="Personal"
            isActive={activeTab === "personal"}
            onPress={() => setActiveTab("personal")}
          />
          <TabButton
            title="Membership"
            isActive={activeTab === "membership"}
            onPress={() => setActiveTab("membership")}
          />
          <TabButton
            title="Credits"
            isActive={activeTab === "credits"}
            onPress={() => setActiveTab("credits")}
          />
          <TabButton
            title="Subsidies"
            isActive={activeTab === "subsidies"}
            onPress={() => setActiveTab("subsidies")}
          />
        </View>

        {/* Tab Content */}
        {activeTab === "personal" && (
          <>
            {/* Contact Information */}
            <View
              className="bg-[#1A1A1A] rounded-2xl px-4 mb-6"
              style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            >
              <View className="py-4 border-b border-[#222]">
                <Text className="text-gold-100 font-Oswald-Bold text-base">CONTACT INFORMATION</Text>
              </View>
              <InfoRow
                icon="envelope"
                label="Email"
                value={customer.email || "No email provided"}
                onPress={customer.email ? handleEmail : undefined}
              />
              <InfoRow
                icon="phone"
                label="Phone"
                value={customer.phone || "No phone provided"}
                onPress={customer.phone ? handleCall : undefined}
              />
              <InfoRow
                icon="flag"
                label="Country Code"
                value={customer.country_code || "Not specified"}
              />
              <InfoRow
                icon="cake-candles"
                label="Date of Birth"
                value={customer.dob || "Not provided"}
              />
            </View>

            {/* Emergency Contact */}
            <View
              className="bg-[#1A1A1A] rounded-2xl px-4 mb-6"
              style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
            >
              <View className="py-4 border-b border-[#222]">
                <Text className="text-gold-100 font-Oswald-Bold text-base">EMERGENCY CONTACT</Text>
              </View>
              <InfoRow
                icon="user"
                label="Name"
                value={customer.emergency_contact_name || "Not provided"}
              />
              <InfoRow
                icon="phone"
                label="Phone"
                value={customer.emergency_contact_phone || "Not provided"}
                onPress={customer.emergency_contact_phone ? () => Linking.openURL(`tel:${customer.emergency_contact_phone}`) : undefined}
              />
              <InfoRow
                icon="heart"
                label="Relationship"
                value={customer.emergency_contact_relationship || "Not specified"}
              />
            </View>

            {/* Notes */}
            {customer.notes && (
              <View
                className="bg-[#1A1A1A] rounded-2xl px-4 mb-6"
                style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
              >
                <View className="py-4 border-b border-[#222]">
                  <Text className="text-gold-100 font-Oswald-Bold text-base">NOTES</Text>
                </View>
                <View className="py-4">
                  <Text className="text-white-100 font-Outfit-Regular text-sm leading-6">
                    {customer.notes}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === "membership" && (
          <>
            {customer.membership_info?.membership_name ? (
              <>
                {/* Active Membership Card */}
                <View
                  className="bg-[#1A1A1A] rounded-2xl p-5 mb-6"
                  style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {/* Status Badge */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className="px-4 py-2 rounded-lg flex-row items-center"
                      style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}
                    >
                      <FontAwesome6 name="circle-check" size={16} color="#4CAF50" />
                      <Text className="font-Oswald-Medium text-base ml-2" style={{ color: "#4CAF50" }}>
                        Active Membership
                      </Text>
                    </View>
                  </View>

                  {/* Membership Name */}
                  <View className="mb-4">
                    <Text className="text-gray-400 font-Outfit-Regular text-sm mb-1">Membership Type</Text>
                    <Text className="text-white-100 font-Oswald-Bold text-2xl">
                      {customer.membership_info.membership_name}
                    </Text>
                  </View>

                  {/* Plan */}
                  {customer.membership_info.membership_plan_name && (
                    <View className="mb-4">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm mb-1">Plan</Text>
                      <Text className="text-white-100 font-Outfit-Medium text-lg">
                        {customer.membership_info.membership_plan_name}
                      </Text>
                    </View>
                  )}

                  {/* Dates */}
                  <View className="flex-row justify-between pt-4 border-t border-[#222]">
                    <View className="flex-1">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm mb-1">Started</Text>
                      <Text className="text-white-100 font-Outfit-Medium text-base">
                        {customer.membership_info.membership_start_date
                          ? new Date(customer.membership_info.membership_start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : "N/A"}
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm mb-1">Renews</Text>
                      <Text className="text-gold-100 font-Outfit-Medium text-base">
                        {customer.membership_info.membership_renewal_date
                          ? new Date(customer.membership_info.membership_renewal_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* No Membership Card */}
                <View className="flex-1 items-center justify-center py-20">
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(128, 128, 128, 0.15)" }}
                  >
                    <FontAwesome6 name="id-card" size={40} color="#888" />
                  </View>
                  <Text className="text-white-100 font-Oswald-Medium text-xl">No Active Membership</Text>
                  <Text className="text-gray-400 font-Outfit-Regular text-base text-center mt-2 px-8">
                    This customer does not have an active membership
                  </Text>
                </View>
              </>
            )}
          </>
        )}

        {activeTab === "credits" && (
          <>
            {creditsLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#FCA311" />
              </View>
            ) : (
              <>
                {/* Credits Balance */}
                <View
                  className="bg-[#1A1A1A] rounded-2xl p-4 mb-6 overflow-visible"
                  style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <View className="py-3 border-b border-[#222]">
                    <Text className="text-gold-100 font-Oswald-Bold text-base">CREDITS BALANCE</Text>
                  </View>
                  <View className="items-center py-6">
                    <Text className="text-gold-100 font-Oswald-Bold text-5xl" style={{ lineHeight: 56 }}>
                      {credits?.credits ?? 0}
                    </Text>
                    <Text className="text-gray-400 font-Outfit-Medium text-sm mt-2">
                      Available Credits
                    </Text>
                  </View>
                </View>

                {/* Weekly Usage */}
                {weeklyUsage && (
                  <View
                    className="bg-[#1A1A1A] rounded-2xl p-4 mb-6"
                    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <View className="py-4 border-b border-[#222]">
                      <Text className="text-gold-100 font-Oswald-Bold text-base">WEEKLY USAGE</Text>
                    </View>
                    <View className="flex-row justify-around py-5">
                      <View className="items-center flex-1">
                        <Text className="font-Oswald-Bold text-4xl" style={{ color: "#64B5F6" }}>
                          {weeklyUsage.current_week_usage}
                        </Text>
                        <Text className="text-gray-400 font-Outfit-Medium text-sm mt-1">Used This Week</Text>
                      </View>
                      <View className="w-px bg-gray-700" />
                      <View className="items-center flex-1">
                        <Text className="font-Oswald-Bold text-4xl" style={{ color: "#4CAF50" }}>
                          {weeklyUsage.remaining_credits}
                        </Text>
                        <Text className="text-gray-400 font-Outfit-Medium text-sm mt-1">Remaining</Text>
                      </View>
                      <View className="w-px bg-gray-700" />
                      <View className="items-center flex-1">
                        <Text className="text-gold-100 font-Oswald-Bold text-4xl">
                          {weeklyUsage.weekly_limit}
                        </Text>
                        <Text className="text-gray-400 font-Outfit-Medium text-sm mt-1">Weekly Limit</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Transaction History */}
                <View
                  className="bg-[#1A1A1A] rounded-2xl px-4 mb-6"
                  style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <View className="py-4 border-b border-[#222] flex-row justify-between items-center">
                    <Text className="text-gold-100 font-Oswald-Bold text-base">TRANSACTION HISTORY</Text>
                    {transactions && transactions.length > 5 && (
                      <TouchableOpacity onPress={() => setShowAllTransactions(!showAllTransactions)}>
                        <Text className="text-gold-100 font-Outfit-Medium text-sm">
                          {showAllTransactions ? "Show Less" : `View All (${transactions.length})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {transactions && transactions.length > 0 ? (
                    <>
                      {(showAllTransactions ? transactions : transactions.slice(0, 5)).map((transaction) => (
                        <View
                          key={transaction.id}
                          className="py-4 border-b border-[#222]"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center flex-1">
                              <View
                                className="px-3 py-1.5 rounded-lg"
                                style={{
                                  backgroundColor:
                                    transaction.amount > 0
                                      ? "rgba(76, 175, 80, 0.15)"
                                      : "rgba(255, 107, 107, 0.15)",
                                }}
                              >
                                <Text
                                  className="font-Outfit-Bold text-sm uppercase"
                                  style={{
                                    color:
                                      transaction.amount > 0
                                        ? "#4CAF50"
                                        : "#FF6B6B",
                                  }}
                                >
                                  {transaction.transaction_type}
                                </Text>
                              </View>
                            </View>
                            <Text
                              className="font-Oswald-Bold text-2xl"
                              style={{
                                color:
                                  transaction.amount > 0
                                    ? "#4CAF50"
                                    : "#FF6B6B",
                              }}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount}
                            </Text>
                          </View>
                          {transaction.description?.Valid && (
                            <Text className="text-gray-400 font-Outfit-Regular text-sm mt-1">
                              {transaction.description.String}
                            </Text>
                          )}
                          {transaction.created_at?.Valid && (
                            <Text className="text-gray-500 font-Outfit-Regular text-sm mt-1">
                              {new Date(transaction.created_at.Time).toLocaleString()}
                            </Text>
                          )}
                        </View>
                      ))}
                      {!showAllTransactions && transactions.length > 5 && (
                        <TouchableOpacity
                          onPress={() => setShowAllTransactions(true)}
                          className="py-4 items-center"
                        >
                          <Text className="text-gold-100 font-Outfit-Medium text-base">
                            View {transactions.length - 5} More Transactions
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <View className="py-10 items-center">
                      <FontAwesome6 name="receipt" size={40} color="#666" />
                      <Text className="text-gray-400 font-Outfit-Medium text-base mt-3">
                        No transactions yet
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}

        {activeTab === "subsidies" && (
          <>
            {subsidiesLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#FCA311" />
              </View>
            ) : subsidies && subsidies.length > 0 ? (
              subsidies.map((subsidy) => (
                <View
                  key={subsidy.id}
                  className="bg-[#1A1A1A] rounded-2xl p-4 mb-4"
                  style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {/* Provider Header */}
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
                    >
                      <FontAwesome6 name="building" size={18} color="#FCA311" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white-100 font-Oswald-Medium text-xl">
                        {subsidy.provider.name}
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full self-start mt-2"
                        style={{
                          backgroundColor:
                            subsidy.status === "active"
                              ? "rgba(76, 175, 80, 0.15)"
                              : subsidy.status === "expired"
                                ? "rgba(255, 107, 107, 0.15)"
                                : "rgba(252, 163, 17, 0.15)",
                        }}
                      >
                        <Text
                          className="font-Outfit-Medium text-sm uppercase"
                          style={{
                            color:
                              subsidy.status === "active"
                                ? "#4CAF50"
                                : subsidy.status === "expired"
                                  ? "#FF6B6B"
                                  : "#FCA311",
                          }}
                        >
                          {subsidy.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Balance Info */}
                  <View className="flex-row justify-between py-4 border-t border-[#222]">
                    <View className="flex-1">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm">Approved</Text>
                      <Text className="text-white-100 font-Oswald-Medium text-xl mt-1">
                        ${subsidy.approved_amount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm">Used</Text>
                      <Text className="font-Oswald-Medium text-xl mt-1" style={{ color: "#64B5F6" }}>
                        ${subsidy.total_amount_used.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-gray-400 font-Outfit-Regular text-sm">Remaining</Text>
                      <Text className="font-Oswald-Medium text-xl mt-1" style={{ color: "#4CAF50" }}>
                        ${subsidy.remaining_balance.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Dates */}
                  <View className="pt-3 border-t border-[#222]">
                    <Text className="text-gray-500 font-Outfit-Regular text-xs">
                      Valid from: {new Date(subsidy.valid_from).toLocaleDateString()}
                    </Text>
                    {subsidy.reason && (
                      <Text className="text-gray-400 font-Outfit-Regular text-xs mt-1">
                        Reason: {subsidy.reason}
                      </Text>
                    )}
                    {subsidy.approved_by && (
                      <Text className="text-gray-500 font-Outfit-Regular text-xs mt-1">
                        Approved by: {subsidy.approved_by}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
                >
                  <FontAwesome6 name="hand-holding-dollar" size={32} color="#FCA311" />
                </View>
                <Text className="text-white-100 font-Oswald-Medium text-lg">No Subsidies</Text>
                <Text className="text-gray-400 font-Outfit-Regular text-center mt-2">
                  This customer has no subsidies
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

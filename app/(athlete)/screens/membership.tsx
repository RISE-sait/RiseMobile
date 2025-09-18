import React, { useState, useEffect } from "react";
import { View, Text, Alert, Modal, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import BackButton from "@/components/buttons/BackButton";
import { getUserMemberships } from "@/utils/api";
import MembershipDetails from "@/components/membership/MembershipDetails";
import MembershipPurchaseList from "@/components/membership/MembershipPurchaseList";

const MembershipScreen: React.FC = () => {
  const [userMemberships, setUserMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");

  useEffect(() => {
    const fetchUserMemberships = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call GET /secure/customers/memberships with try...catch
        const memberships = await getUserMemberships();
        console.log("🔍 Debug - Fetched memberships:", memberships);
        console.log("🔍 Debug - Memberships length:", memberships?.length || 0);
        setUserMemberships(memberships || []);
      } catch (error) {
        console.error("❌ Error loading membership info:", error);
        setError("Unable to load membership information");

        // Show error toast/alert as mentioned in requirements
        Alert.alert(
          "Error",
          "Unable to load membership information. Please try again later.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserMemberships();
  }, []);

  // Function to refresh membership data after successful payment
  const refreshMembershipData = async () => {
    try {
      const memberships = await getUserMemberships();
      setUserMemberships(memberships || []);
    } catch (error) {
      console.error("❌ Error refreshing membership data:", error);
    }
  };

  // Function to open payment WebView
  const handleOpenPaymentWebView = (url: string) => {
    setPaymentUrl(url);
    setShowWebView(true);
  };

  // Function to handle WebView navigation state changes
  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check for payment success patterns - implement real success detection
    if (url.includes("success") || url.includes("complete")) {
      // Close WebView modal
      setShowWebView(false);

      // Show success message and refresh membership data
      Alert.alert(
        "Payment Successful",
        "Your membership purchase was completed successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Immediately refresh membership data to get updated status
              refreshMembershipData();
            }
          }
        ]
      );
    }

    // Check for payment failure patterns
    if (url.includes("cancel") || url.includes("error") || url.includes("fail")) {
      // Close WebView modal
      setShowWebView(false);

      // Show failure message
      Alert.alert(
        "Payment Cancelled",
        "Your payment was cancelled or failed. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Function to close WebView
  const handleCloseWebView = () => {
    setShowWebView(false);
    setPaymentUrl("");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <StatusBar translucent backgroundColor="transparent" style="light" />

        {/* Header */}
        <View className="flex-row items-center py-4 px-5 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white text-2xl font-bold ml-3">Membership</Text>
        </View>

        {/* Loading State */}
        <View className="flex-1 justify-center items-center">
          <Text className="text-[#F0F0F0] text-base">Loading membership information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <StatusBar translucent backgroundColor="transparent" style="light" />

        {/* Header */}
        <View className="flex-row items-center py-4 px-5 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white text-2xl font-bold ml-3">Membership</Text>
        </View>

        {/* Error State */}
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
          <Text className="text-[#999999] text-sm text-center">
            Please check your internet connection and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center py-4 px-5 border-b border-[#222222]">
        <BackButton />
        <Text className="text-white text-2xl font-bold ml-3">Membership</Text>
      </View>

      {/* Content - Scrollable container for both sections */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* Your Current Membership Section */}
          <View className="mb-8">
            <View className="pb-3 mb-4 border-b border-[#222222]">
              <Text className="text-white text-lg font-semibold">Your Current Membership</Text>
            </View>
            {userMemberships.length > 0 ? (
              <View className="bg-[#1A1A1A] rounded-xl p-4">
                <MembershipDetails
                  membership={userMemberships[0]}
                  onRefresh={refreshMembershipData}
                />
              </View>
            ) : (
              <View className="bg-[#1A1A1A] rounded-xl p-4">
                <Text className="text-[#999999] text-center py-8">
                  No active membership found. Browse available plans below to get started.
                </Text>
              </View>
            )}
          </View>

          {/* Available Membership Plans Section */}
          <View className="mb-8">
            <View className="pb-3 mb-4 border-b border-[#222222]">
              <Text className="text-white text-lg font-semibold">Available Membership Plans</Text>
              {userMemberships.length > 0 && (
                <Text className="text-[#999999] text-sm mt-1">
                  Explore other plans or upgrade your membership
                </Text>
              )}
            </View>
            <View className="bg-[#1A1A1A] rounded-xl p-4">
              <MembershipPurchaseList
                onPurchaseSuccess={refreshMembershipData}
                onOpenPaymentWebView={handleOpenPaymentWebView}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseWebView}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* WebView Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Complete Payment</Text>
            <TouchableOpacity onPress={handleCloseWebView}>
              <Text className="text-blue-500 text-base">Close</Text>
            </TouchableOpacity>
          </View>

          {/* WebView */}
          {paymentUrl ? (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Loading payment page...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default MembershipScreen;
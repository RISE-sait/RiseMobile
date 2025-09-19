import React, { useState, useEffect } from "react";
import { View, Text, Alert, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from "react-redux";
import BackButton from "@/components/buttons/BackButton";
import { getUserMemberships } from "@/utils/api";
import MembershipDetails from "@/components/membership/MembershipDetails";
import MembershipPurchaseList from "@/components/membership/MembershipPurchaseList";
import { setMembership } from "@/store/slices/membershipSlice";
import type { RootState } from "@/store";

const MembershipScreen: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [userMemberships, setUserMemberships] = useState<any[]>([]);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  
  // Get cached membership data from Redux store
  const dispatch = useDispatch();
  const cachedMembership = useSelector((state: RootState) => state.membership.data);

  const loadMembershipData = async () => {
    setStatus('loading');
    try {
      // Call GET /secure/customers/memberships with unified response format
      const result = await getUserMemberships();

      if (result.error) {
        console.error("❌ Error loading membership info:", result.error);
        setStatus('error');
      } else {
        console.log("🔍 Debug - Fetched memberships:", result.data);
        console.log("🔍 Debug - Memberships length:", result.data?.length || 0);
        const memberships = result.data || [];
        setUserMemberships(memberships);
        
        // Cache the membership data in Redux store
        if (memberships.length > 0) {
          dispatch(setMembership(memberships[0]));
        }
        
        setStatus('success');
      }
    } catch (e) {
      console.error("An unexpected error occurred in loadMembershipData:", e);
      setStatus('error'); // Ensure program exits loading state under any exception
    }
  };

  // Enhanced retry mechanism for post-purchase membership sync
  const loadMembershipDataWithRetry = async (retries = 3, delay = 2000) => {
    setStatus('loading');
    try {
      for (let i = 0; i < retries; i++) {
        console.log(`Attempt ${i + 1} of ${retries} to fetch membership status...`);
        const result = await getUserMemberships();

        // If successfully retrieved membership information (list length > 0)
        if (result.data && result.data.length > 0) {
          console.log("Success: New membership found!");
          setUserMemberships(result.data);
          setStatus('success');
          return; // Success, exit function immediately
        }

        // If none found and not the last attempt, wait before retrying
        if (i < retries - 1) {
          console.log("Membership not found yet, waiting to retry...");
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // After all retries still no result, inform user about processing status
          console.warn("Could not find new membership after all retries.");
          // Keep original membership info (if any) and notify user
          // Here we choose to enter success state, but UI will show "no membership"
          setUserMemberships([]);
          setStatus('success');
          Alert.alert(
            "Purchase Processing",
            "Your new membership is being processed and will appear shortly. Please check back in a few moments."
          );
        }
      }
    } catch (e) {
      console.error("An unexpected error occurred during the polling process:", e);
      setStatus('error');
    }
  };

  useEffect(() => {
    // If we have cached membership data, use it immediately for faster loading
    if (cachedMembership) {
      console.log("✅ Using cached membership data for faster loading");
      setUserMemberships([cachedMembership]);
      setStatus('success');
    }
    
    // Always fetch fresh data in the background
    loadMembershipData();
  }, []);


  // Function to refresh membership data after successful payment
  const refreshMembershipData = async () => {
    await loadMembershipDataWithRetry();
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

  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <StatusBar translucent backgroundColor="transparent" style="light" />

        {/* Header */}
        <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
        </View>

        {/* Loading State - Show content with loading indicator */}
        <MembershipPurchaseList
          onPurchaseSuccess={refreshMembershipData}
          onOpenPaymentWebView={handleOpenPaymentWebView}
          onPurchaseCompleted={() => loadMembershipDataWithRetry()}
          hasExistingMembership={!!cachedMembership}
          headerComponent={
            <View className="px-4 py-3">
              {/* Your Current Membership Section */}
              <View className="mb-6">
                <View className="pb-2 mb-3 border-b border-[#222222]">
                  <Text className="text-white-100 text-base font-semibold">Your Current Membership</Text>
                </View>
                <View className="bg-[#1A1A1A] rounded-lg p-4">
                  <View className="flex-row items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#FFD700" />
                    <Text className="text-[#999999] ml-3 text-sm">Loading your membership...</Text>
                  </View>
                </View>
              </View>

              {/* Conditional Section Header */}
              <View className="mb-3">
                <View className="pb-2 mb-3 border-b border-[#222222]">
                  <Text className="text-white-100 text-base font-semibold">Available Membership Plans</Text>
                </View>
              </View>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <StatusBar translucent backgroundColor="transparent" style="light" />

        {/* Header */}
        <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
        </View>

        {/* Error State */}
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-base text-center mb-4">
            Failed to load membership details
          </Text>
          <Text className="text-[#999999] text-sm text-center mb-6">
            Please check your internet connection and try again.
          </Text>
          <TouchableOpacity
            onPress={loadMembershipData}
            className="bg-[#FFD700] px-6 py-3 rounded-lg"
          >
            <Text className="text-black font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state - render main content
  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
        <BackButton />
        <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
      </View>

      {/* Content */}
      <>
        {userMemberships.length > 0 ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-4 py-3">
              <View className="mb-6">
                <View className="pb-2 mb-3 border-b border-[#222222]">
                  <Text className="text-white-100 text-base font-semibold">Your Current Membership</Text>
                </View>
                <MembershipDetails
                  membership={userMemberships[0]}
                  onRefresh={refreshMembershipData}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <MembershipPurchaseList
            onPurchaseSuccess={refreshMembershipData}
            onOpenPaymentWebView={handleOpenPaymentWebView}
            onPurchaseCompleted={() => loadMembershipDataWithRetry()}
            hasExistingMembership={false}
            headerComponent={
              <View className="px-4 py-3">
                <View className="mb-3">
                  <View className="pb-2 mb-3 border-b border-[#222222]">
                    <Text className="text-white-100 text-base font-semibold">Available Membership Plans</Text>
                    <Text className="text-[#999999] text-xs mt-1">
                      Choose a plan to get started with RISE
                    </Text>
                  </View>
                </View>
              </View>
            }
          />
        )}
      </>

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
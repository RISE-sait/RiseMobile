import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from "react-redux";
import BackButton from "@/components/buttons/BackButton";
import { getUserMemberships, type APIErrorType } from "@/utils/api";
import { router } from "expo-router";
import MembershipDetails from "@/components/membership/MembershipDetails";
import MembershipPurchaseList from "@/components/membership/MembershipPurchaseList";
import CreditsOverview from "@/components/credits/CreditsOverview";
import SubsidyOverview from "@/components/subsidy/SubsidyOverview";
import { setMembership, clearMembership } from "@/store/slices/membershipSlice";
import type { RootState } from "@/store";
import Constants from "expo-constants";
import { showAlert } from "@/utils/customAlert";

const MembershipScreen: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [userMemberships, setUserMemberships] = useState<any[]>([]);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState('memberships');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorType, setErrorType] = useState<APIErrorType>('unknown');

  // Get cached membership data and JWT token from Redux store
  const dispatch = useDispatch();
  const cachedMembership = useSelector((state: RootState) => state.membership.data);
  const userToken = useSelector((state: RootState) => state.user.data?.token);

  const loadMembershipData = async (showLoading = false) => {
    // Only show loading state if explicitly requested (e.g., first load without cache)
    if (showLoading) {
      setStatus('loading');
    }

    try {
      // Call GET /secure/customers/memberships with unified response format
      const result = await getUserMemberships();

      if (result.error) {
        console.error("❌ Error loading membership info:", result.error);

        // Store error details for display
        setErrorMessage(result.error.userMessage || result.error.message);
        setErrorType(result.error.type);

        // Only set error if we don't have cached data to show
        if (!cachedMembership) {
          setStatus('error');

          // For auth errors, automatically redirect to login after a short delay
          if (result.error.type === 'auth') {
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 2000);
          }
        }
      } else {
        const memberships = result.data || [];
        setUserMemberships(memberships);

        // Cache the membership data in Redux store
        if (memberships.length > 0) {
          dispatch(setMembership(memberships[0]));
        } else {
          dispatch(clearMembership());
        }

        setStatus('success');
      }
    } catch (e) {
      console.error("An unexpected error occurred in loadMembershipData:", e);
      // Only set error if we don't have cached data to show
      if (!cachedMembership) {
        setErrorMessage("An unexpected error occurred. Please try again.");
        setErrorType('unknown');
        setStatus('error');
      }
    }
  };

  // Enhanced retry mechanism for post-purchase membership sync
  const loadMembershipDataWithRetry = async (retries = 3, delay = 2000) => {
    setStatus('loading');
    try {
      for (let i = 0; i < retries; i++) {
        const result = await getUserMemberships();

        // If successfully retrieved membership information (list length > 0)
        if (result.data && result.data.length > 0) {
          setUserMemberships(result.data);
          setStatus('success');
          return; // Success, exit function immediately
        }

        // If none found and not the last attempt, wait before retrying
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // After all retries still no result, inform user about processing status
          console.warn("Could not find new membership after all retries.");
          // Keep original membership info (if any) and notify user
          // Here we choose to enter success state, but UI will show "no membership"
          setUserMemberships([]);
          setStatus('success');
          showAlert(
            "Purchase Processing",
            "Your new membership is being processed and will appear shortly. Please check back in a few moments.",
            [{ text: "OK" }],
            { type: "info" }
          );
        }
      }
    } catch (e) {
      console.error("An unexpected error occurred during the polling process:", e);
      setStatus('error');
    }
  };

  useEffect(() => {
    // If we have cached membership, show it immediately while fetching fresh data
    if (cachedMembership) {
      setUserMemberships([cachedMembership]);
      setStatus('success');
      // Fetch fresh data in the background without showing loading state
      loadMembershipData(false);
    } else {
      // No cached data, show loading state while fetching
      loadMembershipData(true);
    }
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
      showAlert(
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
        ],
        { type: "success" }
      );
    }

    // Check for payment failure patterns
    if (url.includes("cancel") || url.includes("error") || url.includes("fail")) {
      // Close WebView modal
      setShowWebView(false);

      // Show failure message
      showAlert(
        "Payment Cancelled",
        "Your payment was cancelled or failed. Please try again.",
        [{ text: "OK" }],
        { type: "error" }
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

        {/* Header with Back Button */}
        <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
        </View>
        {/* Custom Tab Bar */}
        <View style={{ flexDirection: 'row', backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#222222' }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('memberships')}
          >
            <Text style={{ color: activeTab === 'memberships' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={{ color: activeTab === 'credits' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'subsidy' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('subsidy')}
          >
            <Text style={{ color: activeTab === 'subsidy' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Subsidy</Text>
          </TouchableOpacity>
        </View>
        {/* Content based on active tab */}
        <View className="flex-1">
          {activeTab === 'memberships' ? (
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
          ) : activeTab === 'credits' ? (
            // Credits tab content - using actual credits component
            <View className="flex-1">
              {userToken ? (
                <CreditsOverview userToken={userToken} />
              ) : (
                <View className="flex-1 justify-center items-center px-5">
                  <Text className="text-[#999999] text-sm text-center">
                    Please log in to view your credits
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Subsidy tab content
            <View className="flex-1">
              {userToken ? (
                <SubsidyOverview userToken={userToken} />
              ) : (
                <View className="flex-1 justify-center items-center px-5">
                  <Text className="text-[#999999] text-sm text-center">
                    Please log in to view your subsidy
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B]">
        <StatusBar translucent backgroundColor="transparent" style="light" />

        {/* Header with Back Button */}
        <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
          <BackButton />
          <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
        </View>
        {/* Custom Tab Bar */}
        <View style={{ flexDirection: 'row', backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#222222' }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('memberships')}
          >
            <Text style={{ color: activeTab === 'memberships' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={{ color: activeTab === 'credits' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'subsidy' ? '#FFD700' : 'transparent' }}
            onPress={() => setActiveTab('subsidy')}
          >
            <Text style={{ color: activeTab === 'subsidy' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Subsidy</Text>
          </TouchableOpacity>
        </View>
        {/* Content based on active tab */}
        <View className="flex-1">
          {activeTab === 'memberships' ? (
            <View className="flex-1 justify-center items-center px-5">
              <Text className="text-red-500 text-base text-center mb-4">
                Failed to load membership details
              </Text>
              <Text className="text-[#999999] text-sm text-center mb-6">
                {errorMessage || "Please check your internet connection and try again."}
              </Text>
              {errorType === 'auth' ? (
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  className="bg-[#FFD700] px-6 py-3 rounded-lg"
                >
                  <Text className="text-black font-semibold">Log In</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => loadMembershipData(true)}
                  className="bg-[#FFD700] px-6 py-3 rounded-lg"
                >
                  <Text className="text-black font-semibold">Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : activeTab === 'credits' ? (
            // Credits tab content - using actual credits component
            <View className="flex-1">
              {userToken ? (
                <CreditsOverview userToken={userToken} />
              ) : (
                <View className="flex-1 justify-center items-center px-5">
                  <Text className="text-[#999999] text-sm text-center">
                    Please log in to view your credits
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Subsidy tab content
            <View className="flex-1">
              {userToken ? (
                <SubsidyOverview userToken={userToken} />
              ) : (
                <View className="flex-1 justify-center items-center px-5">
                  <Text className="text-[#999999] text-sm text-center">
                    Please log in to view your subsidy
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Success state - render main content
  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header with Back Button */}
      <View className="flex-row items-center py-3 px-4 border-b border-[#222222]">
        <BackButton />
        <Text className="text-white-100 text-xl font-bold ml-3">Membership</Text>
      </View>
      {/* Custom Tab Bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#222222' }}>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FFD700' : 'transparent' }}
          onPress={() => setActiveTab('memberships')}
        >
          <Text style={{ color: activeTab === 'memberships' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FFD700' : 'transparent' }}
          onPress={() => setActiveTab('credits')}
        >
          <Text style={{ color: activeTab === 'credits' ? '#FFD700' : '#999999', fontWeight: 'bold' }}>Credits</Text>
        </TouchableOpacity>
      </View>
      {/* Content based on active tab */}
      <View className="flex-1">
        {activeTab === 'memberships' ? (
          userMemberships.length > 0 ? (
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
          )
        ) : (
          // Credits tab content - using actual credits component
          <View className="flex-1">
            {userToken ? (
              <CreditsOverview userToken={userToken} />
            ) : (
              <View className="flex-1 justify-center items-center px-5">
                <Text className="text-[#999999] text-sm text-center">
                  Please log in to view your credits
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

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
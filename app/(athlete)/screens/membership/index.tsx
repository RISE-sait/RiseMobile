import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from "react-redux";
import BackButton from "@/components/buttons/BackButton";
import { getUserMemberships, getSubscriptions, upgradeSubscription, getAllMembershipPlans, getPlansForMembership, type APIErrorType } from "@/utils/api";
import { router } from "expo-router";
import MembershipDetails from "@/components/membership/MembershipDetails";
import MembershipPurchaseList from "@/components/membership/MembershipPurchaseList";
import CreditsOverview from "@/components/credits/CreditsOverview";
import SubsidyOverview from "@/components/subsidy/SubsidyOverview";
import { setMembership, clearMembership } from "@/store/slices/membershipSlice";
import type { RootState } from "@/store";
import { showAlert } from "@/utils/customAlert";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrown, faCheck, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Upgrade state
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlans, setUpgradePlans] = useState<any[]>([]);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [upgradePlansLoading, setUpgradePlansLoading] = useState(false);

  const loadMembershipData = async (showLoading = false) => {
    // Only show loading state if explicitly requested (e.g., first load without cache)
    if (showLoading) {
      setStatus('loading');
    }

    try {
      // Call GET /secure/customers/memberships with unified response format
      const result = await getUserMemberships();

      if (__DEV__) {
        console.log("🔍 Membership API result:", JSON.stringify(result, null, 2));

        // Debug: decode JWT to show the database user_id being sent to the backend
        try {
          const jwtToken = await AsyncStorage.getItem("authToken");
          if (jwtToken) {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            console.log("🔍 JWT user_id (database UUID):", payload.user_id);
            console.log("🔍 JWT role:", payload.role);
          }
        } catch (decodeErr) {
          console.log("🔍 Could not decode JWT:", decodeErr);
        }
      }

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
    // Also fetch subscription data for upgrade functionality
    loadSubscriptionData();
  }, []);


  // Fetch subscription IDs from Stripe
  const loadSubscriptionData = async () => {
    try {
      const result = await getSubscriptions();
      if (result.data?.data && result.data.data.length > 0) {
        // Find the first active subscription
        const activeSub = result.data.data.find((sub: any) => sub.status === 'active') || result.data.data[0];
        setSubscriptionId(activeSub.id);
      }
    } catch (e) {
      // Non-blocking — upgrade button just won't show
      console.warn("Could not fetch subscription data:", e);
    }
  };

  // Function to refresh membership data after successful payment
  const refreshMembershipData = async () => {
    await loadMembershipDataWithRetry();
    // Also refresh subscription data
    await loadSubscriptionData();
  };

  // Load available plans for upgrade modal
  const loadUpgradePlans = async () => {
    setUpgradePlansLoading(true);
    try {
      const typesResult = await getAllMembershipPlans();
      if (typesResult.error || !typesResult.data) {
        setUpgradePlans([]);
        return;
      }

      const allPlans: any[] = [];
      for (const membershipType of typesResult.data) {
        const plansResult = await getPlansForMembership(membershipType.id);
        if (plansResult.data && Array.isArray(plansResult.data)) {
          for (const plan of plansResult.data) {
            allPlans.push({
              ...plan,
              membership_type_name: membershipType.name,
            });
          }
        }
      }
      setUpgradePlans(allPlans);
    } catch (e) {
      console.warn("Could not load upgrade plans:", e);
      setUpgradePlans([]);
    } finally {
      setUpgradePlansLoading(false);
    }
  };

  // Handle upgrade button on membership card
  const handleOpenUpgradeModal = () => {
    setShowUpgradeModal(true);
    loadUpgradePlans();
  };

  // Handle selecting a plan to upgrade to
  const handleUpgrade = (planId: string, planName: string) => {
    if (!subscriptionId) return;

    Alert.alert(
      "Upgrade Plan",
      `Upgrade to ${planName}? Stripe will prorate the cost — you'll be credited for unused time on your current plan.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          onPress: async () => {
            setUpgradeLoading(planId);
            try {
              const result = await upgradeSubscription(subscriptionId, planId);

              if (result.error) {
                showAlert(
                  "Upgrade Failed",
                  result.error.userMessage || result.error.message,
                  [{ text: "OK" }],
                  { type: "error" }
                );
                return;
              }

              setShowUpgradeModal(false);
              showAlert(
                "Upgrade Successful",
                "Your membership has been upgraded! Proration has been applied to your billing.",
                [{ text: "OK", onPress: () => refreshMembershipData() }],
                { type: "success" }
              );
            } catch (e) {
              showAlert(
                "Upgrade Failed",
                "An unexpected error occurred. Please try again.",
                [{ text: "OK" }],
                { type: "error" }
              );
            } finally {
              setUpgradeLoading(null);
            }
          },
        },
      ]
    );
  };

  const currentMembership = userMemberships[0];
  const isExpiredMembership =
    !!currentMembership?.status &&
    typeof currentMembership.status === 'string' &&
    currentMembership.status.toLowerCase() === 'expired';

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
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('memberships')}
          >
            <Text style={{ color: activeTab === 'memberships' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={{ color: activeTab === 'credits' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'subsidy' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('subsidy')}
          >
            <Text style={{ color: activeTab === 'subsidy' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Subsidy</Text>
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
                        <ActivityIndicator size="small" color="#FCA311" />
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
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('memberships')}
          >
            <Text style={{ color: activeTab === 'memberships' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={{ color: activeTab === 'credits' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'subsidy' ? '#FCA311' : 'transparent' }}
            onPress={() => setActiveTab('subsidy')}
          >
            <Text style={{ color: activeTab === 'subsidy' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Subsidy</Text>
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
                  className="bg-[#FCA311] px-6 py-3 rounded-lg"
                >
                  <Text className="text-black font-semibold">Log In</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => loadMembershipData(true)}
                  className="bg-[#FCA311] px-6 py-3 rounded-lg"
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
          style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'memberships' ? '#FCA311' : 'transparent' }}
          onPress={() => setActiveTab('memberships')}
        >
          <Text style={{ color: activeTab === 'memberships' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Memberships</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'credits' ? '#FCA311' : 'transparent' }}
          onPress={() => setActiveTab('credits')}
        >
          <Text style={{ color: activeTab === 'credits' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Credits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'subsidy' ? '#FCA311' : 'transparent' }}
          onPress={() => setActiveTab('subsidy')}
        >
          <Text style={{ color: activeTab === 'subsidy' ? '#FCA311' : '#999999', fontWeight: 'bold' }}>Subsidy</Text>
        </TouchableOpacity>
      </View>
      {/* Content based on active tab */}
      <View className="flex-1">
        {activeTab === 'memberships' ? (
          <MembershipPurchaseList
            onPurchaseSuccess={refreshMembershipData}
            onOpenPaymentWebView={handleOpenPaymentWebView}
            onPurchaseCompleted={() => loadMembershipDataWithRetry()}
            hasExistingMembership={userMemberships.length > 0 && !isExpiredMembership}
            headerComponent={
              <View className="px-4 py-3">
                {/* Show all current memberships if user has any */}
                {userMemberships.length > 0 && !isExpiredMembership && (
                  <View className="mb-6">
                    <View className="pb-2 mb-3 border-b border-[#222222]">
                      <Text className="text-white-100 text-base font-semibold">
                        {userMemberships.length > 1 ? "Your Current Memberships" : "Your Current Membership"}
                      </Text>
                    </View>
                    {userMemberships.map((membership, index) => (
                      <View key={membership.id || index} style={{ marginBottom: index < userMemberships.length - 1 ? 12 : 0 }}>
                        <MembershipDetails
                          membership={membership}
                          onUpgrade={subscriptionId ? handleOpenUpgradeModal : undefined}
                        />
                      </View>
                    ))}
                    {/* Single refresh button for all memberships */}
                    <TouchableOpacity
                      style={{ backgroundColor: '#333333', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 }}
                      onPress={refreshMembershipData}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>Refresh Membership Data</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Show expired membership notice */}
                {isExpiredMembership && (
                  <View className="mb-4 rounded-lg border border-[#b91c1c] bg-[#2f1a1a] p-3">
                    <Text className="text-red-300 text-sm font-semibold">Your previous membership has expired.</Text>
                    <Text className="text-[#e5e7eb] text-xs mt-1">
                      Select a new plan below to continue your access.
                    </Text>
                  </View>
                )}

                {/* Available plans section header */}
                <View className="mb-3">
                  <View className="pb-2 mb-3 border-b border-[#222222]">
                    <Text className="text-white-100 text-base font-semibold">Available Membership Plans</Text>
                    <Text className="text-[#999999] text-xs mt-1">
                      {userMemberships.length > 0 && !isExpiredMembership
                        ? "Add another membership to your account"
                        : "Choose a plan to get started with RISE"}
                    </Text>
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

      {/* Upgrade Plan Modal */}
      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <SafeAreaView style={upgradeStyles.modalContainer}>
          {/* Modal Header */}
          <View style={upgradeStyles.modalHeader}>
            <Text style={upgradeStyles.modalTitle}>Upgrade Your Plan</Text>
            <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
              <Text style={upgradeStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Current plan info */}
          {currentMembership && (
            <View style={upgradeStyles.currentPlanBanner}>
              <Text style={upgradeStyles.currentPlanLabel}>Current Plan</Text>
              <Text style={upgradeStyles.currentPlanName}>
                {currentMembership.membership_plan_name || currentMembership.membership_name || "Your Plan"}
              </Text>
              {currentMembership.price && (
                <Text style={upgradeStyles.currentPlanPrice}>{currentMembership.price}</Text>
              )}
            </View>
          )}

          {/* Plans list */}
          <ScrollView style={upgradeStyles.plansList} contentContainerStyle={{ paddingBottom: 40 }}>
            {upgradePlansLoading ? (
              <View style={upgradeStyles.loadingContainer}>
                <ActivityIndicator size="small" color="#FCA311" />
                <Text style={upgradeStyles.loadingText}>Loading available plans...</Text>
              </View>
            ) : upgradePlans.length === 0 ? (
              <View style={upgradeStyles.emptyContainer}>
                <Text style={upgradeStyles.emptyText}>No upgrade plans available at this time.</Text>
              </View>
            ) : (
              upgradePlans.map((plan) => {
                const formattedPrice = plan.price
                  ? (typeof plan.price === 'number' ? `$${plan.price.toFixed(2)}` : plan.price.toString().replace(/\$\$/g, '$'))
                  : null;

                const formatInterval = (interval?: string, amtPeriods?: number): string => {
                  if (interval === "once") return " (one-time)";
                  if (interval === "month") return "/month";
                  if (interval === "week") {
                    if (amtPeriods === 26) return "/bi-weekly";
                    return "/week";
                  }
                  if (interval === "biweekly") return "/bi-weekly";
                  if (interval === "year" && amtPeriods) {
                    if (amtPeriods === 12) return "/month";
                    if (amtPeriods === 1) return "/year";
                    return `/${interval}`;
                  }
                  if (!interval) return "/month";
                  return `/${interval}`;
                };

                const benefits = plan.benefits
                  ? plan.benefits.split("•").filter((b: string) => b && b.trim()).map((b: string) => b.trim())
                  : [];

                return (
                  <View key={plan.id} style={upgradeStyles.planCard}>
                    <LinearGradient
                      colors={["#1C1C1E", "#2C2C2E"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={upgradeStyles.planCardGradient}
                    >
                      {plan.membership_type_name && (
                        <Text style={upgradeStyles.planTypeName}>{plan.membership_type_name}</Text>
                      )}

                      <View style={upgradeStyles.planTitleRow}>
                        <FontAwesomeIcon icon={faCrown} color="#FCA311" size={16} />
                        <Text style={upgradeStyles.planName}>{plan.name}</Text>
                      </View>

                      {formattedPrice && (
                        <View style={upgradeStyles.priceRow}>
                          <Text style={upgradeStyles.priceAmount}>{formattedPrice}</Text>
                          <Text style={upgradeStyles.pricePeriod}>{formatInterval(plan.interval, plan.amt_periods)}</Text>
                        </View>
                      )}

                      {plan.description ? (
                        <Text style={upgradeStyles.planDescription}>{plan.description}</Text>
                      ) : null}

                      {benefits.length > 0 && (
                        <View style={upgradeStyles.benefitsContainer}>
                          {benefits.map((benefit: string, idx: number) => (
                            <View key={idx} style={upgradeStyles.benefitItem}>
                              <FontAwesomeIcon icon={faCheck} color="#32CD32" size={12} />
                              <Text style={upgradeStyles.benefitText}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          upgradeStyles.upgradeButton,
                          upgradeLoading === plan.id && upgradeStyles.upgradeButtonDisabled,
                        ]}
                        onPress={() => handleUpgrade(plan.id, plan.name)}
                        disabled={upgradeLoading === plan.id}
                        activeOpacity={0.8}
                      >
                        {upgradeLoading === plan.id ? (
                          <View style={upgradeStyles.buttonLoadingRow}>
                            <ActivityIndicator size="small" color="#000000" />
                            <Text style={[upgradeStyles.upgradeButtonText, { marginLeft: 8 }]}>Upgrading...</Text>
                          </View>
                        ) : (
                          <View style={upgradeStyles.buttonLoadingRow}>
                            <FontAwesomeIcon icon={faArrowUp} color="#000000" size={14} />
                            <Text style={[upgradeStyles.upgradeButtonText, { marginLeft: 8 }]}>Upgrade to This Plan</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const upgradeStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButtonText: {
    color: "#FCA311",
    fontSize: 16,
  },
  currentPlanBanner: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  currentPlanLabel: {
    color: "#999999",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentPlanName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  currentPlanPrice: {
    color: "#FCA311",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  plansList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#999999",
    marginLeft: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#999999",
    fontSize: 14,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  planCardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  planTypeName: {
    color: "#999999",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  priceAmount: {
    color: "#FCA311",
    fontSize: 24,
    fontWeight: "800",
  },
  pricePeriod: {
    color: "#999999",
    fontSize: 14,
    marginLeft: 4,
  },
  planDescription: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  benefitText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: "#FCA311",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MembershipScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/utils/auth";
import { requestLink, getLinkRequests, cancelLinkRequest } from "@/utils/api/family";
import type { LinkRequest } from "@/types/family";

const LinkRequestScreen = () => {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [childEmail, setChildEmail] = useState("");
  const [pendingRequest, setPendingRequest] = useState<LinkRequest | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);

  // Check for pending requests on mount
  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          setCheckingPending(false);
          return;
        }

        console.log("🔍 Checking for pending link requests...");
        const requests = await getLinkRequests(token);
        console.log("📋 Link requests:", requests);

        // Find pending request where current user is the initiator (parent)
        // API returns requests without explicit "status" field - if it exists in the list, it's pending
        const myPendingRequest = requests.find(
          (r) => r.initiated_by === "parent"
        );

        console.log("🔎 Filtered pending request:", myPendingRequest);

        if (myPendingRequest) {
          console.log("⏳ Found pending request:", myPendingRequest);
          setPendingRequest(myPendingRequest);
        } else {
          console.log("✅ No pending requests found");
        }
      } catch (err: any) {
        console.error("❌ Error checking pending requests:", err.response?.data || err.message);
      } finally {
        setCheckingPending(false);
      }
    };

    checkPendingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCancelRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getValidToken();
      if (!token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      console.log("🗑️ Canceling link request...");
      await cancelLinkRequest(token);
      console.log("✅ Link request canceled");

      setPendingRequest(null);
      setSuccess("Request canceled. You can now send a new link request.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error("❌ Cancel request error:", err.response?.data || err.message);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to cancel request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLink = async () => {
    if (!childEmail.trim()) {
      setError("Please enter the child's email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getValidToken();
      if (!token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      console.log("🔗 Sending link request for:", childEmail.trim());
      const response = await requestLink(token, { target_email: childEmail.trim() });
      console.log("✅ Link request response:", response);

      // Show success and go back - child will accept on their end
      setSuccess("Link request sent! Your child will receive a verification code to accept.");
      setTimeout(() => router.back(), 2000);
    } catch (err: any) {
      console.error("❌ Link request error:", err.response?.data || err.message);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to send link request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 py-2"
          activeOpacity={0.6}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white-100 text-lg font-Outfit-SemiBold">Link a Child</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >

          <View className="px-5 pt-6" style={{ minHeight: 500 }}>
            {checkingPending ? (
              // Loading state while checking for pending requests
              <View className="py-10 items-center">
                <ActivityIndicator size="small" color="#FCA311" />
                <Text className="text-gray-400 text-sm font-Outfit-Regular mt-3">
                  Checking for pending requests...
                </Text>
              </View>
            ) : pendingRequest ? (
              // Pending request view
              <>
                <View className="mb-8">
                  <Text className="text-white-100 text-2xl font-Outfit-Bold mb-2">
                    Pending Link Request
                  </Text>
                  <Text className="text-gray-400 text-sm font-Outfit-Regular leading-5">
                    You have a pending link request. Cancel it to send a new one.
                  </Text>
                </View>

                <View className="mb-10 bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A]">
                  <View className="flex-row items-center mb-2">
                    <FontAwesome6 name="clock" size={14} color="#FCA311" />
                    <Text className="text-gray-400 text-xs font-Outfit-SemiBold ml-2 uppercase tracking-wide">
                      Pending Request
                    </Text>
                  </View>
                  <Text className="text-white-100 text-base font-Outfit-Medium">
                    {pendingRequest.child_name}
                  </Text>
                  <Text className="text-gray-400 text-sm font-Outfit-Regular mt-1">
                    {pendingRequest.child_email}
                  </Text>
                  <Text className="text-gray-500 text-xs font-Outfit-Regular mt-1">
                    Sent on {new Date(pendingRequest.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleCancelRequest}
                  disabled={loading}
                  className={`py-4 rounded-xl items-center ${
                    loading ? "bg-[#2A2A2A]" : "bg-red-500"
                  }`}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text className="text-white-100 text-base font-Outfit-Bold">
                      Cancel Request
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Normal email input view
              <>
                <View className="mb-8">
                  <Text className="text-white-100 text-2xl font-Outfit-Bold mb-2">
                    Link Your Child
                  </Text>
                  <Text className="text-gray-400 text-sm font-Outfit-Regular leading-5">
                    Enter your child's email address. We'll send them a verification code to confirm the link.
                  </Text>
                </View>

                <View className="mb-10">
                  <Text className="text-gray-400 text-xs font-Outfit-SemiBold mb-6 uppercase tracking-wide">
                    Child's Email Address
                  </Text>
                  <TextInput
                    value={childEmail}
                    onChangeText={(text) => {
                      setChildEmail(text);
                      setError(null);
                    }}
                    placeholder="child@example.com"
                    placeholderTextColor="#555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-[#1A1A1A] text-white-100 text-base font-Outfit-Regular px-4 py-3.5 rounded-xl border border-[#2A2A2A]"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRequestLink}
                  disabled={loading || !childEmail.trim()}
                  className={`py-4 rounded-xl items-center ${
                    loading || !childEmail.trim() ? "bg-[#2A2A2A]" : "bg-[#FCA311]"
                  }`}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FCA311" />
                  ) : (
                    <Text className={`text-base font-Outfit-Bold ${
                      !childEmail.trim() ? "text-gray-500" : "text-black"
                    }`}>
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>


          {/* Error message */}
          {error && (
            <View className="mx-5 mb-4 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
              <Text className="text-red-400 text-sm font-Outfit-Regular text-center">{error}</Text>
            </View>
          )}

          {/* Success message */}
          {success && (
            <View className="mx-5 mb-4 bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20">
              <Text className="text-green-400 text-sm font-Outfit-Regular text-center">{success}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LinkRequestScreen;

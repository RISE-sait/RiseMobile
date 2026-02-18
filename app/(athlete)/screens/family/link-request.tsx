import React, { useState } from "react";
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
import { requestLink, confirmLink } from "@/utils/api/family";
import { useDispatch } from "react-redux";
import { getChildren } from "@/utils/api/family";
import { setChildren } from "@/store/slices/familySlice";

type Step = "request" | "confirm";

const LinkRequestScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { getValidToken } = useAuth();

  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Request form fields
  const [childEmail, setChildEmail] = useState("");

  // Confirm form fields
  const [verificationCode, setVerificationCode] = useState("");

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

      await requestLink(token, { child_email: childEmail.trim() });
      setSuccess("Link request sent! A verification code has been sent via email.");
      setStep("confirm");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send link request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLink = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
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

      await confirmLink(token, { code: verificationCode.trim() });

      // Refresh children list after successful link
      const childrenData = await getChildren(token).catch(() => []);
      dispatch(setChildren(Array.isArray(childrenData) ? childrenData : []));

      setSuccess("Child linked successfully!");
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to confirm link";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-Outfit-SemiBold">Link a Child</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <View className="flex-row items-center mb-6 mt-2">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step === "request" ? "bg-[#FCA311]" : "bg-green-600"
              }`}
            >
              {step === "confirm" ? (
                <FontAwesome6 name="check" size={14} color="#FFF" />
              ) : (
                <Text className="text-black text-sm font-Outfit-Bold">1</Text>
              )}
            </View>
            <View className="h-0.5 flex-1 bg-gray-700 mx-2" />
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step === "confirm" ? "bg-[#FCA311]" : "bg-gray-700"
              }`}
            >
              <Text
                className={`text-sm font-Outfit-Bold ${
                  step === "confirm" ? "text-black" : "text-gray-400"
                }`}
              >
                2
              </Text>
            </View>
          </View>

          {step === "request" && (
            <View>
              <Text className="text-white text-lg font-Outfit-SemiBold mb-2">
                Enter Child's Email
              </Text>
              <Text className="text-gray-400 text-sm font-Outfit-Regular mb-6">
                Enter the email address associated with your child's account. A verification code
                will be sent to confirm the link.
              </Text>

              <Text className="text-gray-400 text-xs font-Outfit-Medium mb-2 uppercase tracking-wide">
                Child's Email
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
                className="bg-[#1A1A1A] text-white text-base font-Outfit-Regular p-4 rounded-xl mb-6"
              />

              <TouchableOpacity
                onPress={handleRequestLink}
                disabled={loading}
                className={`py-4 rounded-xl items-center ${
                  loading ? "bg-gray-700" : "bg-[#FCA311]"
                }`}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text className="text-black text-base font-Outfit-SemiBold">
                    Send Link Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "confirm" && (
            <View>
              <Text className="text-white text-lg font-Outfit-SemiBold mb-2">
                Enter Verification Code
              </Text>
              <Text className="text-gray-400 text-sm font-Outfit-Regular mb-6">
                A verification code has been sent via email. Enter the code below to confirm the
                link.
              </Text>

              <Text className="text-gray-400 text-xs font-Outfit-Medium mb-2 uppercase tracking-wide">
                Verification Code
              </Text>
              <TextInput
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text);
                  setError(null);
                }}
                placeholder="Enter code"
                placeholderTextColor="#555"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-[#1A1A1A] text-white text-base font-Outfit-Regular p-4 rounded-xl mb-6"
              />

              <TouchableOpacity
                onPress={handleConfirmLink}
                disabled={loading}
                className={`py-4 rounded-xl items-center ${
                  loading ? "bg-gray-700" : "bg-[#FCA311]"
                }`}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text className="text-black text-base font-Outfit-SemiBold">Confirm Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setStep("request");
                  setVerificationCode("");
                  setError(null);
                  setSuccess(null);
                }}
                className="mt-4 py-3 items-center"
              >
                <Text className="text-gray-400 text-sm font-Outfit-Regular">
                  Go back and try a different email
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View className="mt-4 bg-red-900/30 p-4 rounded-xl">
              <Text className="text-red-400 text-sm font-Outfit-Regular">{error}</Text>
            </View>
          )}

          {/* Success message */}
          {success && (
            <View className="mt-4 bg-green-900/30 p-4 rounded-xl">
              <Text className="text-green-400 text-sm font-Outfit-Regular">{success}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LinkRequestScreen;

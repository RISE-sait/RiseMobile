import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CreditsOverview from "@/components/credits/CreditsOverview";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
};

const CreditsScreen = () => {
  const router = useRouter();
  const reduxUser = useSelector((state: RootState) => state.user.data);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (reduxUser) {
          setUser({
            id: reduxUser.id,
            email: reduxUser.email,
            firstName: reduxUser.firstName || reduxUser.first_name || "",
            lastName: reduxUser.lastName || reduxUser.last_name || "",
            role: reduxUser.role,
            token: reduxUser.token,
          });
          return;
        }

        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            id: parsedUser.id,
            email: parsedUser.email,
            firstName: parsedUser.firstName || parsedUser.first_name || "",
            lastName: parsedUser.lastName || parsedUser.last_name || "",
            role: parsedUser.role,
            token: parsedUser.token,
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, [reduxUser]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5 items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <Text className="text-[#F0F0F0] text-base">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-[#2A2A2A]">
        <Text
          className="text-[#F0F0F0] text-lg mr-4"
          onPress={() => router.back()}
        >
          ← Back
        </Text>
        <Text className="text-[#F0F0F0] text-xl font-semibold">Credits</Text>
      </View>

      <View className="flex-1 px-5 pt-5">
        {user?.token && <CreditsOverview userToken={user.token} />}
      </View>
    </SafeAreaView>
  );
};

export default CreditsScreen;
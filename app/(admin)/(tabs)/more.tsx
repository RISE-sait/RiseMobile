import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/utils/auth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AccountSection from "@/components/profile/AccountSection";

export default function MoreScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const reduxUser = useAppSelector((state) => state.user.data);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header - Using same component as athlete/coach */}
        {reduxUser && (
          <ProfileHeader
            firstName={reduxUser.firstName || ""}
            lastName={reduxUser.lastName || ""}
            role={reduxUser.role || "Admin"}
            profileImage={reduxUser.profileImage ? { uri: reduxUser.profileImage } : undefined}
            countryCode={reduxUser.countryCode}
            onPress={() => router.push("/(admin)/screens/profile")}
          />
        )}

        {/* Quick Actions Section */}
        <AccountSection
          title="Quick Actions"
          items={[
            {
              icon: "globe",
              text: "Website Content",
              onPress: () => router.push("/(admin)/screens/website-content"),
            },
          ]}
        />

        {/* My Account Section */}
        <AccountSection
          title="My Account"
          items={[
            {
              icon: "pen-to-square",
              text: "Edit Profile",
              onPress: () => router.push("/(admin)/screens/profile"),
            },
            {
              icon: "lock",
              text: "Change Password",
              onPress: () => router.push("/(admin)/screens/change-password"),
            },
            {
              icon: "bell",
              text: "Notifications & Security",
              onPress: () => router.push("/screens/profile-options/notificationSettings"),
            },
            {
              icon: "arrow-right-from-bracket",
              text: "Logout",
              iconColor: "#EF4444",
              textColor: "#EF4444",
              onPress: handleLogout,
            },
          ]}
        />

        {/* Support Section */}
        <AccountSection
          title="Support"
          items={[
            {
              icon: "question-circle",
              text: "Help Center",
              onPress: () => router.push("/screens/profile-options/helpCenter"),
            },
            {
              icon: "envelope",
              text: "Contact Us",
              onPress: () => router.push("/screens/profile-options/contactUs"),
            },
          ]}
        />

        {/* Legal Section */}
        <AccountSection
          title="Legal"
          items={[
            {
              icon: "shield",
              text: "Privacy Policy",
              onPress: () => router.push("/screens/legal/privacy-policy"),
            },
            {
              icon: "file-text",
              text: "Terms of Service",
              onPress: () => router.push("/screens/legal/terms-of-service"),
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

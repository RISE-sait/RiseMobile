import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import images from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const AthleteProfileScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingHorizontal: 20 }}>
      {/* Status Bar */}
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* SCROLLVIEW */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 PROFILE HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
          {/* Profile Image */}
          <Image
            source={images.headshot}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: "#FCA311",
            }}
          />
          {/* User Info */}
          <View style={{ marginLeft: 15 }}>
            <Text style={{ color: "#F0F0F0", fontSize: 24, fontWeight: "700" }}>
              John Doe
            </Text>
            <Text style={{ color: "#FCA311", fontSize: 16, fontWeight: "500" }}>
              Athlete - Soccer | #10
            </Text>
          </View>
        </View>

        {/* 🎯 PLAYER STATS CARD */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 20,
            borderRadius: 15,
            marginTop: 30,
            shadowColor: "#FCA311",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text style={{ color: "#F0F0F0", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
            🎯 Player Stats
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#FCA311", fontSize: 22, fontWeight: "bold" }}>87</Text>
              <Text style={{ color: "#F0F0F0", fontSize: 14 }}>Overall Rating</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#FCA311", fontSize: 22, fontWeight: "bold" }}>15</Text>
              <Text style={{ color: "#F0F0F0", fontSize: 14 }}>Goals</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#FCA311", fontSize: 22, fontWeight: "bold" }}>9</Text>
              <Text style={{ color: "#F0F0F0", fontSize: 14 }}>Assists</Text>
            </View>
          </View>
        </View>

        {/* 🎟️ TRAINING SCHEDULE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => console.log("Training Schedule pressed")}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginTop: 25,
            paddingVertical: 18,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#FCA311",
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            width: width * 0.9,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#F0F0F0", fontSize: 18, fontWeight: "bold" }}>
            📅 View Training Schedule
          </Text>
        </TouchableOpacity>

        {/* 🏆 UPCOMING MATCHES BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => console.log("Upcoming Matches pressed")}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginTop: 20,
            paddingVertical: 18,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#FCA311",
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            width: width * 0.9,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#F0F0F0", fontSize: 18, fontWeight: "bold" }}>
            🏆 Upcoming Matches
          </Text>
        </TouchableOpacity>

        {/* 🚀 LOGOUT BUTTON */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#D62828",
            marginTop: 40,
            paddingVertical: 18,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#D62828",
            shadowOpacity: 0.6,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            width: width * 0.9,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#F0F0F0", fontSize: 18, fontWeight: "bold" }}>
            🚀 Logout
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AthleteProfileScreen;

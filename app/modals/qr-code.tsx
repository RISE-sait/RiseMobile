import React, { useRef, useEffect } from "react";
import { View, Text, Image, Animated, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRegisterModalOverlay } from "@/hooks/useModalOverlayTracker";

export default function QRCodeModalScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.data?.id);
  const slideAnim = useRef(new Animated.Value(350)).current;
  const insets = useSafeAreaInsets();
  useRegisterModalOverlay();

  useEffect(() => {
    // Animate in when mounted
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      slideAnim.stopAnimation();
    };
  }, [slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 350,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  if (!userId) {
    router.back();
    return null;
  }

  const qrData = `https://api-461776259687.us-west2.run.app/customers/checkin/${userId}`;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={[
          styles.overlay,
          { bottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
      />
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          paddingBottom: insets.bottom + 16,
        }}
        className="bg-[#1A1A1A] rounded-t-3xl p-6"
      >
        {/* 🔹 QR Code Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white-100 text-xl font-bold">Your QR Code</Text>

          {/* 🔹 Close Button */}
          <TouchableOpacity onPress={handleClose} className="p-2">
            <FontAwesome6 name="circle-xmark" size={28} color="#F0F0F0" />
          </TouchableOpacity>
        </View>

        {/* 🔹 QR Code Image */}
        <View className="bg-black-100/80 p-5 rounded-2xl border border-white-100/10 items-center">
          <LinearGradient colors={["#FCA311", "#FFB84D"]} className="p-1 rounded-2xl">
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
              }}
              className="w-56 h-56 rounded-lg"
            />
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});

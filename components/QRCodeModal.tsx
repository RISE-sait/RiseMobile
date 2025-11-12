import React, { useState, useRef } from "react";
import { View, Modal, Text, Image, Animated, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCodeButton from "./buttons/QRCodeButton"; // ✅ Import the component
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // update this path if different


const QRCodeModal = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(350)).current; // Slightly larger modal
  const userId = useSelector((state: RootState) => state.user.data?.id);
  const insets = useSafeAreaInsets();
  if (!userId) return null;

  const qrData = `https://api-461776259687.us-west2.run.app/customers/checkin/${userId}`;



  const toggleModal = () => {
    if (!isModalVisible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 350,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };

  return (
    <>
      {/* 🔹 QR Code Button */}
      <View className="absolute top-8 left-10 z-50">
        <QRCodeButton onPress={toggleModal} />
      </View>

      {/* 🔹 Slide-Up Modal */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View className="flex-1 bg-black-100/70 justify-end">
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 16 }}
            className="bg-[#1A1A1A] rounded-t-3xl p-6"
          >
            {/* 🔹 QR Code Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white-100 text-xl font-bold">Your QR Code</Text>

              {/* 🔹 Close Button */}
              <TouchableOpacity onPress={toggleModal} className="p-2">
                <FontAwesome6 name="circle-xmark" size={28} color="#F0F0F0" />
              </TouchableOpacity>
            </View>

            {/* 🔹 QR Code Image */}
            <View className="bg-black-100/80 p-5 rounded-2xl border border-white-100/10 items-center">
              <LinearGradient colors={["#FCA311", "#FFD369"]} className="p-1 rounded-2xl">
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
      </Modal>
    </>
  );
};

export default QRCodeModal;

import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Modal, Text, Animated, TouchableOpacity, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import QRCodeButton from "./buttons/QRCodeButton";
import { useSelector } from "react-redux";
import { RootState } from "@/store";


const QRCodeModal = () => {
  const userId = useSelector((state: RootState) => state.user.data?.id);
  const [isModalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(350)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      slideAnim.stopAnimation();
    };
  }, [slideAnim]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Close modal whenever Home tab blurs so it never intercepts the next tab press
        slideAnim.stopAnimation();
        setModalVisible(false);
      };
    }, [slideAnim])
  );

  // Early return if no user logged in (AFTER all hooks)
  if (!userId) {
    return null;
  }

  const qrData = userId;

  const toggleModal = () => {
    if (__DEV__) {
      console.log(`[QRCodeModal] toggle -> ${!isModalVisible}`);
    }

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
      <Modal transparent visible={isModalVisible} animationType="fade" onRequestClose={toggleModal}>
        <TouchableOpacity
          className="flex-1 bg-black-100/70 justify-end"
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
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
            <View className="items-center">
              <View className="bg-white p-5 rounded-2xl">
                <QRCode
                  value={qrData}
                  size={300}
                  backgroundColor="white"
                  color="black"
                  ecl="H"
                  quietZone={10}
                />
              </View>
            </View>
            </Animated.View>
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default QRCodeModal;

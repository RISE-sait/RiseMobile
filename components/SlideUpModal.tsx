import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import images from "@/constants/images";
import { resolveImageSource } from "@/utils/imageSource";

interface SlideUpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SlideUpModal({ visible, onClose }: SlideUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        {/* Modal Content */}
        <View
          className="bg-gray-900 rounded-t-3xl p-6"
          style={{
            height: "75%", // Cover 3/4 of the screen
          }}
        >
          {/* Close Button (X Icon) */}
          <TouchableOpacity onPress={onClose} className="self-end mb-4">
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Content Area */}
          {isLoading ? (
            // Show a loading spinner while fetching QR code
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white-100  font-protest mt-4">Loading...</Text>
            </View>
          ) : qrCode ? (
            // Show the fetched QR code
            <View className="flex-1 justify-center items-center">
              <Image
                source={resolveImageSource(qrCode, images.qrcode)}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
              <Text className="text-white-100 font-Oswald-Bold text-2xl uppercase mt-4">Here is your QR Code!</Text>
            </View>
          ) : (
            // Show a fallback message if QR code is unavailable
            <Text className="text-white-100 text-center mt-4">
              Unable to load QR code. Please try again.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

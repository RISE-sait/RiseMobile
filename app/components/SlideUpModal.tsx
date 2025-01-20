import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the 'X' icon

export default function SlideUpModal({ visible, onClose, children }) {
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
          className="bg-white-100 rounded-t-3xl p-6"
          style={{
            height: "75%", // Cover 3/4 of the screen
          }}
        >
          {/* Close Button (X Icon) */}
          <TouchableOpacity onPress={onClose} className="self-end mb-4">
            <Ionicons name="close" size={24} color="#4B5563" />
          </TouchableOpacity>
          
          {/* Children Content */}
          {children}
        </View>
      </View>
    </Modal>
  );
}

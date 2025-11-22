import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const BackButton: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex items-start">
      <TouchableOpacity
        onPress={handleBack}
        className="bg-black-100/40 rounded-full items-center justify-center"
        style={{ height: 40, width: 40 }}
      >
        <FontAwesome6 name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;

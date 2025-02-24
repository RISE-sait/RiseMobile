import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const BackButton: React.FC = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="absolute top-10 left-4 bg-black-100/40 rounded-full items-center justify-center"
      style={{ height: 40, width: 40 }}
    >
      <FontAwesome6 name="arrow-left" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default BackButton;

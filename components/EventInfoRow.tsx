import React from "react";
import { View, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

interface EventInfoRowProps {
  icon: keyof typeof FontAwesome6.glyphMap;
  text: string;
}

const EventInfoRow: React.FC<EventInfoRowProps> = ({ icon, text }) => (
  <View className="flex-row items-center gap-4 mt-3">
    <FontAwesome6 name={icon} size={20} color="#FCA311" />
    <Text className="text-gray-300 text-base">{text}</Text>
  </View>
);

export default EventInfoRow;

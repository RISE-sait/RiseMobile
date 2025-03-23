import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

interface AccountOptionProps {
  icon: string;
  text: string;
  textColor?: string;
  iconColor?: string;
  onPress: () => void;
}

const AccountOption: React.FC<AccountOptionProps> = ({ icon, text, textColor = "#F0F0F0", iconColor = "#F0F0F0", onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7} // Prevents instant full-opacity change
      className="py-5 border-b border-gray-700"
    >
      <View className="flex-row items-center justify-between">
        {/* Left side (icon + text) */}
        <View className="flex-row items-center gap-5">
          <FontAwesome6 name={icon as any} size={22} color={iconColor} />
          <Text className="text-lg" style={{ color: textColor }}>{text}</Text>
        </View>
        {/* Right side (chevron icon) */}
        <FontAwesome6 name="chevron-right" size={18} color="#F0F0F0" />
      </View>
    </TouchableOpacity>
  );
};

export default AccountOption;

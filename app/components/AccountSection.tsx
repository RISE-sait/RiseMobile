import React from "react";
import { View, Text } from "react-native";
import AccountOption from "./AccountOption";

interface AccountSectionProps {
  title: string;
  items: {
    icon: string;
    text: string;
    textColor?: string;
    iconColor?: string;
    onPress: () => void;
  }[];
}

const AccountSection: React.FC<AccountSectionProps> = ({ title, items }) => {
  return (
    <View className="mt-8 bg-[#1A1A1A] p-6 rounded-2xl shadow-lg shadow-black">
      <Text className="text-gray-400 text-sm uppercase mb-4 tracking-wide">{title}</Text>
      {items.map((item, index) => (
        <AccountOption key={index} {...item} />
      ))}
    </View>
  );
};

export default AccountSection;

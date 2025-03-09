import React from "react";
import { View, Text } from "react-native";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, align = 'left' }) => (
  <View className="px-5 pb-3 border-b border-white-100/10 flex-row items-center justify-between">
    <Text className="text-white-100 text-3xl font-extrabold">
      {title}
    </Text>
    {subtitle && (
        <Text className="text-gray-400 text-base mt-1">{subtitle}</Text>
      )}
  </View>
);

export default PageTitle;

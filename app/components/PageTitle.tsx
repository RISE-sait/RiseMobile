import React from "react";
import { View, Text } from "react-native";

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => (
  <View className="px-5 pb-3 border-b border-white-100/10 flex-row items-center justify-between">
    <Text className="text-white-100 text-3xl font-extrabold">
      {title}
    </Text>
  </View>
);

export default PageTitle;

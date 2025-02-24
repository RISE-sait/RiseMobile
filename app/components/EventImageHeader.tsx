import React from "react";
import { View, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface EventImageHeaderProps {
  image: string;
}

const EventImageHeader: React.FC<EventImageHeaderProps> = ({ image }) => (
  <View className="relative">
    <Image source={{ uri: image }} className="w-full h-72" resizeMode="cover" />
    <LinearGradient
      colors={["transparent", "#121212"]}
      style={{ position: "absolute", bottom: 0, height: 100, width }}
    />
  </View>
);

export default EventImageHeader;

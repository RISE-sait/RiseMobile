import React from "react";
import { View, Text, Image } from "react-native";

type UpcomingCardProps = {
  title: string; // Title of the section (e.g., "UPCOMING CLASS")
  subtitle: string; // Subtitle or content 
  image: any; // Background image for the card
};

const UpcomingCard: React.FC<UpcomingCardProps> = ({ title, subtitle, image }) => {
  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">{title}</Text>
      <View className="bg-[#444444] h-28 rounded-xl overflow-hidden mt-3 flex justify-center items-center">
        <Image
          source={image}
          className="w-full h-full absolute"
          style={{ resizeMode: "cover", opacity: 0.6 }}
        />
        {/* Overlay to enhance contrast*/}
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
          }}
        />
        <Text className="text-white-100 font-Oswald-Bold text-xl">{subtitle}</Text>
      </View>
    </View>
  );
};

export default UpcomingCard;

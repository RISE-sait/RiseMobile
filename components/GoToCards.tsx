import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";

type NavigationOption = {
  label: string; // Button label
  route: string; // Route to navigate to
  image: any;     // Image source
};

type NavigationButtonsProps = {
  options: NavigationOption[]; // Array of navigation options
  handleNavigate: (route: string) => void; // Navigation handler
};

const GoToCards: React.FC<NavigationButtonsProps> = ({
  options,
  handleNavigate,
}) => {
  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">GO TO</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        className="mt-4"
      >
        <View className="flex flex-row space-x-4 gap-5">
          {options.map((option) => (
            <TouchableOpacity
              key={option.route}
              onPress={() => handleNavigate(option.route)}
              className="w-48 h-48 bg-[#444444] rounded-lg flex justify-center items-center overflow-hidden"
            >
              <ImageBackground
              source={option.image}
              className="w-full h-full flex justify-end"
              resizeMode="cover"
              >
                
              <View className="bg-black-100/50 p-3">
              <Text className="text-white-100 font-protest text-base">
                {option.label}
              </Text>
              </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default GoToCards;

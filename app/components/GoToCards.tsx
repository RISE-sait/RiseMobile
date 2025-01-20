import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

type NavigationOption = {
  label: string; // Button label
  route: string; // Route to navigate to
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
      <Text className="text-white-100 font-rubik-bold text-2xl">GO TO</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
      >
        <View className="flex flex-row space-x-4 gap-5">
          {options.map((option) => (
            <TouchableOpacity
              key={option.route}
              onPress={() => handleNavigate(option.route)}
              className="w-48 h-48 bg-[#444444] rounded-lg flex justify-center items-center"
            >
              <Text className="text-white-100 font-semibold text-base">
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default GoToCards;

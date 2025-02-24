import React from "react";
import { View, Text } from "react-native";

interface EventListContainerProps {
  date: string;
  children: React.ReactNode;
}

const EventListContainer: React.FC<EventListContainerProps> = ({ date, children }) => {
  return (
    <View className="flex-1 bg-[#1D1C1E] rounded-t-3xl p-5 shadow-lg shadow-black">
      <Text className="text-gold-100 text-lg font-bold mb-3">
        Matches & Trainings on {date}
      </Text>
      {children}
    </View>
  );
};

export default EventListContainer;

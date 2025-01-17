import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CoachBook = () => {
  const bookingOptions = [
    { title: "COURT", placeholder: "🏀" },
    { title: "WELLNESS", placeholder: "💆" },
    { title: "PODCAST ROOM", placeholder: "🎙️" },
    { title: "RECOVERY ROOM", placeholder: "🛌" },
    { title: "BARBER", placeholder: "💈" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-4 pt-5 items-center">
      {/* Header */}
      <View className="w-full flex-row items-center mb-8 px-4">
        <Text className="text-white text-2xl font-bold flex-1 text-center">
          BOOKING
        </Text>
      </View>

      {/* Booking Options */}
      <View className="flex-wrap flex-row justify-between w-[90%] gap-4">
        {bookingOptions.slice(0, 4).map((option, index) => (
          <TouchableOpacity
            key={index}
            className="w-[45%] h-56 bg-gray-800 rounded-3xl overflow-hidden shadow-lg mt-5 flex justify-center items-center"
          >
            {/* Placeholder Icon */}
            <View className="flex justify-center items-center bg-gray-700 w-16 h-16 rounded-full">
              <Text className="text-white text-3xl">{option.placeholder}</Text>
            </View>
            {/* Option Title */}
            <Text className="text-white font-bold text-2xl uppercase text-center mt-5">
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barber Button */}
      <TouchableOpacity className="w-[90%] h-40 bg-gray-800 rounded-xl overflow-hidden mt-10 shadow-lg flex justify-center items-center">
        {/* Placeholder Icon */}
        <View className="flex justify-center items-center bg-gray-700 w-16 h-16 rounded-full">
          <Text className="text-white text-3xl">💈</Text>
        </View>
        {/* Option Title */}
        <Text className="text-white font-bold text-2xl uppercase text-center mt-5">
          BARBER
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CoachBook;

import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageTitle from "@/app/components/PageTitle";
import BookingOptionButton from "@/app/components/BookingOption";

const AthleteBook = () => {
  const bookingOptions = [
    { title: "Basketball Court", icon: "basketball" },
    { title: "Gym", icon: "dumbbell" },
    { title: "Recovery Room", icon: "bed-pulse" },
    { title: "Physiotherapy", icon: "user-doctor" },
    { title: "Barber", icon: "scissors" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <PageTitle title="Athlete Bookings" />

      <ScrollView className="px-5 mt-4">
        <View className="flex-row flex-wrap justify-between">
          {bookingOptions.slice(0, 5).map((option) => (
            <BookingOptionButton
              key={option.title}
              title={option.title}
              icon={option.icon as any}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AthleteBook;

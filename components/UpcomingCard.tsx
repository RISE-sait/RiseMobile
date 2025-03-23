import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import EventDetailsModal from "./EventDetailsModal";

type UpcomingCardProps = {
  event: {
    id: string;
    date: string;
    homeTeam?: string;
    awayTeam?: string;
    status: "Upcoming" | "Finished" | "Live";
    location: string;
    description: string;
    homeLogo?: string;
    awayLogo?: string;
    bgImage?: string;
    type: "match" | "practice" | "class" | "meeting";
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Upcoming":
      return "text-yellow-400";
    case "Finished":
      return "text-gray-400";
    case "Live":
      return "text-red-500";
    default:
      return "text-white-100";
  }
};

const UpcomingCard: React.FC<UpcomingCardProps> = ({ event }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <View className="w-full px-10 mt-10">
          <Text className="text-white-100 font-Oswald-Bold text-2xl">
            UPCOMING {event.type.toUpperCase()}
          </Text>
          <View className="bg-[#444444] h-32 rounded-xl overflow-hidden mt-3 flex justify-center items-center relative">
            <Image
              source={{ uri: event.bgImage }}
              className="w-full h-full absolute"
              style={{ resizeMode: "cover", opacity: 0.6 }}
            />
            <View className="absolute inset-0 bg-black-100/50" />

            {/* Matches & Practices (Athlete & Coach) */}
            {event.homeTeam && event.awayTeam ? (
              <View className="flex-row items-center justify-center px-10">
              {/* Home Team */}
              <View className="flex items-center w-30">
                <Image source={{ uri: event.homeLogo }} className="w-16 h-16 mb-2" resizeMode="contain" />
                <Text className="text-white-100 font-Oswald-Medium uppercase text-xl text-center">
                  {event.homeTeam.split(" ")[0]}
                </Text>
                <Text className="text-white-100 font-Oswald-Medium uppercase text-xl text-center">
                  {event.homeTeam.split(" ")[1] || ""}
                </Text>
              </View>
            
              {/* VS in the center with more spacing */}
              <Text className="text-white-100 font-extrabold text-3xl tracking-wide mx-12">VS</Text>
            
              {/* Away Team */}
              <View className="flex items-center w-30">
                <Image source={{ uri: event.awayLogo }} className="w-16 h-16 mb-2" resizeMode="contain" />
                <Text className="text-white-100 font-Oswald-Medium uppercase text-xl text-center">
                  {event.awayTeam.split(" ")[0]}
                </Text>
                <Text className="text-white-100 font-Oswald-Medium uppercase text-xl text-center">
                  {event.awayTeam.split(" ")[1] || ""}
                </Text>
              </View>
            </View>            
            ) : (
              // Instructor Events (Classes/Meetings)
              <Text className="text-white-100 font-bold text-lg">{event.description}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* 🔹 Modal Inside the Card */}
      <EventDetailsModal isVisible={modalVisible} onClose={() => setModalVisible(false)} event={event} />
    </>
  );
};

export default UpcomingCard;

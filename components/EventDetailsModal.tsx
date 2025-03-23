import React, { useEffect, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, ImageBackground, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";

type EventDetailsModalProps = {
  isVisible: boolean;
  onClose: () => void;
  event: {
    id: string;
    date: string;
    homeTeam?: string;
    awayTeam?: string;
    homeScore?: number;
    awayScore?: number;
    league?: string;
    status: "Upcoming" | "Finished" | "Live";
    location: string;
    description: string;
    homeLogo?: string;
    awayLogo?: string;
    bgImage?: string;
    type: "match" | "practice" | "class" | "meeting";
  } | null;
};

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369" },
  Finished: { label: "Final", color: "#4ade80" },
  Live: { label: "Live", color: "#EF4444" },
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isVisible, onClose, event }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isVisible]);

  if (!event) return null;

  const { color, label } = statusStyles[event.status] || { color: "gray", label: event.status };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black-100/60 justify-center">
        <Animated.View style={{ opacity: fadeAnim }} className="mx-4 rounded-lg overflow-hidden bg-[#1A1A1A]">
          
          {/* Background Image with Gradient */}
          <ImageBackground
            source={{ uri: event.bgImage }}
            resizeMode="cover"
            className="h-[250px] w-full"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "transparent"]}
              className="absolute top-0 bottom-0 left-0 right-0"
            />
          </ImageBackground>

          {/* Event Details Content */}
          <View className="px-6 py-8">
            <View className="flex-row justify-between items-center">
              <Text className="text-white-100 text-2xl font-bold tracking-widest">
                {event.league || event.type.toUpperCase()}
              </Text>
              <View className="flex-row items-center gap-2">
                <FontAwesome6 name="circle-dot" size={14} color={color} />
                <Text className="font-semibold text-base uppercase" style={{ color }}>
                  {label}
                </Text>
              </View>
            </View>

            {/* Different Display for Different Event Types */}
            {event.type === "match" || event.type === "practice" ? (
              <View className="flex-row items-center justify-between my-6">
                <View className="items-center flex-1">
                  <Image source={{ uri: event.homeLogo }} className="w-16 h-16" resizeMode="contain" />
                  <Text className="text-white-100 text-lg font-semibold mt-2 text-center">
                    {event.homeTeam}
                  </Text>
                </View>

                <Text className="text-white-100 text-4xl font-extrabold">
                  {event.status === "Finished" ? `${event.homeScore} - ${event.awayScore}` : "VS"}
                </Text>

                <View className="items-center flex-1">
                  <Image source={{ uri: event.awayLogo }} className="w-16 h-16" resizeMode="contain" />
                  <Text className="text-white-100 text-lg font-semibold mt-2 text-center">
                    {event.awayTeam}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-white-100 text-xl font-bold text-center my-4">{event.description}</Text>
            )}

            <View className="border-t border-gray-700 my-4" />

            {/* Date & Location */}
            <View className="flex-row items-center gap-3 mb-4">
              <FontAwesome6 name="calendar-days" size={18} color="#FCA311" />
              <Text className="text-gray-300 text-base">
                {dayjs(event.date).format("dddd, MMMM D, YYYY")}
              </Text>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
              <FontAwesome6 name="location-dot" size={18} color="#FCA311" />
              <Text className="text-gray-300 text-base">{event.location}</Text>
            </View>

            {/* Description / Highlights */}
            <Text className="text-white-100 text-lg font-semibold mb-2">Event Details</Text>
            <Text className="text-gray-300 text-base leading-6">
              {event.description}
            </Text>

            {/* Close Button */}
            <TouchableOpacity onPress={onClose} className="mt-6 bg-red-500 p-3 rounded-lg">
              <Text className="text-white-100 text-center font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventDetailsModal;

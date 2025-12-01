import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Image, Animated, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { useRegisterModalOverlay } from "@/hooks/useModalOverlayTracker";

const statusStyles = {
  scheduled: { label: "SCHEDULED", color: "#FFD369" },
  in_progress: { label: "IN PROGRESS", color: "#EF4444" },
  completed: { label: "COMPLETED", color: "#4ade80" },
  canceled: { label: "CANCELED", color: "#6b7280" },
};

export default function EventDetailsModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const insets = useSafeAreaInsets();
  useRegisterModalOverlay();

  // Parse event data from params
  const event = params.event ? JSON.parse(params.event as string) : null;

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    animations.start();

    return () => {
      animations.stop();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim]);

  const handleClose = () => {
    router.back();
  };

  if (!event) {
    router.back();
    return null;
  }

  const { color, label } = statusStyles[event.status as keyof typeof statusStyles] || { color: "gray", label: event.status };
  const formattedDate = dayjs(event.date).format("dddd, MMMM D, YYYY");

  const getEventTypeLabel = () => {
    switch (event.type) {
      case "match":
        return "Game";
      case "practice":
        return "Practice";
      case "class":
        return "Class";
      case "meeting":
        return "Meeting";
      case "course":
        return "Course";
      default:
        return "Event";
    }
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={[
          styles.overlay,
          { bottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
      />
      <View style={styles.modalContainer}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-2xl"
          >
            {/* Background Image with Gradient */}
            <ImageBackground
              source={{
                uri:
                  typeof event.bgImage === "string"
                    ? event.bgImage
                    : "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
              }}
              resizeMode="cover"
              className="h-[80px] w-full"
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
                className="absolute top-0 bottom-0 left-0 right-0"
              />

              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/70 items-center justify-center z-10"
                activeOpacity={0.8}
              >
                <FontAwesome6 name="xmark" size={14} color="white" />
              </TouchableOpacity>

              {/* Status Badge */}
              <View
                className="absolute top-2 right-2 px-2 py-1 rounded-full flex-row items-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <FontAwesome6 name="circle-dot" size={10} color={color} />
                <Text className="font-bold text-xs ml-1 uppercase" style={{ color }}>
                  {label}
                </Text>
              </View>
            </ImageBackground>

            {/* Event Details Content */}
            <View className="px-4 py-4">
              {/* Title and Status */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-white-100 text-2xl font-bold tracking-wide mb-1">
                    {event.title || (event.type === "match" ? `${event.homeTeam} vs ${event.awayTeam}` : "Event")}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="px-2.5 py-1 bg-[#2A2A2A] rounded-md mr-2">
                      <Text className="text-gray-300 text-xs font-medium">{getEventTypeLabel()}</Text>
                    </View>
                    {event.league && (
                      <View className="px-2.5 py-1 bg-[#2A2A2A] rounded-md">
                        <Text className="text-gray-300 text-xs font-medium">{event.league}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Match Display */}
              {event.type === "match" && (
                <View className="flex-row items-center justify-between my-4 bg-[#222222] p-4 rounded-xl">
                  <View className="items-center flex-1">
                    {event.homeLogo ? (
                      <Image
                        source={{
                          uri:
                            typeof event.homeLogo === "string"
                              ? event.homeLogo
                              : "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
                        }}
                        className="w-16 h-16 rounded-full bg-[#2A2A2A]"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-[#2A2A2A] items-center justify-center">
                        <Text className="text-white-100 text-xl font-bold">{event.homeTeam?.charAt(0)}</Text>
                      </View>
                    )}
                    <Text className="text-white-100 text-base font-semibold mt-3 text-center">{event.homeTeam}</Text>
                  </View>

                  {event.status === "completed" ? (
                    <View className="items-center px-4 py-3 bg-[#2A2A2A] rounded-lg">
                      <Text className="text-white-100 text-3xl font-extrabold">
                        {event.homeScore} - {event.awayScore}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1 uppercase">Final Score</Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Text className="text-white-100 text-3xl font-extrabold">VS</Text>
                      {event.time && <Text className="text-[#FCA311] text-sm font-medium mt-1">{event.time}</Text>}
                    </View>
                  )}

                  <View className="items-center flex-1">
                    {event.awayLogo ? (
                      <Image
                        source={{
                          uri:
                            typeof event.awayLogo === "string"
                              ? event.awayLogo
                              : "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
                        }}
                        className="w-16 h-16 rounded-full bg-[#2A2A2A]"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-[#2A2A2A] items-center justify-center">
                        <Text className="text-white-100 text-xl font-bold">{event.awayTeam?.charAt(0)}</Text>
                      </View>
                    )}
                    <Text className="text-white-100 text-base font-semibold mt-3 text-center">{event.awayTeam}</Text>
                  </View>
                </View>
              )}

              <View className="border-t border-gray-800 my-3" />

              {/* Date, Time & Location */}
              <View className="mb-4 space-y-3">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-8 h-8 rounded-full bg-[#FCA311]/20 items-center justify-center">
                    <FontAwesome6 name="calendar-days" size={14} color="#FCA311" />
                  </View>
                  <View>
                    <Text className="text-gray-200 text-sm">{formattedDate}</Text>
                  </View>
                </View>

                {event.time && (
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-8 h-8 rounded-full bg-[#FCA311]/20 items-center justify-center">
                      <FontAwesome6 name="clock" size={14} color="#FCA311" />
                    </View>
                    <View>
                      <Text className="text-gray-200 text-sm items">{event.time}</Text>
                    </View>
                  </View>
                )}

                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-[#FCA311]/20 items-center justify-center">
                    <FontAwesome6 name="location-dot" size={14} color="#FCA311" />
                  </View>
                  <View>
                    <Text className="text-gray-200 text-sm">{event.location}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View className="bg-[#222222] p-3 rounded-xl mb-4">
                <Text className="text-white-100 text-base font-semibold mb-2">Event Details</Text>
                <Text className="text-gray-300 text-sm leading-5">{event.description}</Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity onPress={handleClose} className="bg-[#FCA311] p-3 rounded-xl" activeOpacity={0.8}>
                <Text className="text-white-100 text-center font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});

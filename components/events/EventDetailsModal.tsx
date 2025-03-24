"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, Modal, TouchableOpacity, ImageBackground, Image, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"
import dayjs from "dayjs"

type EventDetailsModalProps = {
  isVisible: boolean
  onClose: () => void
  event: {
    id: string
    date: string
    time?: string
    title?: string
    homeTeam?: string
    awayTeam?: string
    homeScore?: number
    awayScore?: number
    league?: string
    status: "Upcoming" | "Finished" | "Live"
    location: string
    description: string
    homeLogo?: string
    awayLogo?: string
    bgImage?: string
    type: "match" | "practice" | "class" | "meeting" | "event" | "course"
  } | null
}

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369" },
  Finished: { label: "Final", color: "#4ade80" },
  Live: { label: "Live", color: "#EF4444" },
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isVisible, onClose, event }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(100)).current

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
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
      ]).start()
    } else {
      fadeAnim.setValue(0)
      slideAnim.setValue(100)
    }
  }, [isVisible])

  if (!event) return null

  const { color, label } = statusStyles[event.status] || { color: "gray", label: event.status }

  // Format the date
  const formattedDate = dayjs(event.date).format("dddd, MMMM D, YYYY")

  // Get event type label
  const getEventTypeLabel = () => {
    switch (event.type) {
      case "match":
        return "Game"
      case "practice":
        return "Practice"
      case "class":
        return "Class"
      case "meeting":
        return "Meeting"
      case "course":
        return "Course"
      default:
        return "Event"
    }
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black-100/60 justify-center">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="mx-4 rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-2xl"
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
            className="h-[250px] w-full"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.2)"]}
              className="absolute top-0 bottom-0 left-0 right-0"
            />

            {/* Status Badge */}
            <View
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <FontAwesome6 name="circle-dot" size={14} color={color} />
              <Text className="font-bold text-sm ml-1.5 uppercase" style={{ color }}>
                {label}
              </Text>
            </View>
          </ImageBackground>

          {/* Event Details Content */}
          <View className="px-6 py-8">
            {/* Title and Status */}
            <View className="flex-row justify-between items-start mb-6">
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

            {/* Different Display for Different Event Types */}
            {event.type === "match" ? (
              <View className="flex-row items-center justify-between my-8 bg-[#222222] p-5 rounded-xl">
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

                {event.status === "Finished" ? (
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
            ) : null}

            <View className="border-t border-gray-800 my-4" />

            {/* Date, Time & Location */}
            <View className="mb-6 space-y-5">
              <View className="flex-row items-center gap-3 mb-5">
                <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center">
                  <FontAwesome6 name="calendar-days" size={18} color="#FCA311" />
                </View>
                <View>
                  <Text className="text-gray-200 text-base">{formattedDate}</Text>
                </View>
              </View>

              {event.time && (
                <View className="flex-row items-center gap-3 mb-5">
                  <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center">
                    <FontAwesome6 name="clock" size={18} color="#FCA311" />
                  </View>
                  <View>
                    <Text className="text-gray-200 text-base items">{event.time}</Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center">
                  <FontAwesome6 name="location-dot" size={18} color="#FCA311" />
                </View>
                <View>
                  <Text className="text-gray-200 text-base">{event.location}</Text>
                </View>
              </View>
            </View>

            {/* Description / Highlights */}
            <View className="bg-[#222222] p-4 rounded-xl mb-6">
              <Text className="text-white-100 text-lg font-semibold mb-2">Event Details</Text>
              <Text className="text-gray-300 text-base leading-6">{event.description}</Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity onPress={onClose} className="mt-2 bg-[#FCA311] p-4 rounded-xl" activeOpacity={0.8}>
              <Text className="text-white-100 text-center font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default EventDetailsModal


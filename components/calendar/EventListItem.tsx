import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

interface EventListItemProps {
  id: string;
  title: string;
  time: string;
  type?: "match" | "event";
}

const getEventIcon = (title: string, type: "match" | "event"): keyof typeof FontAwesome6.glyphMap => {
  const lowerTitle = title.toLowerCase();

  if (type === "match") return "trophy";

  if (lowerTitle.includes("basketball")) return "basketball";
  if (lowerTitle.includes("training") || lowerTitle.includes("gym")) return "dumbbell";
  if (lowerTitle.includes("meeting")) return "users";
  if (lowerTitle.includes("nutrition")) return "apple-whole";
  if (lowerTitle.includes("speed") || lowerTitle.includes("agility")) return "stopwatch";

  return "calendar";
};

const EventListItem: React.FC<EventListItemProps> = ({ id, title, time, type = "event" }) => {
  const router = useRouter();
  const iconName = getEventIcon(title, type);

  const handlePress = () => {
    router.push(
      type === "match"
        ? `/screens/match-details/${id}`
        : `/screens/event-details/${id}`
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={`rounded-xl p-5 mb-4 flex-row items-center shadow-lg shadow-black ${
        type === "match" ? "bg-gold-100/10" : "bg-[#4ade80]/10"
      }`}
    >
      <View className={`p-3 rounded-lg mr-4 ${type === "match" ? "bg-gold-100/40" : "bg-[#4ade80]/20"}`}>
        <FontAwesome6 name={iconName} size={20} color={type === "match" ? "#FCA311" : "#4ade80"} />
      </View>

      

      <View className="flex-1">
        <Text className="text-white-100 text-lg font-semibold tracking-wide">
          {title}
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          {time}
        </Text>
      </View>

      <FontAwesome6 name="chevron-right" size={16} color={type === "match" ? "#FCA311" : "#4ade80"} />
      </TouchableOpacity>
  );
};

export default EventListItem;

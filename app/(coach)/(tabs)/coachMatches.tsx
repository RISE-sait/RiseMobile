import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated } from "react-native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchCard from "../../../components/events/MatchCard";
import { StatusBar } from "expo-status-bar";
import { FontAwesome6 } from "@expo/vector-icons";
import { mockMatches } from '@/app/(athlete)/screens/matchesData';

const { width } = Dimensions.get("window");

// Generate a 14-day window (7 days before and 7 days ahead)
const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  return Array.from({ length: 14 }, (_, i) => today.add(i - 6, "day"));
};

const CoachMatches: React.FC = () => {
  const [matches] = useState(mockMatches);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [weekDates] = useState(generateWeekDates);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const todayIndex = weekDates.findIndex((date) => date.isSame(dayjs(), "day"));

    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: todayIndex, animated: true });
      }, 300);
    }
  }, []);

  const filteredMatches = matches.filter((match) =>
    dayjs(match.date).format("YYYY-MM-DD") === selectedDate
  );

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate;

    const label = item.isSame(dayjs(), "day")
      ? "Today"
      : item.isSame(dayjs().subtract(1, "day"), "day")
      ? "Yesterday"
      : item.isSame(dayjs().add(1, "day"), "day")
      ? "Tomorrow"
      : item.format("DD MMM");

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        className={`mx-1 rounded-lg items-center justify-center ${
          isSelected ? "bg-gold-100" : "bg-white-100/10"
        }`}
        style={{
          width: 70,
          height: 50,
          shadowColor: isSelected ? "#FCA311" : "#000",
          shadowOpacity: isSelected ? 0.5 : 0.1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
        }}
        onPress={() => setSelectedDate(item.format("YYYY-MM-DD"))}
      >
        <Text
          className={`font-semibold text-xs uppercase ${
            isSelected ? "text-black" : "text-gray-200"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        {/* Header */}
        <View className="px-6 pb-4 border-b border-white-100/10 flex-row justify-between items-center">
          <Text className="text-white-100 text-3xl font-bold">Matches</Text>
          <TouchableOpacity>
            <Text className="text-gold-100 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Calendar */}
        <FlatList
          ref={flatListRef}
          data={weekDates}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.format("YYYY-MM-DD")}
          renderItem={renderDateItem}
          contentContainerStyle={{ paddingHorizontal: width / 2 - 70, marginVertical: 15 }}
          getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
        />

        {/* Match Cards */}
        <ScrollView className="px-4">
          {filteredMatches.length ? (
            filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <View className="mt-10 items-center">
              <FontAwesome6 name="calendar-xmark" size={40} color="#555" />
              <Text className="text-gray-400 mt-3 font-semibold">
                No matches scheduled for this date.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CoachMatches;

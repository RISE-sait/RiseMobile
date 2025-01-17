import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchCard from "../components/MatchCard"; // Ensure this component matches your app's design
import { StatusBar } from "expo-status-bar";

// Define the structure of match data
interface Match {
  id: string;
  date: string; // ISO date format
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  league: string;
  status: string;
}

// Mock matches data
const mockMatches: Match[] = [
  {
    id: "1",
    date: dayjs().format("YYYY-MM-DD"), // Today's date
    homeTeam: "Team A",
    awayTeam: "Team B",
    homeScore: 2,
    awayScore: 1,
    league: "Premier League",
    status: "Finished",
  },
  {
    id: "2",
    date: dayjs().add(1, "day").format("YYYY-MM-DD"), // Tomorrow's date
    homeTeam: "Team C",
    awayTeam: "Team D",
    homeScore: 0,
    awayScore: 0,
    league: "Champions League",
    status: "Upcoming",
  },
  {
    id: "3",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"), // Yesterday's date
    homeTeam: "Team E",
    awayTeam: "Team F",
    homeScore: 3,
    awayScore: 2,
    league: "Europa League",
    status: "Finished",
  },
];

// Generate a week's worth of dates dynamically
const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  return Array.from({ length: 7 }, (_, i) => today.add(i - 3, "day"));
};

const InstructorMatches: React.FC = () => {
  const [matches] = useState<Match[]>(mockMatches); // Using mock data for now
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD")); // Current date
  const [weekDates] = useState<dayjs.Dayjs[]>(generateWeekDates); // Generate week dates

  // Filter matches based on the selected date
  const filteredMatches = matches.filter(
    (match) => dayjs(match.date).format("YYYY-MM-DD") === selectedDate
  );

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const renderDateItem = ({ item }: { item: dayjs.Dayjs }) => {
    const isSelected = item.format("YYYY-MM-DD") === selectedDate;

    // Logic for "Today", "Yesterday", and "Tomorrow"
    const label = item.isSame(dayjs(), "day")
      ? "Today"
      : item.isSame(dayjs().subtract(1, "day"), "day")
      ? "Yesterday"
      : item.isSame(dayjs().add(1, "day"), "day")
      ? "Tomorrow"
      : item.format("DD MMM"); // Display only the date (e.g., 07 Dec) for all other days

    return (
      <TouchableOpacity
        className={`flex items-center justify-center w-24 h-12 mx-2 rounded-md ${
          isSelected ? "bg-gold-200" : "bg-gray-800"
        }`}
        onPress={() => handleDateChange(item.format("YYYY-MM-DD"))}
      >
        <Text
          className={`text-sm ${
            isSelected ? "text-gray-900 font-bold" : "text-gray-300"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 pt-5 px-5">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        
      {/* Horizontal Calendar */}
      <FlatList
        data={weekDates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.format("YYYY-MM-DD")}
        renderItem={renderDateItem}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mt-8"
      />

      {/* Matches Header */}
      <Text className="text-gold-200 text-xl font-bold mt-6">
        Matches on {dayjs(selectedDate).format("DD MMM YYYY")}
      </Text>

      {/* Matches List */}
      <ScrollView className="flex-1 mt-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        ) : (
          <Text className="text-gray-400 text-center mt-6">
            No matches scheduled for this date.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InstructorMatches;

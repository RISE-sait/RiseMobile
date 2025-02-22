import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchCard from "../../components/MatchCard";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  league: string;
  status: "Upcoming" | "Finished" | "Live";
}

const mockMatches: Match[] = [
  {
    id: "1",
    date: dayjs().format("YYYY-MM-DD"),
    homeTeam: "New York Rangers",
    awayTeam: "Toronto Maple Leafs",
    homeScore: 3,
    awayScore: 2,
    league: "NHL",
    status: "Finished",
  },
  {
    id: "2",
    date: dayjs().add(1, "day").format("YYYY-MM-DD"),
    homeTeam: "LA Lakers",
    awayTeam: "Golden State Warriors",
    homeScore: 0,
    awayScore: 0,
    league: "NBA",
    status: "Upcoming",
  },
  {
    id: "3",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    homeTeam: "Real Madrid",
    awayTeam: "FC Barcelona",
    homeScore: 1,
    awayScore: 1,
    league: "LaLiga",
    status: "Live",
  },
];

const generateWeekDates = (): dayjs.Dayjs[] => {
  const today = dayjs();
  return Array.from({ length: 7 }, (_, i) => today.add(i - 3, "day"));
};

const MatchesScreen: React.FC = () => {
  const [matches] = useState<Match[]>(mockMatches);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [weekDates] = useState<dayjs.Dayjs[]>(generateWeekDates);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const todayIndex = weekDates.findIndex(
      (date) => date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    );
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: todayIndex, animated: true });
      }, 300);
    }
  }, []);

  const filteredMatches = matches.filter(
    (match) => dayjs(match.date).format("YYYY-MM-DD") === selectedDate
  );

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

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
        activeOpacity={0.9}
        style={{
          width: 90,
          height: 50,
          backgroundColor: isSelected ? "#FCA311" : "rgba(240, 240, 240, 0.1)",
          borderRadius: 14,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 8,
          shadowColor: isSelected ? "#FCA311" : "transparent",
          shadowOpacity: 0.8,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        }}
        onPress={() => handleDateChange(item.format("YYYY-MM-DD"))}
      >
        <Text
          style={{
            color: isSelected ? "#0C0B0B" : "#F0F0F0",
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingTop: 10 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* **Header** */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 12,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "#F0F0F0",
              fontSize: 24,
              fontWeight: "800",
            }}
          >
            🏆 Matches
          </Text>
          <TouchableOpacity>
            <Text style={{ color: "#FCA311", fontWeight: "bold" }}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* **Horizontal Calendar** */}
        <FlatList
          ref={flatListRef}
          data={weekDates}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.format("YYYY-MM-DD")}
          renderItem={renderDateItem}
          contentContainerStyle={{ paddingHorizontal: width / 2 - 100 }}
          initialScrollIndex={3}
          getItemLayout={(data, index) => ({
            length: 90,
            offset: 90 * index,
            index,
          })}
        />

        {/* **Matches List** */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)
          ) : (
            <Text
              style={{
                color: "#F0F0F0",
                fontSize: 16,
                textAlign: "center",
                marginTop: 30,
                fontWeight: "600",
              }}
            >
              No matches scheduled for this date.
            </Text>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MatchesScreen;

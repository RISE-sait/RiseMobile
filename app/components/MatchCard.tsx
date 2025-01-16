import React from "react";
import { View, Text } from "react-native";

interface MatchCardProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    league: string;
    status: string;
  };
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <View className="bg-gray-200 rounded-lg p-4 mb-4">
      <Text className="text-black-400 font-bold text-lg">{match.homeTeam} vs {match.awayTeam}</Text>
      <Text className="text-black-500">League: {match.league}</Text>
      <Text className="text-black-500">Status: {match.status}</Text>
      <Text className="text-gold-200 font-bold">
        {match.homeScore} - {match.awayScore}
      </Text>
    </View>
  );
};

export default MatchCard;
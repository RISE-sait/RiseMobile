import React from 'react';
import { View, Text } from 'react-native';

interface PlayerStatsCardProps {
  overallRating: number;
  pointsPerGame: number;
  assistsPerGame: number;
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  overallRating,
  pointsPerGame,
  assistsPerGame,
}) => (
  <View className="px-4 w-full my-5">
    <View className="bg-white-100/5 py-5 px-4 rounded-3xl shadow-lg shadow-black">
      <Text className="text-stats-100 text-xl font-bold uppercase text-center mb-4">
        Player Stats
      </Text>

      <View className="flex-row justify-around">
        <View className="items-center">
          <Text className="text-stats-200 text-2xl font-bold">
            {overallRating}
          </Text>
          <Text className="text-stats-100 text-sm">Rating</Text>
        </View>

        <View className="items-center">
          <Text className="text-stats-200 text-2xl font-bold">
            {pointsPerGame}
          </Text>
          <Text className="text-stats-100 text-sm">PPG</Text>
        </View>

        <View className="items-center">
          <Text className="text-stats-200 text-2xl font-bold">
            {assistsPerGame}
          </Text>
          <Text className="text-stats-100 text-sm">APG</Text>
        </View>
      </View>
    </View>
  </View>
);

export default PlayerStatsCard;

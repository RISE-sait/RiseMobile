import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import images from '@/constants/images';
import ProfileHeader from '@/app/components/ProfileHeader';
import PlayerStatsCard from '@/app/components/PlayerStatsCard';
import AnimatedButton from '@/app/components/AnimatedButton';

interface User {
  firstName: string;
  lastName: string;
  role: string;
  jerseyNumber: string;
  profileImage?: string;
  overallRating: number;
  pointsPerGame: number;
  assistsPerGame: number;
}

const AthleteProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <Text className="text-[#F0F0F0] text-base text-center mt-5">
          Loading Profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          number={user.jerseyNumber}
          profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
          logo={images.logo}
        />

        {/* Player Stats */}
        <PlayerStatsCard
          overallRating={user.overallRating}
          pointsPerGame={user.pointsPerGame}
          assistsPerGame={user.assistsPerGame}
        />

        {/* Training Schedule */}
        <AnimatedButton
          title="Training Schedule"
          onPress={() => router.push('/training-schedule')}
        />

        {/* Upcoming Matches */}
        <AnimatedButton
          title="Upcoming Matches"
          onPress={() => router.push('/upcoming-matches')}
        />

        {/* Logout */}
        <AnimatedButton
          title="Logout"
          onPress={handleLogout}
          customStyle="bg-red-100"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AthleteProfileScreen;

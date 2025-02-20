import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import images from '@/constants/images';
import { StatusBar } from 'expo-status-bar';
import RNPickerSelect from 'react-native-picker-select';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [team, setTeam] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [staffID, setStaffID] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !role) {
      console.warn('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      console.warn('Passwords do not match');
      return;
    }

    // Collect additional fields based on role
    const userData = {
      email,
      password,
      role,
      ...(role === 'athlete' && { playerNumber, team, dateOfBirth }),
      ...(role === 'coach' || role === 'instructor' ? { staffID } : {}),
    };

    try {
      console.log('User Signed Up:', userData);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <SafeAreaView className="bg-black-100 h-full">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="h-full">
          <Image source={images.onboarding} className="w-full h-52 mt-2" resizeMode="contain" />

          <View className="px-10 mt-5">
            <Text className="text-center uppercase font-bebas text-3xl text-gold-100 -mt-10">
              Join RISE Today
            </Text>
            <Text className="text-4xl text-center uppercase font-protest text-white-100 mt-2">
              Let’s Get You Started{"\n"}
              <Text className="text-gold-100">on Your Journey</Text>
            </Text>

            {/* Input Fields */}
            <View>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#fff"
                className="mt-8 border-b-2 border-gray-300 w-full"
                style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#fff"
                className="mt-8 border-b-2 border-gray-300 w-full"
                style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#fff"
                className="mt-8 border-b-2 border-gray-300 w-full"
                style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Role Dropdown */}
            <View className=" mt-5 border-b-2 border-gray-300">
              <RNPickerSelect
                onValueChange={(value) => setRole(value)}
                items={[
                  { label: 'Athlete', value: 'athlete' },
                  { label: 'Parent', value: 'parent' },
                  { label: 'Instructor', value: 'instructor' },
                  { label: 'Coach', value: 'coach' },
                ]}
                placeholder={{ label: 'Select your role...', value: '', color: '#9EA0A4' }}
                style={{
                  inputIOS: { fontSize: 14, fontFamily: "Oswald-Regular", color: "#fff", paddingVertical: 10 },
                  inputAndroid: { fontSize: 14, fontFamily: "Oswald-Regular", color: "#fff", paddingVertical: 10 },
                }}
              />
            </View>

            {/* Additional Fields for Athletes */}
            {role === 'athlete' && (
              <>
                <TextInput
                  placeholder="Player Number"
                  placeholderTextColor="#fff"
                  className="mt-5 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                  value={playerNumber}
                  onChangeText={setPlayerNumber}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Team Name"
                  placeholderTextColor="#fff"
                  className="mt-5 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                  value={team}
                  onChangeText={setTeam}
                />
                <TextInput
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#fff"
                  className="mt-5 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  keyboardType="numeric"
                />
              </>
            )}

            {/* Additional Fields for Coach & Instructor */}
            {(role === 'coach' || role === 'instructor') && (
              <TextInput
                placeholder="Staff ID"
                placeholderTextColor="#fff"
                className="mt-5 border-b-2 border-gray-300 w-full"
                style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                value={staffID}
                onChangeText={setStaffID}
              />
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              className="mt-8 bg-gold-100 rounded-full py-4"
              style={{ backgroundColor: "#FFD700", borderRadius: 25 }}
            >
              <Text className="text-center text-white font-bebas text-lg">
                Sign Up
              </Text>
            </TouchableOpacity>

            {/* Navigate to Login */}
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} className="mt-4">
              <Text className="text-center text-gold-100 font-bebas text-lg">
                Already have an account? Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

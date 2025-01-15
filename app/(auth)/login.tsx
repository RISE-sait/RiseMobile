import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { useAuth } from '../utils/auth';
import { SafeAreaView } from 'react-native-safe-area-context'

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="h-full">
        {/* Login screen image placeholder */}
        <View className="w-full h-3/6 bg-gray-300" />

        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome To RISE
          </Text>
          <Text className="text-3xl text-center uppercase font-rubik-bold text-black-300 mt-2">
            Where we help you RISE{"\n"}
            <Text className="text-primary-300">to the top</Text>
          </Text>

          <View>
            <TextInput
              placeholder="Enter your email"
              className="mt-5 border-b-2 border-gray-300 w-full"
            />
            <TextInput
              placeholder="Enter your password"
              className="mt-5 border-b-2 border-gray-300 w-full"
            />
          </View>

          <Text className="text-lg font-rubik-light text-black-200 mt-12 text-center">
            Login with Others!
          </Text>

          {/* Login buttons */}
          <View className="flex flex-row items-center justify-center gap-12">
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5"
            >
              <View className="w-5 h-5 bg-gray-300 rounded-full" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5"
            >
              <View className="w-5 h-5 bg-gray-300 rounded-full" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5"
            >
              <View className="w-5 h-5 bg-gray-300 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
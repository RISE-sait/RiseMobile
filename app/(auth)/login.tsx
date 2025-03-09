import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../utils/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { loginWithGoogle } from '@/app/utils/auth';



const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  // ✅ Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      Alert.alert("Google Login Successful", `Welcome, ${user.displayName}`);
    } catch (error) {
      Alert.alert("Google Login Failed", (error as Error).message);
    }
  };

  // ✅ Email/Password Login Handler
  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      console.log("User logged in:", user);
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  return (
    <SafeAreaView className='bg-black-100 h-full'>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName='h-full'>
          {/*Login screen image*/}
          <Image source={images.onboarding} className='w-full h-3/6' resizeMode='contain' />
          <View className='px-10'>
            <Text className='text-center uppercase font-bebas text-3xl text-gold-100 -mt-10'>
              Welcome To RISE
            </Text>
            <Text className='text-4xl text-center uppercase font-protest text-white-100 mt-2'>
              Where we help you RISE{"\n"}
              <Text className='text-gold-100'>to the top</Text>
            </Text>
            <View>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#fff"
                style={{
                  fontFamily: "Oswald-Regular",
                  fontSize: 14,
                  color: "#fff",
                }}
                className="mt-5 border-b-2 border-gray-300 w-full"
                value={email} // Bind the state
                onChangeText={setEmail} // Update the state
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#fff"
                style={{
                  fontFamily: "Oswald-Regular",
                  fontSize: 14,
                  color: "#fff",
                }}
                className="mt-8 border-b-2 border-gray-300 w-full"
                secureTextEntry // Hide password
                value={password} // Bind the state
                onChangeText={setPassword} // Update the state
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              className="mt-8 bg-gold-100 rounded-full py-4"
              style={{
                backgroundColor: "#FFD700", // Gold color
                borderRadius: 25,
              }}
            >
              <Text className="text-center text-white font-bebas text-lg">
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              className="mt-4"
            >
              <Text className="text-center text-gold-100 font-bebas text-lg">
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>

            <Text className='text-2xl font-bebas text-white-100 mt-10 text-center'>
              Login with Others!
            </Text>

            <View className="flex flex-row items-center justify-center gap-12">
              <TouchableOpacity
                className="rounded-full w-16 h-16 items-center justify-center mt-5"
                style={{
                  backgroundColor: "#fff", // Explicitly set white background
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 5, // For Android shadow
                }}
              >
                <Image source={icons.google} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGoogleLogin}
                className="rounded-full w-16 h-16 items-center justify-center mt-5"
                style={{
                  backgroundColor: "#fff", // Explicitly set white background
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 5, // For Android shadow
                }}
              >
                <Image source={icons.facebook} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-full w-16 h-16 items-center justify-center mt-5"
                style={{
                  backgroundColor: "#fff", // Explicitly set white background
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 5, // For Android shadow
                }}
              >
                <Image source={icons.apple} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
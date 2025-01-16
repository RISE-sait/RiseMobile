import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../utils/auth';
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images'
import icons from '@/constants/icons'
import { StatusBar } from 'expo-status-bar';

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
    <SafeAreaView className='bg-black-100 h-full'>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <ScrollView contentContainerClassName='h-full'>
        {/*Login screen image*/}
        <Image source={images.onboarding} className='w-full h-3/6' resizeMode='contain' />
        <View className='px-10'>
            <Text className='text-center uppercase font-bebas text-3xl text-gold-100 mt-0'>
                Welcome To RISE
            </Text>
            <Text className='text-4xl text-center uppercase font-protest text-white-100 mt-2'>
                Where we help you RISE{"\n"}
                <Text className='text-gold-100'>to the top</Text>
            </Text>
            <View>
                <TextInput
                    placeholder='Enter your email'
                    placeholderTextColor={'#fff'}
                    style={{ 
                      fontFamily: "Oswald-Regular",
                      fontSize: 14,
                      color: '#fff',
                    }}
                    className='mt-5 border-b-2 border-gray-300 w-full'
                />
                <TextInput
                    placeholder='Enter your password'
                    placeholderTextColor={'#fff'}
                    style={{ fontFamily: "Oswald-Regular", fontSize: 14 }}
                    className='mt-5 border-b-2 border-gray-300 w-full'
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
            <Text className='text-2xl font-bebas text-white mt-12 text-center'>
                Login with Others!
            </Text>

            {/*Login buttons*/}
            <View className='flex flex-row items-center justify-center gap-12'>
                <TouchableOpacity className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5">
                    <Image source={icons.google} className='w-5 h-5' resizeMode='contain' />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5">
                    <Image source={icons.facebook} className='w-5 h-5' resizeMode='contain' />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white shadow-md shadow-zinc-300 rounded-full w-16 h-16 items-center justify-center mt-5">
                    <Image source={icons.apple} className='w-5 h-5' resizeMode='contain' />
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>

  );
};

export default LoginScreen;
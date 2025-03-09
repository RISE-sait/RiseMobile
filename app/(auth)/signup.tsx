import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import images from '@/constants/images';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/app/utils/auth';

const SignUpScreen = () => {
  const {register,isLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [team, setTeam] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [staffID, setStaffID] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignUp = async () => {
    console.log("📢 handleSignUp called in SignUpScreen.tsx");
  
    if (!email || !password || !confirmPassword || !role) {
      console.warn("❌ All fields are required");
      return;
    }
  
    if (password !== confirmPassword) {
      console.warn("❌ Passwords do not match");
      return;
    }
  
    console.log("📢 Selected Role:", role); // Debugging Role Before Registering
  
    const firstName = email.split("@")[0]; // Extract first name from email
    const lastName = "User"; // Placeholder last name
    const age = role === "athlete" ? Number(dateOfBirth?.split("-")[0]) || 18 : 30; 
  
    try {
      console.log("📢 Calling register function from useAuth.ts...");
      
      await register(email, password, firstName, lastName, role, age);
  
      console.log("✅ Registration Successful");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("❌ Signup failed in SignUpScreen.tsx:", error);
    }
  };  
  

  return (
    <SafeAreaView className="bg-black-100 h-full">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Ensures taps outside close the keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerClassName="h-full" keyboardShouldPersistTaps="handled">
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
                  placeholderTextColor="#9EA0A4"
                  className="mt-8 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 16, color: "#fff" }}
                  value={email}
                  onChangeText={setEmail}
                />

                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9EA0A4"
                  className="mt-8 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 16, color: "#fff" }}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#9EA0A4"
                  className="mt-8 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 16, color: "#fff" }}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Role Picker */}
              <View className="mt-4 border-b-2 border-gray-300 h-12 justify-center">
                {Platform.OS === 'android' ? (
                  <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue)}
                    style={{ color: "#fff", fontSize: 16, fontFamily: "Oswald-Regular" }}
                    mode="dropdown"
                  >
                    <Picker.Item label="Select your role..." value="" color="#9EA0A4" />
                    <Picker.Item label="Athlete" value="athlete" />
                    <Picker.Item label="Parent" value="parent" />
                    <Picker.Item label="Instructor" value="instructor" />
                    <Picker.Item label="Coach" value="coach" />
                  </Picker>
                ) : (
                  <>
                    <TouchableOpacity 
                      onPress={() => setModalVisible(true)} 
                      style={{ borderBottomWidth: 1, borderColor: "#9EA0A4", paddingVertical: 10 }}
                    >
                      <Text style={{ color: role ? "#fff" : "#9EA0A4", fontSize: 16 }}>
                        {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Select your role..."}
                      </Text>
                    </TouchableOpacity>

                    {/* Modal for iOS */}
                    <Modal visible={modalVisible} transparent animationType="slide">
                      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
                            <Picker
                              selectedValue={role}
                              onValueChange={(itemValue) => {
                                setRole(itemValue);
                                setModalVisible(false);
                              }}
                              style={{ color: "black", fontSize: 16 }}
                            >
                              <Picker.Item label="Select your role..." value="" color="black" />
                              <Picker.Item label="Athlete" value="athlete" color="black" />
                              <Picker.Item label="Parent" value="parent" color="black" />
                              <Picker.Item label="Instructor" value="instructor" color="black" />
                              <Picker.Item label="Coach" value="coach" color="black" />
                            </Picker>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  </>
                )}
              </View>

               {/* Additional Fields for Athletes */}
            {role === 'athlete' && (
              <>
                <TextInput
                  placeholder="Player Number"
                  placeholderTextColor="#9EA0A4"
                  className="mt-5 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                  value={playerNumber}
                  onChangeText={setPlayerNumber}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Team Name"
                  placeholderTextColor="#9EA0A4"
                  className="mt-5 border-b-2 border-gray-300 w-full"
                  style={{ fontFamily: "Oswald-Regular", fontSize: 14, color: "#fff" }}
                  value={team}
                  onChangeText={setTeam}
                />
                <TextInput
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#9EA0A4"
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
                placeholderTextColor="#9EA0A4"
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
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignUpScreen;

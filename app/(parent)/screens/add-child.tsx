import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/app/utils/auth";
import BackButton from "@/app/components/BackButton";

export default function AddChildScreen() {
  const router = useRouter();
  const { registerChild } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sport, setSport] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required";
    
    // Validate date format (YYYY-MM-DD)
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      newErrors.dateOfBirth = "Use format YYYY-MM-DD";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddChild = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Calculate age from date of birth
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Get parent token from AsyncStorage
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) {
        throw new Error("Parent authentication required");
      }
      
      const parentData = JSON.parse(storedUser);
      const parentToken = parentData.token;
      
      if (!parentToken) {
        throw new Error("Parent token not found");
      }
      
      // Register child using the parent's token
      await registerChild(
        parentToken,
        firstName,
        lastName,
        age,
        parentData.countryCode || "US"
      );
      
      Alert.alert(
        "Success",
        "Child added successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to add child:", error);
      Alert.alert(
        "Error",
        "Failed to add child. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1">
          <View className="px-5 pt-12">
            <BackButton />
            
            <Text className="text-white text-2xl font-bold mt-4 mb-6">
              Add Your Child
            </Text>
            
            <View className="mb-4">
              <Text className="text-white mb-2">First Name</Text>
              <View className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${errors.firstName ? 'border border-[#FF4D4F]' : ''}`}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 text-white ml-2"
                  placeholder="Enter first name"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errors.firstName) {
                      setErrors({...errors, firstName: null});
                    }
                  }}
                />
              </View>
              {errors.firstName && <Text className="text-[#FF4D4F] mt-1">{errors.firstName}</Text>}
            </View>
            
            <View className="mb-4">
              <Text className="text-white mb-2">Last Name</Text>
              <View className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${errors.lastName ? 'border border-[#FF4D4F]' : ''}`}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 text-white ml-2"
                  placeholder="Enter last name"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (errors.lastName) {
                      setErrors({...errors, lastName: null});
                    }
                  }}
                />
              </View>
              {errors.lastName && <Text className="text-[#FF4D4F] mt-1">{errors.lastName}</Text>}
            </View>
            
            <View className="mb-4">
              <Text className="text-white mb-2">Date of Birth</Text>
              <View className={`bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center ${errors.dateOfBirth ? 'border border-[#FF4D4F]' : ''}`}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 text-white ml-2"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                  value={dateOfBirth}
                  onChangeText={(text) => {
                    setDateOfBirth(text);
                    if (errors.dateOfBirth) {
                      setErrors({...errors, dateOfBirth: null});
                    }
                  }}
                />
              </View>
              {errors.dateOfBirth && <Text className="text-[#FF4D4F] mt-1">{errors.dateOfBirth}</Text>}
            </View>
            
            <View className="mb-4">
              <Text className="text-white mb-2">Sport (Optional)</Text>
              <View className="bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons name="basketball-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 text-white ml-2"
                  placeholder="e.g. Basketball, Soccer"
                  placeholderTextColor="#666"
                  value={sport}
                  onChangeText={setSport}
                />
              </View>
            </View>
            
            <View className="mb-8">
              <Text className="text-white mb-2">Jersey Number (Optional)</Text>
              <View className="bg-[#1A1A1A] rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons name="shirt-outline" size={20} color="#666" />
                <TextInput
                  className="flex-1 text-white ml-2"
                  placeholder="e.g. 23"
                  placeholderTextColor="#666"
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>
            
            <TouchableOpacity
              className="mb-8"
              onPress={handleAddChild}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold text-lg">Add Child</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <Text className="text-gray-400 text-center mb-8">
              By adding your child, you confirm that you are the legal guardian and have the authority to register them.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

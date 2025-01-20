import React from "react";
import { View, Text, Image } from "react-native";

const ProfileHeader = ({
    firstName,
    lastName,
    role,
    number,
    profileImage,
    logo,
  }: {
    firstName: string;
    lastName: string;
    role: string;
    number: string;
    profileImage: any;
    logo: any;
  }) => {
    return (
      <View className="w-full px-4 mt-10">
        <View className="bg-[#B59422] h-60 rounded-3xl overflow-hidden relative flex px-4 items-center">
          {/* Logo */}
          <View className="absolute top-4 left-4 flex flex-row items-center">
            <Image
              source={logo}
              className="w-10 h-10"
              style={{ resizeMode: "contain" }}
            />
          </View>
  
          {/* Large Number */}
          <Text
            className="text-white-100 font-bold text-[170px] absolute right-4 bottom-2 opacity-25"
            style={{ zIndex: 1 }}
          >
            {number}
          </Text>
  
          {/* Profile Image */}
          <Image
            source={profileImage}
            className="absolute w-52 h-52 right-4 bottom-0"
            style={{ resizeMode: "cover", borderRadius: 10, zIndex: 2 }}
          />
  
          {/* Name and Role */}
          <View className="absolute bottom-4 left-4">
            <Text className="text-white-100 font-Oswald-Bold text-4xl uppercase">
              {firstName}
            </Text>
            <Text className="text-white-100 font-Oswald-Bold text-4xl uppercase">
              {lastName}
            </Text>
            <Text className="text-black font-protest text-base">{role}</Text>
          </View>
        </View>
      </View>
    );
  };

export default ProfileHeader;
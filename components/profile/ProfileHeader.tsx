import React from "react";
import { View, Text, Image } from "react-native";
import Flag from "react-native-country-flag"; // 🏳️ Import country flag component

const ProfileHeader = ({
  firstName,
  lastName,
  role,
  number,
  profileImage,
  countryCode, // ✅ Now expects a country code
  teamLogo, // ✅ Allows a future team logo
}: {
  firstName: string;
  lastName: string;
  role: string;
  number: string;
  profileImage: any;
  countryCode?: string; // ✅ Country code is optional
  teamLogo?: any; // ✅ Team logo is optional
}) => {

  const safeCountryCode = countryCode ? countryCode.toLowerCase() : "us"; 

  return (
    <View className="w-full px-4 mt-10">
      <View className="bg-gold-100 h-60 rounded-3xl overflow-hidden relative flex px-4 items-center">
        
        {/* Country Flag or Team Logo */}
        <View className="absolute top-4 left-4 flex flex-row items-center">
          {countryCode ? (
            <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <Flag isoCode={countryCode} size={40} style={{ width: "100%", height: "100%" }} />
            </View>
          ) : teamLogo ? (
            <Image source={teamLogo} className="w-10 h-10" style={{ resizeMode: "contain" }} />
          ) : null}
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
          <Text className="text-black-100 font-protest text-base uppercase">{role}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;

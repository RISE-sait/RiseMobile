import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
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
  const router = useRouter();

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

        {/* Profile Image with Camera Button */}
        <View className="absolute right-4 bottom-0">
          <Image
            source={profileImage}
            className="w-52 h-52"
            style={{ resizeMode: "cover", borderRadius: 10, zIndex: 2 }}
          />
          <TouchableOpacity
            className="absolute bottom-2 right-2 bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
            style={{ zIndex: 3 }}
            onPress={() => router.push("/screens/edit-profile")}
          >
            <FontAwesomeIcon icon={faCamera} color="#FFFFFF" size={16} />
          </TouchableOpacity>
        </View>

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

import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images"; 
import { StatusBar } from "expo-status-bar";
import GoToCards from "../components/GoToCards";
import UpcomingCard from "../components/UpcomingCard";

export default function InstructorHomeScreen() {
  const handleNavigate = (route) => {
    console.log(`Navigating to ${route}`);
  };

  const navigationOptions = [
    { label: "Class List", route: "/classList" },
    { label: "Course List", route: "/courseList" },
    { label: "Attendance", route: "/attendance" },
    { label: "Grades", route: "/grades" },
  ];

  return (
    <SafeAreaView className="bg-gray-800 flex-1">
        <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>

        {/* QR Code Button */}
        <View className="absolute top-8 left-10 z-50">
          <TouchableOpacity
            onPress={() => console.log("QR Code Button Pressed")}
            className="w-12 h-12 bg-gray-900 rounded-full flex justify-center items-center shadow-md"
          >
            <Image
              source={images.qrcode} 
              className="w-6 h-6"
              style={{ resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View className="w-full px-10 mt-28">
          <View className="bg-[#B59422] h-60 rounded-3xl overflow-hidden relative flex px-4 items-center">
            <View className="absolute top-4 left-4 flex flex-row items-center">
              <Image
                source={images.schoolLogo} 
                className="w-10 h-10 mt-2"
                style={{ resizeMode: "contain" }}
              />
            </View>
            {/* Number with Opacity (Placed Behind the Image) */}
            <Text
              className="text-white font-bold text-[170px] absolute right-4 bottom-2 opacity-25"
              style={{ zIndex: 1 }}
            >
              34
            </Text>

            {/* Headshot Image */}
            <Image
              source={images.instructorHeadshot} 
              className="absolute w-52 h-52 right-4 bottom-0"
              style={{ resizeMode: "cover", borderRadius: 10, zIndex: 2 }}
            />

            {/* Name and Department Info */}
            <View className="absolute bottom-4 left-4">
              {/* First Name */}
              <Text className="text-white-100 font-Oswald-SemiBold text-4xl uppercase">Sarah</Text>
              
              {/* Last Name */}
              <Text className="text-white-100 font-Oswald-SemiBold text-4xl uppercase">Smith</Text>
              {/* Department */}
              <Text className="text-black-100 font-Oswald-Bold text-base mb-1">E-Commerce</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Card Section */}
        <UpcomingCard
          title="UPCOMING CLASS"
          subtitle="CS101- Intro To Coaching"
          image={images.classImage}
        />

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={handleNavigate} />
      </ScrollView>
    </SafeAreaView>
  );
}
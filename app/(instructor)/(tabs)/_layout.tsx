import { View, Text, Image } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import icons from "@/constants/icons";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "#FCA311" : "#666876"} // Adjust tint color for focus
      resizeMode="contain"
      className="w-6 h-6"
    />
    <Text
      className={`${
        focused
          ? "text-gold-100 font-rubik-medium"
          : "text-gray-900 font-rubik"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  return (
  
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "black",
          position: "absolute",
          borderTopColor: "transparent",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="instructorHome"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} title="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="instructorMatches"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.matches} title="Matches" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="instructorCalendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.calendar} title="Calendar" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="instructorBook"
        options={{
          title: "Book",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.booking} title="Book" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="instructorProfile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} title="Profile" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="membership" options={{ href: null, headerShown: false }} />

    </Tabs>
    
    
  );
};

export default TabsLayout;

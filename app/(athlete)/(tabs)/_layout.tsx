import { View, Text, Image } from "react-native";
import React, { useCallback } from "react";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import { useModalOverlayPresence } from "@/hooks/useModalOverlayTracker";

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasGlobalModal = useModalOverlayPresence();

  const interceptTabPress = useCallback(
    (targetRoute: string) => ({
      tabPress: (event: { preventDefault: () => void }) => {
        if (__DEV__) {
          console.log(
            `[AthleteTabs] tabPress -> ${targetRoute} (hasGlobalModal=${hasGlobalModal})`,
          );
        }

        if (!hasGlobalModal) {
          return;
        }

        event.preventDefault();
        router.back();
        requestAnimationFrame(() => {
          router.replace(targetRoute);
        });
      },
    }),
    [hasGlobalModal, router],
  );

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
          paddingBottom: insets.bottom,
          height: 70 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} title="Home" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(athlete)/(tabs)/home")}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.matches} title="Matches" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(athlete)/(tabs)/matches")}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.calendar} title="Calendar" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(athlete)/(tabs)/calendar")}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: "Book",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.booking} title="Book" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(athlete)/(tabs)/book")}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} title="Profile" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(athlete)/(tabs)/profile")}
      />
    </Tabs>
    
    
  );
};

export default TabsLayout;

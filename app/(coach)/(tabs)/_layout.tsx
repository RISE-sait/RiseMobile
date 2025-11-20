import { View, Text, Image } from "react-native";
import React, { useCallback, useEffect } from "react";
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
      className={`${focused
          ? "text-gold-100 font-rubik-medium"
          : "text-gray-900 font-rubik"
        } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const CoachTabsLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasGlobalModal = useModalOverlayPresence();

  useEffect(() => {
    if (__DEV__) {
      console.log(`[CoachTabs] hasGlobalModal changed -> ${hasGlobalModal}`);
    }
  }, [hasGlobalModal]);

  const interceptTabPress = useCallback(
    (targetRoute: string) => ({
      tabPress: (event: { preventDefault: () => void }) => {
        if (__DEV__) {
          console.log(
            `[CoachTabs] tabPress -> ${targetRoute} (hasGlobalModal=${hasGlobalModal})`,
          );
        }

        if (!hasGlobalModal) {
          if (__DEV__) {
            console.log(`[CoachTabs] allowing navigation to ${targetRoute}`);
          }
          return;
        }

        event.preventDefault();
        if (__DEV__) {
          console.log(`[CoachTabs] preventing default navigation, manually replacing route`);
        }
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
        name="coachHome"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} title="Home" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(coach)/(tabs)/coachHome")}
      />
      <Tabs.Screen
        name="coachMatches"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.matches} title="Matches" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(coach)/(tabs)/coachMatches")}
      />
      <Tabs.Screen
        name="coachCalendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.calendar} title="Calendar" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(coach)/(tabs)/coachCalendar")}
      />
      <Tabs.Screen
        name="coachBook"
        options={{
          title: "Book",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.booking} title="Book" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(coach)/(tabs)/coachBook")}
      />
      <Tabs.Screen
        name="coachProfile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} title="Profile" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(coach)/(tabs)/coachProfile")}
      />
    </Tabs>


  );
};

export default CoachTabsLayout;

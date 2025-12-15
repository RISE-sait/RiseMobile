import { View, Text, Image } from "react-native";
import React, { useCallback, useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import { useModalOverlayPresence } from "@/hooks/useModalOverlayTracker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeams } from "@/store/slices/teamsSlice";
import { fetchCourts } from "@/store/slices/courtsSlice";
import { useAuth } from "@/utils/auth";

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
      tintColor={focused ? "#FCA311" : "#666876"}
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

const TabIconVector = ({
  focused,
  IconComponent,
  iconName,
  title,
}: {
  focused: boolean;
  IconComponent: any;
  iconName: string;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <IconComponent
      name={iconName}
      size={24}
      color={focused ? "#FCA311" : "#666876"}
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

const AdminTabsLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasGlobalModal = useModalOverlayPresence();
  const dispatch = useAppDispatch();
  const { getValidToken } = useAuth();
  const user = useAppSelector((state) => state.user.data);

  // Fetch initial data when admin tabs load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = await getValidToken();
        if (token && user?.id) {
          console.log("[AdminTabs] Fetching teams and courts...");
          dispatch(fetchTeams(token));
          dispatch(fetchCourts(token));
        }
      } catch (error) {
        console.error("[AdminTabs] Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (__DEV__) {
      console.log(`[AdminTabs] hasGlobalModal changed -> ${hasGlobalModal}`);
    }
  }, [hasGlobalModal]);

  const interceptTabPress = useCallback(
    (targetRoute: string) => ({
      tabPress: (event: { preventDefault: () => void }) => {
        if (__DEV__) {
          console.log(
            `[AdminTabs] tabPress -> ${targetRoute} (hasGlobalModal=${hasGlobalModal})`,
          );
        }

        if (!hasGlobalModal) {
          if (__DEV__) {
            console.log(`[AdminTabs] allowing navigation to ${targetRoute}`);
          }
          return;
        }

        event.preventDefault();
        if (__DEV__) {
          console.log(`[AdminTabs] preventing default navigation, manually replacing route`);
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
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} title="Dashboard" focused={focused} />
          ),
        }}
        listeners={interceptTabPress("/(admin)/(tabs)/dashboard")}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIconVector
              IconComponent={Ionicons}
              iconName="people"
              title="Customers"
              focused={focused}
            />
          ),
        }}
        listeners={interceptTabPress("/(admin)/(tabs)/customers")}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: "Staff",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIconVector
              IconComponent={MaterialIcons}
              iconName="badge"
              title="Staff"
              focused={focused}
            />
          ),
        }}
        listeners={interceptTabPress("/(admin)/(tabs)/staff")}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "Manage",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIconVector
              IconComponent={Ionicons}
              iconName="grid"
              title="Manage"
              focused={focused}
            />
          ),
        }}
        listeners={interceptTabPress("/(admin)/(tabs)/manage")}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIconVector
              IconComponent={Ionicons}
              iconName="menu"
              title="More"
              focused={focused}
            />
          ),
        }}
        listeners={interceptTabPress("/(admin)/(tabs)/more")}
      />
    </Tabs>
  );
};

export default AdminTabsLayout;

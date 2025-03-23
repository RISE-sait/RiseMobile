import { Tabs } from "expo-router"
import { View, Image, Text } from "react-native"
import icons from "@/constants/icons"
import { Stack } from "expo-router"
import { CartProvider } from "../(athlete)/screens/store/cartContext"

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean
  icon: any
  title: string
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      style={{ tintColor: focused ? "#876A1D" : "#ffffff" }}
      resizeMode="contain"
      className="w-6 h-6"
    />
    <Text
      className={`${
        focused ? "text-gold-100 font-protest" : "text-white-100 font-protest"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
)

const InstructorTabLayout = () => {
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
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.home} title="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="instructorMatches"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.matches} title="Matches" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="instructorCalendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.calendar} title="Calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="instructorBook"
        options={{
          title: "Book",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.booking} title="Book" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="instructorProfile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.person} title="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

export default function AppLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ✅ Main Tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* ✅ Screens inside "screens/" */}
        <Stack.Screen name="screens" options={{ headerShown: false }} />
        <Stack.Screen name="(instructor)" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  )
}

export function InstructorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0C0B0B" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/classList" options={{ headerShown: false }} />
      <Stack.Screen name="screens/courseList" options={{ headerShown: false }} />
      <Stack.Screen name="screens/attendance" options={{ headerShown: false }} />
      <Stack.Screen name="screens/grades" options={{ headerShown: false }} />
    </Stack>
  )
}


import { View, Text, Image } from "react-native"
import { Tabs } from "expo-router"
import icons from "@/constants/icons"

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
      tintColor={focused ? "#FCA311" : "#666876"} // Adjust tint color for focus
      resizeMode="contain"
      className="w-6 h-6"
    />
    <Text
      className={`${
        focused ? "text-gold-100 font-rubik-medium" : "text-gray-900 font-rubik"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
)

const ParentTabsLayout = () => {
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
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.home} title="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: "Children",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.family} title="Children" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.calendar} title="Calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.person} title="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

export default ParentTabsLayout


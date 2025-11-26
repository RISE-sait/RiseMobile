import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";

export type NavigationOption = {
  label: string;
  route: string;
  icon: React.ComponentProps<typeof FontAwesome6>["name"];
  description?: string;
  colors?: [string, string];
  iconColor?: string;
};

type NavigationButtonsProps = {
  options: NavigationOption[];
  handleNavigate: (route: string) => void;
};

const DEFAULT_GRADIENTS: [string, string][] = [
  ["#1F1F1F", "#0C0B0B"],
  ["#1A120E", "#0C0B0B"],
  ["#1B1B2F", "#0C0B0B"],
  ["#0F2027", "#203A43"],
];

const CARD_CONTAINER_STYLE = {
  width: 192,
  height: 192,
  borderRadius: 28,
  padding: 20,
  justifyContent: "space-between" as const,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
}

const ICON_CONTAINER_STYLE = {
  width: 56,
  height: 56,
  borderRadius: 18,
  backgroundColor: "rgba(255,255,255,0.14)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  alignItems: "center" as const,
  justifyContent: "center" as const,
}

const GoToCardsComponent: React.FC<NavigationButtonsProps> = ({
  options,
  handleNavigate,
}) => {
  const resolvedOptions = useMemo(
    () =>
      options.map((option, index) => ({
        ...option,
        gradient: option.colors || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length],
      })),
    [options]
  )

  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">GO TO</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
        <View className="flex flex-row space-x-4 gap-5">
          {resolvedOptions.map((option) => (
            <TouchableOpacity
              key={option.route}
              onPress={() => handleNavigate(option.route)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={option.gradient} style={CARD_CONTAINER_STYLE}>
                <View style={ICON_CONTAINER_STYLE}>
                  <FontAwesome6
                    name={option.icon}
                    size={26}
                    color={option.iconColor || "#F8FAFC"}
                  />
                </View>
                <View>
                  <Text className="text-white-100 font-Oswald-Bold text-2xl">
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text className="text-white-100/70 font-rubik mt-1 text-xs">
                      {option.description}
                    </Text>
                  ) : null}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(GoToCardsComponent);

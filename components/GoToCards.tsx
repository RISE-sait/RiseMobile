import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";

export type NavigationOption = {
  label: string;
  route: string;
  icon: React.ComponentProps<typeof FontAwesome6>["name"];
  description?: string;
  colors?: [string, string];
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

const GoToCards: React.FC<NavigationButtonsProps> = ({
  options,
  handleNavigate,
}) => {
  return (
    <View className="w-full px-10 mt-10">
      <Text className="text-white-100 font-Oswald-Bold text-2xl">GO TO</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
        <View className="flex flex-row space-x-4 gap-5">
          {options.map((option, index) => {
            const gradient = option.colors || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
            return (
              <TouchableOpacity
                key={option.route}
                onPress={() => handleNavigate(option.route)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={gradient}
                  style={{
                    width: 192,
                    height: 192,
                    borderRadius: 28,
                    padding: 20,
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome6 name={option.icon} size={26} color="#FCA311" />
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
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default GoToCards;

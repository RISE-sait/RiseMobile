import React, { useRef } from "react";
import { Animated, TouchableOpacity, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

interface BookingOptionButtonProps {
  title: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  wide?: boolean;
  onPress?: () => void;
  route?: string;
}

const BookingOptionButton: React.FC<BookingOptionButtonProps> = ({
  title,
  icon,
  wide = false,
  onPress = () => {},
  route,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (route) {
      router.push(route);
    } else {
      onPress();
    }
  }

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.93, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
      className={`${wide ? "w-full" : "w-full"} my-2 rounded-3xl shadow-2xl shadow-black overflow-hidden`}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl px-4 items-center border border-white-100/20 backdrop-blur-lg overflow-hidden"
          style={{ paddingLeft: Platform.OS === "ios" ? 5 : 0}}
        >
          <View 
            className="bg-gold-100 w-16 h-16 rounded-full items-center justify-center mb-4 shadow-lg shadow-black/50"
            style={{ marginTop: 10 }}>
            <FontAwesome6 name={icon} size={28} color="#0C0B0B" />
          </View>
          <Text
            className={`text-white-100 text-xl font-extrabold uppercase tracking-[2px] ${
              Platform.OS === "ios" ? "ml-2 mb-2" : "text-center"
            }`}
          >
            {title}
          </Text>

        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default BookingOptionButton;

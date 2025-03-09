import React, { useRef } from "react";
import { TouchableOpacity, Animated, GestureResponderEvent, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

interface QRCodeButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const QRCodeButton: React.FC<QRCodeButtonProps> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      className="rounded-full"
    >
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="w-14 h-14 bg-[#1A1A1A] rounded-full flex justify-center items-center border border-white-100/10"
      >
        <View className="w-12 h-12 bg-[#2c2a2a] rounded-full flex justify-center items-center">
          <FontAwesome6 name="qrcode" size={26} color="#FCA311" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default QRCodeButton;

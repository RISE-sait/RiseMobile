import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, View } from 'react-native';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  added?: boolean;
  customStyle?: string;
  customTextStyle?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled = false,
  added = false,
  customStyle = '',
  customTextStyle = '',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="w-full self-center">
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || added}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`
          flex-row items-center justify-center
          py-4 px-5 rounded-full mt-5 shadow-lg
          ${added ? 'bg-[#1D1C1E]' : 'bg-[#FCA311]'}
          ${disabled ? 'opacity-60' : 'opacity-100'}
          ${customStyle}
        `}
        style={{
          shadowColor: '#FCA311',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }}
      >
        <Text
          className={`text-[#0C0B0B] font-bold uppercase text-lg tracking-wide ${customTextStyle}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;

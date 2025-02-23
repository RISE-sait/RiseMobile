import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  added?: boolean;
  customStyle?: ViewStyle;
  customTextStyle?: TextStyle;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled = false,
  added = false,
  customStyle = {},
  customTextStyle = {},
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || added}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: added ? '#1D1C1E' : '#FCA311',
            shadowColor: '#FCA311',
            opacity: disabled ? 0.6 : 1,
          },
          customStyle,
        ]}
      >
        <Text style={[styles.text, customTextStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    width: '100%',
    alignSelf: 'center',
  },
  text: {
    color: "#0C0B0B",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase", 
    letterSpacing: 1,
  },
});

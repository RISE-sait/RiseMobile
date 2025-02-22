import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AthleteBook = () => {
  // Booking options for athletes
  const bookingOptions = [
    { title: "TRAINING FIELD", icon: "⚽" },
    { title: "GYM", icon: "🏋️" },
    { title: "RECOVERY ROOM", icon: "🛌" },
    { title: "PHYSIOTHERAPY", icon: "💆" },
    { title: "NUTRITIONIST", icon: "🥗" },
  ];

  // Animated press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingTop: 10 }}>
      {/* **Header** */}
      <View
        style={{
          paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#F0F0F0", fontSize: 24, fontWeight: "800" }}>
          🏆 Athlete Bookings
        </Text>
      </View>

      {/* **Booking Options Grid** */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        {bookingOptions.slice(0, 4).map((option, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [{ scale: scaleAnim }],
              width: width * 0.44,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              paddingVertical: 20,
              borderRadius: 20,
              marginBottom: 16,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#FCA311",
              shadowOpacity: 0.5,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  width: 60,
                  height: 60,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 32, color: "#F0F0F0" }}>{option.icon}</Text>
              </View>
              <Text
                style={{
                  color: "#F0F0F0",
                  fontSize: 16,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* **Special Booking Option: Nutritionist** */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          width: "90%",
          alignSelf: "center",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          paddingVertical: 20,
          borderRadius: 20,
          marginTop: 20,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#FCA311",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              width: 60,
              height: 60,
              borderRadius: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 32, color: "#F0F0F0" }}>🥗</Text>
          </View>
          <Text
            style={{
              color: "#F0F0F0",
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "uppercase",
              marginTop: 10,
              textAlign: "center",
            }}
          >
            NUTRITIONIST
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AthleteBook;

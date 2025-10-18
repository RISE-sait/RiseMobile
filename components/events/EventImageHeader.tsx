import React, { useState } from "react";
import { View, Image, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

// Default fallback image URL
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

interface EventImageHeaderProps {
  image?: string | null;
}

const EventImageHeader: React.FC<EventImageHeaderProps> = ({ image }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use provided image or fallback to default
  const imageSource = (image && !hasError) ? image : DEFAULT_IMAGE;

  return (
    <View className="relative">
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Event image */}
      <Image
        source={{ uri: imageSource }}
        className="w-full h-72"
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "#121212"]}
        style={{ position: "absolute", bottom: 0, height: 100, width }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    zIndex: 1,
  },
});

export default EventImageHeader;

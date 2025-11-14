import React, { useState, useEffect, useRef } from "react";
import { View, Image, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";
import { resolveImageSource } from "@/utils/imageSource";
import images from "@/constants/images";

const { width } = Dimensions.get("window");

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";
const IMAGE_TIMEOUT = 5000;

interface EventImageHeaderProps {
  image?: string | null;
}

const EventImageHeader: React.FC<EventImageHeaderProps> = ({ image }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (image?.startsWith("http")) {
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.warn(`[EventImageHeader] Timeout after ${IMAGE_TIMEOUT}ms`);
          setTimedOut(true);
          setHasError(true);
          setIsLoading(false);
        }
      }, IMAGE_TIMEOUT);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [image, isLoading]);

  const imageSource = resolveImageSource(!hasError && !timedOut ? image : null, DEFAULT_IMAGE);

  return (
    <View className="relative">
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      <Image
        source={imageSource}
        defaultSource={images.event}
        className="w-full h-72"
        resizeMode="cover"
        onLoadStart={() => {
          setIsLoading(true);
          setTimedOut(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
      />
      <LinearGradient colors={["transparent", "#121212"]} style={{ position: "absolute", bottom: 0, height: 100, width }} />
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

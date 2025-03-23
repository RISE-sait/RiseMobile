import React from "react";
import { Animated, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors"; // Import colors from a constants file
import { SafeAreaView } from "react-native-safe-area-context";

const PlayerHeader = ({ player, scrollY }) => {
  const router = useRouter();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [300, 100],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8], // Scale down the title as the user scrolls
    extrapolate: "clamp",
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -20], // Move the title up as the header shrinks
    extrapolate: "clamp",
  });
  

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
        <SafeAreaView style={styles.safeArea} />

      <Animated.Image
        source={{ uri: player?.image }}
        style={[styles.playerImage, { opacity: imageOpacity, transform: [{ translateY: imageTranslateY }] }]}
        resizeMode="cover"
      />

      <View style={styles.headerOverlay} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <Animated.View
        style={[
          StyleSheet.flatten(styles.playerInfo),
          {
            transform: [{ scale: titleScale }, { translateY: titleTranslateY }],
          },
        ]}
      >
        <View style={styles.playerNumberBadge}>
          <Text style={styles.playerNumber}>#{player?.number}</Text>
        </View>

        <Text style={styles.playerName}>
          {player?.firstName} {player?.lastName}
        </Text>

        <View style={styles.playerDetails}>
          <View style={styles.playerDetailItem}>
            <Text style={styles.playerDetailValue}>{player?.position}</Text>
            <Text style={styles.playerDetailLabel}>Position</Text>
          </View>

          <View style={styles.playerDetailDivider} />

          <View style={styles.playerDetailItem}>
            <Text style={styles.playerDetailValue}>{player?.height}</Text>
            <Text style={styles.playerDetailLabel}>Height</Text>
          </View>

          <View style={styles.playerDetailDivider} />

          <View style={styles.playerDetailItem}>
            <Text style={styles.playerDetailValue}>{player?.weight} lbs</Text>
            <Text style={styles.playerDetailLabel}>Weight</Text>
          </View>

          <View style={styles.playerDetailDivider} />

          <View style={styles.playerDetailItem}>
            <Text style={styles.playerDetailValue}>{player?.age}</Text>
            <Text style={styles.playerDetailLabel}>Age</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>

  );
};

const styles = StyleSheet.create({
  header: {
    height: 300,
    width: "100%",
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },
  safeArea: {
    paddingTop: 50, // Adjust for status bar without large gap
    },
  playerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  playerInfo: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  playerNumberBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  playerNumber: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  playerName: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  playerDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerDetailItem: {
    alignItems: "center",
  },
  playerDetailValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  playerDetailLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  playerDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 15,
  },
});

export default PlayerHeader;

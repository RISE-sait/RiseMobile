import React from "react";
import { View, ScrollView, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { COLORS } from "../../../constants/colors";

const PlayerSelector = ({ players, selectedPlayer }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Player</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {players.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.item, p.id === selectedPlayer?.id && styles.itemActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace(`/screens/playerStats?id=${p.id}`);
            }}
          >
            <Image source={{ uri: p.image }} style={styles.image} resizeMode="cover" />
            <Text style={[styles.name, p.id === selectedPlayer?.id && styles.nameActive]} numberOfLines={1}>
              {p.firstName.charAt(0)}. {p.lastName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 20 },
  title: { color: COLORS.text, fontSize: 16, fontWeight: "bold", marginBottom: 12, marginTop: 12 },
  scroll: { paddingBottom: 8 },
  item: { width: 70, marginRight: 12, alignItems: "center" },
  itemActive: { transform: [{ scale: 1.05 }] },
  image: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: COLORS.card },
  name: { color: COLORS.text, fontSize: 12, fontWeight: "bold", marginTop: 6, textAlign: "center", width: 70 },
  nameActive: { color: COLORS.primary },
});

export default PlayerSelector;

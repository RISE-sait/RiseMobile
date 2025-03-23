import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import * as Haptics from "expo-haptics";

const SeasonSelector = ({ activeSeason, setActiveSeason, seasonStats }) => {
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);

  const handleSeasonChange = (season) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSeason(season);
    setShowSeasonSelector(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={() => setShowSeasonSelector(!showSeasonSelector)}>
        <Text style={styles.selectorText}>{activeSeason}</Text>
        <Ionicons name={showSeasonSelector ? "chevron-up" : "chevron-down"} size={16} color={COLORS.text} />
      </TouchableOpacity>

      {showSeasonSelector && (
        <View style={styles.dropdown}>
          {seasonStats.map((season) => (
            <TouchableOpacity
              key={season.season}
              style={[styles.option, activeSeason === season.season && styles.optionActive]}
              onPress={() => handleSeasonChange(season.season)}
            >
              <Text style={[styles.optionText, activeSeason === season.season && styles.optionTextActive]}>
                {season.season}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.option} onPress={() => handleSeasonChange("Career")}>
            <Text style={styles.optionText}>Career</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    position: "relative",
    zIndex: 100,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectorText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionActive: {
    backgroundColor: COLORS.primary + "20",
  },
  optionText: {
    color: COLORS.text,
    fontSize: 16,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default SeasonSelector;

import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import * as Haptics from "expo-haptics";

const CategoryTabs = ({ activeCategory, setActiveCategory, statCategories }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
      {statCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryTab, activeCategory === category.id && styles.categoryTabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveCategory(category.id);
          }}
        >
          <Text style={[styles.categoryTabText, activeCategory === category.id && styles.categoryTabTextActive]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryTabs: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  categoryTabTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default CategoryTabs;

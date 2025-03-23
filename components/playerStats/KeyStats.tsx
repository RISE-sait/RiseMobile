import React from "react";
import { View, StyleSheet } from "react-native";
import StatCard from "./StatCard";
import { COLORS } from "../../constants/colors";

const KeyStats = ({ stats }) => {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <StatCard title="PPG" value={(stats.ppg || 0).toFixed(1)} subtitle="Points" icon="basketball-ball" color={COLORS.primary} />
          <StatCard title="RPG" value={(stats.rpg || 0).toFixed(1)} subtitle="Rebounds" icon="hand-holding" color={COLORS.info} />
          <StatCard title="APG" value={(stats.apg || 0).toFixed(1)} subtitle="Assists" icon="hands-helping" color={COLORS.success} />
        </View>
        <View style={styles.row}>
          <StatCard title="FG%" value={`${((stats.fg || 0) * 100).toFixed(1)}%`} subtitle="Field Goals" icon="bullseye" color={COLORS.warning} />
          <StatCard title="3P%" value={`${((stats.threePt || 0) * 100).toFixed(1)}%`} subtitle="3-Pointers" icon="dot-circle" color={COLORS.danger} />
          <StatCard title="FT%" value={`${((stats.ft || 0) * 100).toFixed(1)}%`} subtitle="Free Throws" icon="hand-point-up" color={COLORS.info} />
        </View>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
});

export default KeyStats;

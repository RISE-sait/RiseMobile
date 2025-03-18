import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/colors";

const RecentGames = ({ recentGames }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Recent Games</Text>
      <TouchableOpacity>
        <Text style={styles.actionText}>View All</Text>
      </TouchableOpacity>
    </View>

    {recentGames.map((game) => (
      <TouchableOpacity key={game.id} style={styles.card} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.date}>{game.date}</Text>
            <Text style={styles.opponent}>vs {game.opponent}</Text>
          </View>
          <Text style={[styles.result, game.result.startsWith("W") ? styles.win : styles.loss]}>
            {game.result}
          </Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.stat}>{game.stats.points} PTS</Text>
          <Text style={styles.stat}>{game.stats.rebounds} REB</Text>
          <Text style={styles.stat}>{game.stats.assists} AST</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{game.stats.minutes} MIN</Text>
          <TouchableOpacity style={styles.fullBoxScore}>
            <Text style={styles.fullBoxScoreText}>Full Box Score</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  actionText: { color: COLORS.primary, fontSize: 14 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  date: { color: COLORS.textSecondary, fontSize: 12 },
  opponent: { color: COLORS.text, fontSize: 16, fontWeight: "bold" },
  result: { fontSize: 14, fontWeight: "bold" },
  win: { color: COLORS.success },
  loss: { color: COLORS.danger },
  stats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  stat: { color: COLORS.text, fontSize: 14, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.1)", paddingTop: 12 },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
  fullBoxScore: { flexDirection: "row", alignItems: "center" },
  fullBoxScoreText: { color: COLORS.primary, fontSize: 14, marginRight: 4 },
});

export default RecentGames;

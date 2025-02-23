import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlayerStatsCard = ({ overallRating, pointsPerGame, assistsPerGame }) => (
  <View style={styles.statsCard}>
    <Text style={styles.statsTitle}>Player Stats</Text>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{overallRating}</Text>
        <Text style={styles.statLabel}>Rating</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{pointsPerGame}</Text>
        <Text style={styles.statLabel}>PPG</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{assistsPerGame}</Text>
        <Text style={styles.statLabel}>APG</Text>
      </View>
    </View>
  </View>
);

export default PlayerStatsCard;

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },
  statsTitle: {
    color: '#FCA311',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#F0F0F0',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#BBBBBB',
    fontSize: 14,
  },
});

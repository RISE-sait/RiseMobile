import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface Team {
  id: string;
  name: string;
  players: number;
  icon: string;
}

interface TeamSelectorProps {
    teams: Team[];
    selectedTeam: Team | null;
    setSelectedTeam: (team: Team | null) => void;  // Allow `null`
  }
  

const TeamSelector: React.FC<TeamSelectorProps> = ({ teams, selectedTeam, setSelectedTeam }) => {
  return (
    <View>
      <Text style={styles.title}>Select Team</Text>
      <FlatList
        data={teams}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selectedTeam?.id === item.id && styles.selected]}
            onPress={() => setSelectedTeam(item)}
          >
            <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.players}>{item.players} Players</Text>
            {selectedTeam?.id === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 12 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 16, borderRadius: 8, marginBottom: 12 },
  selected: { borderWidth: 1, borderColor: COLORS.primary },
  name: { fontSize: 16, color: COLORS.text, marginLeft: 12, flex: 1 },
  players: { fontSize: 14, color: COLORS.textSecondary },
});

export default TeamSelector;

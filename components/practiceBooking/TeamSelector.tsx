import type React from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"
import images from "@/constants/images"
import { isValidRemoteImageUri, resolveImageSource } from "@/utils/imageSource"

// Update the Team interface to match exactly with practiceBooking.tsx
interface Team {
  id: string
  name: string
  players: number
  icon: string
  image: string
  coach: {
    id: string
    name: string
    email: string
  }
}


// Update the props interface to accept the setState function
interface TeamSelectorProps {
  teams: Team[]
  selectedTeam: Team | null
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>> // Changed to match React's setState type
  hasError?: boolean
  errorMessage?: string
}



const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedTeam,
  setSelectedTeam,
  hasError,
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Team</Text>
      <FlatList
        data={teams}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selectedTeam?.id === item.id && styles.selected, hasError && styles.errorBorder]}
            onPress={() => setSelectedTeam(item)}
          >
            {isValidRemoteImageUri(item.image) ? (
              <Image source={resolveImageSource(item.image, images.teamLogo)} style={styles.teamImage} />
            ) : (
              <View style={styles.iconContainer}>
                <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} />
              </View>
            )}
            <View style={styles.teamInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.detailsRow}>
                {item.coach?.name && (
                  <Text style={styles.details}>Coach: {item.coach.name}</Text>
                )}
                {/* Only show player count if it's greater than 0 (0 means roster data not available) */}
                {item.players > 0 && (
                  <Text style={styles.details}>
                    {item.coach?.name ? ' • ' : ''}{item.players} {item.players === 1 ? 'Player' : 'Players'}
                  </Text>
                )}
              </View>
            </View>
            {selectedTeam?.id === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  errorBorder: {
    borderColor: "#ff4d4f",
  },
  teamImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  players: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
})

export default TeamSelector

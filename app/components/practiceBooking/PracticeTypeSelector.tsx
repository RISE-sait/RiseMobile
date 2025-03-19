import type React from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/constants/colors"

interface PracticeType {
  id: string
  name: string
  icon: string
  description: string
  duration: number
}

interface PracticeTypeSelectorProps {
  practiceTypes: PracticeType[]
  selectedPracticeType: PracticeType | null
  setSelectedPracticeType: (practiceType: PracticeType | null) => void
  hasError?: boolean
  errorMessage?: string
}

const PracticeTypeSelector: React.FC<PracticeTypeSelectorProps> = ({
  practiceTypes,
  selectedPracticeType,
  setSelectedPracticeType,
  hasError,
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Focus</Text>
      <FlatList
        data={practiceTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedPracticeType?.id === item.id && styles.selected,
              hasError && styles.errorBorder,
            ]}
            onPress={() => setSelectedPracticeType(item)}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.duration}>{item.duration} min</Text>
              </View>
            </View>
            {selectedPracticeType?.id === item.id && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
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
    backgroundColor: COLORS.primaryLight,
  },
  errorBorder: {
    borderColor: "#ff4d4f",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  duration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
})

export default PracticeTypeSelector


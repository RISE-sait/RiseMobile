import type React from "react"
import { View, Text, FlatList } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FontAwesome6 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import EventListItem from "./EventListItem"
import { EmptyState } from "@/components/feedback/EmptyState"
import LoadingIndicator from "@/components/feedback/LoadingIndicator"

interface EventItem {
  id: string
  title: string
  time: string
  location?: string
  type: string // Changed from union type to string to accept any type
  program_type?: string // Add this to access the original program_type
  program?: {
    id: string
    name?: string
    type?: string
  }
  [key: string]: any
}

interface EventListContainerProps {
  date: string
  data?: EventItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  children?: React.ReactNode
}

// Helper function to map API types to display types
const mapTypeToValidType = (item: EventItem): "event" | "match" | "practice" | "course" => {
  // First check the type property
  const type = (item.type || "").toLowerCase()

  // Map based on the type property
  switch (type) {
    case "match":
      return "match"
    case "game":
      return "match"
    case "practice":
      return "practice"
    case "course":
      return "course"
    case "training":
      return "practice"
    case "class":
      return "course"
    case "tryouts":
      return "event"
    case "tryout":
      return "event"
  }

  // If type doesn't match, check program_type
  if (item.program_type) {
    const programType = item.program_type.toLowerCase()

    if (programType === "match" || programType === "game") {
      return "match"
    }
    if (programType === "practice" || programType === "training") {
      return "practice"
    }
    if (programType === "course" || programType === "class") {
      return "course"
    }
  }

  // Check title for clues
  const title = (item.title || "").toLowerCase()

  if (title.includes("match") || title.includes("game") || title.includes("vs") || title.includes("versus")) {
    return "match"
  }

  if (title.includes("practice") || title.includes("training") || title.includes("drill")) {
    return "practice"
  }

  if (title.includes("course") || title.includes("class") || title.includes("lesson")) {
    return "course"
  }

  // Use ID as a fallback to distribute events more evenly
  const lastChar = item.id.charAt(item.id.length - 1)
  const charCode = lastChar.charCodeAt(0) || 0

  if (charCode % 3 === 0) return "match"
  if (charCode % 3 === 1) return "practice"
  if (charCode % 3 === 2) return "course"

  // Default to event
  return "event"
}

const EventListContainer: React.FC<EventListContainerProps> = ({
  date,
  data = [],
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = "There are no events scheduled for this day.",
  children,
}) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, minHeight: 300 }}>
      <LinearGradient
        colors={["#1A1A1A", "#121212"]}
        style={{ flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}
      >
        {/* Date header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#333",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(252, 163, 17, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <FontAwesome6 name="calendar-day" size={16} color="#FCA311" />
            </View>
            <Text style={{ color: "#FCA311", fontSize: 18, fontWeight: "bold" }}>{date}</Text>
          </View>
        </View>

        {/* Content area */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <LoadingIndicator />
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ color: "#f87171", marginBottom: 8, textAlign: "center" }}>{error}</Text>
            {onRetry && (
              <Text
                style={{ color: "#60a5fa", textDecorationLine: "underline", textAlign: "center" }}
                onPress={onRetry}
              >
                Tap to retry
              </Text>
            )}
          </View>
        ) : children ? (
          children
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Map the type to a valid display type
              const validType = mapTypeToValidType(item)


              return (
                <EventListItem
                  eventId={item.id}
                  title={item.title || item.name || "Untitled Event"}
                  time={item.time || "TBD"}
                  location={item.location}
                  type={validType}
                  program={item.program}
                />
              )
            }}
            contentContainerStyle={{
              padding: 20,
              flexGrow: 1,
              minHeight: data.length === 0 ? 200 : undefined,
            }}
            ListEmptyComponent={<EmptyState icon="calendar-xmark" title="No Events" message={emptyMessage} />}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* Legend */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 8,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: "#333",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FCA311", marginRight: 8 }} />
            <Text style={{ color: "#a0a0a0", fontSize: 12 }}>Matches</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#4ade80", marginRight: 8 }} />
            <Text style={{ color: "#a0a0a0", fontSize: 12 }}>Events</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#60a5fa", marginRight: 8 }} />
            <Text style={{ color: "#a0a0a0", fontSize: 12 }}>Practices</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

export default EventListContainer

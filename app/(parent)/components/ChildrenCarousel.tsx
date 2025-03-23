"use client"

import React from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import images from "@/constants/images"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width * 0.2
const ITEM_SPACING = 9

type Child = {
  id: string
  firstName: string
  lastName: string
  age: number
  sport: string
  profileImage: string | null
  jerseyNumber: string
  teamColors?: string[]
}

type ChildrenCarouselProps = {
  children: Child[]
  onSelectChild: (childId: string) => void
  activeChildId?: string
  showTitle?: boolean
}

// Sport-specific icons
const sportIcons = {
  Basketball: "basketball",
  Volleyball: "volleyball",
  Soccer: "soccer",
  Football: "football",
  Baseball: "baseball",
  Tennis: "tennis",
  Swimming: "swim",
  Track: "run-fast",
  Golf: "golf",
  Hockey: "hockey-sticks",
}

const ChildrenCarousel = ({ children, onSelectChild, activeChildId, showTitle = false }: ChildrenCarouselProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null)
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  if (!children || children.length === 0) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        {showTitle && (
          <View
            style={{
              paddingHorizontal: 32,
              paddingBottom: 3,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255, 255, 255, 0.1)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 22,
                fontWeight: "bold",
              }}
            >
              Your Children
            </Text>
          </View>
        )}
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: "#AAAAAA", fontSize: 14 }}>No children added yet</Text>
        </View>
      </Animated.View>
    )
  }

  const handleChildPress = (childId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log("Haptics not available")
    }
    onSelectChild(childId)
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {showTitle && (
        <View
          style={{
            paddingHorizontal: 32,
            paddingBottom: 3,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Your Children
          </Text>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        snapToAlignment="center"
      >
        {children.map((child) => {
          const isActive = activeChildId === child.id
          const teamColors = child.teamColors || ["#FFD700", "#FFA500"]

          return (
            <TouchableOpacity
              key={child.id}
              style={[styles.childItem, isActive && styles.activeChildItem]}
              onPress={() => handleChildPress(child.id)}
              activeOpacity={0.8}
            >
              <View style={styles.imageWrapper}>
                <LinearGradient
                  colors={isActive ? teamColors : ["#333333", "#222222"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.imageBorder}
                >
                  <Image
                    source={child.profileImage ? { uri: child.profileImage } : images.headshot}
                    style={styles.childImage}
                  />

                  {/* Sport Icon */}
                  <View style={styles.sportIconContainer}>
                    <MaterialCommunityIcons name={sportIcons[child.sport] || "trophy"} size={10} color="#FFF" />
                  </View>

                  {/* Jersey Number Badge */}
                  <View style={styles.jerseyBadge}>
                    <LinearGradient colors={teamColors} style={styles.jerseyBadgeGradient}>
                      <Text style={styles.jerseyNumber}>#{child.jerseyNumber}</Text>
                    </LinearGradient>
                  </View>
                </LinearGradient>
              </View>

              <Text style={[styles.childName, isActive && styles.activeChildName]}>{child.firstName}</Text>

              <View style={[styles.sportBadge, isActive && { backgroundColor: teamColors[0] }]}>
                <Text style={[styles.sportText, isActive && { color: "#000" }]}>{child.sport}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 5,
  },
  container: {
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  childItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
    alignItems: "center",
  },
  activeChildItem: {
    transform: [{ scale: 1.05 }],
  },
  imageWrapper: {
    marginBottom: 8,
    borderRadius: ITEM_WIDTH / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  imageBorder: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: ITEM_WIDTH / 2,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  childImage: {
    width: "100%",
    height: "100%",
    borderRadius: ITEM_WIDTH / 2,
  },
  sportIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  jerseyBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#000",
  },
  jerseyBadgeGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  jerseyNumber: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
  childName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  activeChildName: {
    color: "#FFD700",
  },
  sportBadge: {
    backgroundColor: "#333333",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sportText: {
    color: "#AAAAAA",
    fontSize: 8,
    fontWeight: "500",
  },
})

export default ChildrenCarousel


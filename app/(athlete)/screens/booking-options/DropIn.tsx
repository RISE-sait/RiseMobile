import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import BackButton from "@/components/buttons/BackButton";

// Mock court data 
const courts = [
  { 
    id: 1, 
    name: "Main Court", 
    location: "Arena 1", 
    available: true, 
    capacity: 10, 
    hours: "9 AM - 10 PM", 
    image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop",
    features: ["Full Court", "Scoreboard"],
  },
  { 
    id: 2, 
    name: "Court 2", 
    location: "Arena 1", 
    available: false, 
    capacity: 8, 
    hours: "10 AM - 9 PM", 
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1469&auto=format&fit=crop",
    features: ["Half Court"],
  },
  { 
    id: 3, 
    name: "Court 3", 
    location: "Arena 2", 
    available: true, 
    capacity: 12, 
    hours: "8 AM - 11 PM", 
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1469&auto=format&fit=crop",
    features: ["Full Court", "Pro Hoops"],
  },
  { 
    id: 4, 
    name: "Training Court", 
    location: "Gym 1", 
    available: true, 
    capacity: 15, 
    hours: "6 AM - 12 AM", 
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1469&auto=format&fit=crop",
    features: ["Full Court", "Training Equipment"],
  },
];

const DropInCourtsScreen = () => {
  const router = useRouter();
  const [showAvailable, setShowAvailable] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Filter courts based on availability
  const filteredCourts = showAvailable
    ? courts.filter((court) => court.available)
    : courts;

  // Handle toggle availability with animation
  const handleToggleAvailability = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setShowAvailable(!showAvailable);
  };

  // Handle court selection
  const handleCourtPress = (court) => {
    setSelectedCourt(court);
    setModalVisible(true);
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Drop-In Courts</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Availability Toggle */}
      <Animated.View style={[styles.toggleContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleToggleAvailability}
        >
          <FontAwesome6
            name={showAvailable ? "eye-slash" : "eye"}
            size={18}
            color="#0C0B0B"
          />
          <Text style={styles.toggleText}>
            {showAvailable ? "SHOW ALL COURTS" : "SHOW AVAILABLE COURTS"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      
      {/* Courts List */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.courtsContainer}
      >
        {filteredCourts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="basketball" size={50} color="#333" />
            <Text style={styles.emptyText}>No available courts at the moment</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setShowAvailable(false)}
            >
              <Text style={styles.resetButtonText}>Show All Courts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCourts.map((court) => (
            <TouchableOpacity
              key={court.id}
              style={styles.courtCard}
              activeOpacity={0.9}
              onPress={() => handleCourtPress(court)}
            >
              <Image source={{ uri: court.image }} style={styles.courtImage} />
              
              <View style={styles.courtContent}>
                <View style={styles.courtHeader}>
                  <View>
                    <Text style={styles.courtName}>{court.name}</Text>
                    <Text style={styles.courtLocation}>{court.location}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: court.available ? "rgba(74, 222, 128, 0.2)" : "rgba(239, 68, 68, 0.2)" }
                  ]}>
                    <FontAwesome6
                      name={court.available ? "check-circle" : "times-circle"}
                      size={14}
                      color={court.available ? "#4ade80" : "#ef4444"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      styles.statusText,
                      { color: court.available ? "#4ade80" : "#ef4444" }
                    ]}>
                      {court.available ? "Open" : "Closed"}
                    </Text>
                  </View>
                </View>
            
                
                <View style={styles.courtFooter}>
                  <View style={styles.featureContainer}>
                    {court.features.slice(0, 2).map((feature, idx) => (
                      <View key={idx} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.hoursText}>{court.hours}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      {/* Court Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedCourt && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Court Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <FontAwesome6 name="circle-xmark" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: selectedCourt.image }} style={styles.modalImage} />
                  
                  <View style={styles.modalContent}>
                    <View style={styles.modalCourtHeader}>
                      <Text style={styles.modalCourtName}>{selectedCourt.name}</Text>
                      <View style={[
                        styles.modalStatusBadge,
                        { backgroundColor: selectedCourt.available ? "rgba(74, 222, 128, 0.2)" : "rgba(239, 68, 68, 0.2)" }
                      ]}>
                        <Text style={[
                          styles.modalStatusText,
                          { color: selectedCourt.available ? "#4ade80" : "#ef4444" }
                        ]}>
                          {selectedCourt.available ? "Open" : "Closed"}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.modalLocation}>{selectedCourt.location}</Text>
                    
                    <View style={styles.modalInfoSection}>
                      <View style={styles.modalInfoRow}>
                        <View style={styles.modalInfoItem}>
                          <FontAwesome6 name="clock" size={16} color="#FCA311" />
                          <View style={styles.modalInfoTextContainer}>
                            <Text style={styles.modalInfoLabel}>Hours</Text>
                            <Text style={styles.modalInfoValue}>{selectedCourt.hours}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.modalInfoItem}>
                          <FontAwesome6 name="users" size={16} color="#FCA311" />
                          <View style={styles.modalInfoTextContainer}>
                            <Text style={styles.modalInfoLabel}>Capacity</Text>
                            <Text style={styles.modalInfoValue}>{selectedCourt.capacity} People</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Features</Text>
                      <View style={styles.modalFeaturesContainer}>
                        {selectedCourt.features.map((feature, index) => (
                          <View key={index} style={styles.modalFeatureItem}>
                            <FontAwesome6 name="check" size={14} color="#FCA311" />
                            <Text style={styles.modalFeatureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.closeModalButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeModalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  toggleContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCA311",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  toggleText: {
    color: "#0C0B0B",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  courtsContainer: {
    padding: 20,
    paddingTop: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#FCA311",
    fontWeight: "bold",
  },
  courtCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courtImage: {
    width: "100%",
    height: 150,
  },
  courtContent: {
    padding: 16,
  },
  courtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  courtName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  courtLocation: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  courtFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureContainer: {
    flexDirection: "row",
  },
  featureTag: {
    backgroundColor: "rgba(252, 163, 17, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  featureText: {
    color: "#FCA311",
    fontSize: 12,
  },
  hoursText: {
    color: "#999",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalContent: {
    padding: 16,
  },
  modalCourtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalCourtName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalLocation: {
    color: "#999",
    fontSize: 14,
    marginBottom: 16,
  },
  modalInfoSection: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalInfoTextContainer: {
    marginLeft: 12,
  },
  modalInfoLabel: {
    color: "#999",
    fontSize: 12,
  },
  modalInfoValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalFeaturesContainer: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 16,
  },
  modalFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalFeatureText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
  },
  closeModalButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeModalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DropInCourtsScreen;

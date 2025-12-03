import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getCourts,
  createCourt,
  updateCourt,
  deleteCourt,
} from "@/utils/api";
import { useAuth } from "@/utils/auth";

const COLORS = {
  primary: "#FCA311",
  primaryDark: "#D4890E",
  background: "#0C0B0B",
  card: "#1A1A1A",
  cardDark: "#141414",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#2A2A2A",
  success: "#4CAF50",
  danger: "#FF5252",
};

interface Location {
  id: string;
  name: string;
  address: string;
}

interface Court {
  id: string;
  name: string;
  location_id: string;
  location_name?: string;
}

export default function ManageFacilities() {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"facilities" | "courts">("facilities");
  const [locations, setLocations] = useState<Location[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Location modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // Court modal states
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [courtName, setCourtName] = useState("");
  const [courtLocationId, setCourtLocationId] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      if (!token) throw new Error("No authentication token");

      const [locationsData, courtsData] = await Promise.all([
        getLocations(),
        getCourts(token),
      ]);

      setLocations(locationsData || []);
      setCourts(courtsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Location CRUD operations
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationName("");
    setLocationAddress("");
    setShowLocationModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLocationAddress(location.address);
    setShowLocationModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveLocation = async () => {
    if (!locationName.trim() || !locationAddress.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    try {
      const token = await getValidToken();
      if (!token) throw new Error("No authentication token");

      const data = {
        name: locationName.trim(),
        address: locationAddress.trim(),
      };

      if (editingLocation) {
        await updateLocation(token, editingLocation.id, data);
        Alert.alert("Success", "Facility updated successfully");
      } else {
        await createLocation(token, data);
        Alert.alert("Success", "Facility created successfully");
      }

      setShowLocationModal(false);
      await fetchData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Error saving location:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save facility");
    }
  };

  const handleDeleteLocation = (location: Location) => {
    Alert.alert(
      "Delete Facility",
      `Are you sure you want to delete "${location.name}"? This will also delete all associated courts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getValidToken();
              if (!token) throw new Error("No authentication token");

              await deleteLocation(token, location.id);
              Alert.alert("Success", "Facility deleted successfully");
              await fetchData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              console.error("Error deleting location:", error);
              Alert.alert("Error", error.response?.data?.message || "Failed to delete facility");
            }
          },
        },
      ]
    );
  };

  // Court CRUD operations
  const handleAddCourt = () => {
    setEditingCourt(null);
    setCourtName("");
    setCourtLocationId(locations[0]?.id || "");
    setShowCourtModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court);
    setCourtName(court.name);
    setCourtLocationId(court.location_id);
    setShowCourtModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveCourt = async () => {
    if (!courtName.trim() || !courtLocationId) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    try {
      const token = await getValidToken();
      if (!token) throw new Error("No authentication token");

      const data = {
        name: courtName.trim(),
        location_id: courtLocationId,
      };

      if (editingCourt) {
        await updateCourt(token, editingCourt.id, data);
        Alert.alert("Success", "Court updated successfully");
      } else {
        await createCourt(token, data);
        Alert.alert("Success", "Court created successfully");
      }

      setShowCourtModal(false);
      await fetchData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Error saving court:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save court");
    }
  };

  const handleDeleteCourt = (court: Court) => {
    Alert.alert(
      "Delete Court",
      `Are you sure you want to delete "${court.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getValidToken();
              if (!token) throw new Error("No authentication token");

              await deleteCourt(token, court.id);
              Alert.alert("Success", "Court deleted successfully");
              await fetchData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              console.error("Error deleting court:", error);
              Alert.alert("Error", error.response?.data?.message || "Failed to delete court");
            }
          },
        },
      ]
    );
  };

  const getLocationName = (locationId: string) => {
    return locations.find((loc) => loc.id === locationId)?.name || "Unknown";
  };

  const getCourtsByLocation = (locationId: string) => {
    return courts.filter((court) => court.location_id === locationId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.text, flex: 1 }}>
            Facilities & Courts
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("facilities");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              backgroundColor: activeTab === "facilities" ? COLORS.primary : COLORS.card,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "facilities" ? COLORS.background : COLORS.textSecondary,
                fontWeight: "600",
              }}
            >
              Facilities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("courts");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              backgroundColor: activeTab === "courts" ? COLORS.primary : COLORS.card,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "courts" ? COLORS.background : COLORS.textSecondary,
                fontWeight: "600",
              }}
            >
              Courts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {activeTab === "facilities" ? (
            <View style={{ padding: 16 }}>
              {/* Add Facility Button */}
              <TouchableOpacity
                onPress={handleAddLocation}
                style={{
                  backgroundColor: COLORS.primary,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.background} />
                <Text style={{ color: COLORS.background, fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
                  Add New Facility
                </Text>
              </TouchableOpacity>

              {/* Facilities List */}
              {locations.length === 0 ? (
                <View style={{ padding: 32, alignItems: "center" }}>
                  <MaterialIcons name="location-off" size={64} color={COLORS.textSecondary} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 16, marginTop: 16 }}>
                    No facilities found
                  </Text>
                </View>
              ) : (
                locations.map((location) => {
                  const locationCourts = getCourtsByLocation(location.id);
                  return (
                    <View
                      key={location.id}
                      style={{
                        backgroundColor: COLORS.card,
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                            {location.name}
                          </Text>
                          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 }}>
                            {location.address}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                            <Ionicons name="basketball" size={16} color={COLORS.primary} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 }}>
                              {locationCourts.length} {locationCourts.length === 1 ? "court" : "courts"}
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleEditLocation(location)}
                            style={{
                              backgroundColor: COLORS.cardDark,
                              padding: 10,
                              borderRadius: 8,
                            }}
                          >
                            <Ionicons name="pencil" size={18} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteLocation(location)}
                            style={{
                              backgroundColor: COLORS.cardDark,
                              padding: 10,
                              borderRadius: 8,
                            }}
                          >
                            <Ionicons name="trash" size={18} color={COLORS.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {/* Add Court Button */}
              <TouchableOpacity
                onPress={handleAddCourt}
                style={{
                  backgroundColor: COLORS.primary,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
                disabled={locations.length === 0}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.background} />
                <Text style={{ color: COLORS.background, fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
                  Add New Court
                </Text>
              </TouchableOpacity>

              {locations.length === 0 ? (
                <View style={{ padding: 32, alignItems: "center" }}>
                  <MaterialIcons name="location-off" size={64} color={COLORS.textSecondary} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 16, marginTop: 16, textAlign: "center" }}>
                    Please create a facility first before adding courts
                  </Text>
                </View>
              ) : courts.length === 0 ? (
                <View style={{ padding: 32, alignItems: "center" }}>
                  <MaterialIcons name="sports-basketball" size={64} color={COLORS.textSecondary} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 16, marginTop: 16 }}>
                    No courts found
                  </Text>
                </View>
              ) : (
                courts.map((court) => (
                  <View
                    key={court.id}
                    style={{
                      backgroundColor: COLORS.card,
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                          {court.name}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <Ionicons name="location" size={16} color={COLORS.primary} />
                          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginLeft: 4 }}>
                            {getLocationName(court.location_id)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleEditCourt(court)}
                          style={{
                            backgroundColor: COLORS.cardDark,
                            padding: 10,
                            borderRadius: 8,
                          }}
                        >
                          <Ionicons name="pencil" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteCourt(court)}
                          style={{
                            backgroundColor: COLORS.cardDark,
                            padding: 10,
                            borderRadius: 8,
                          }}
                        >
                          <Ionicons name="trash" size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "80%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "bold" }}>
                {editingLocation ? "Edit Facility" : "Add Facility"}
              </Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 }}>Facility Name</Text>
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g., RISE Sports Complex"
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 }}>Address</Text>
              <TextInput
                value={locationAddress}
                onChangeText={setLocationAddress}
                placeholder="e.g., 123 Main St, Calgary, AB"
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveLocation}
              style={{
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.background, fontSize: 16, fontWeight: "600" }}>
                {editingLocation ? "Update Facility" : "Create Facility"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Court Modal */}
      <Modal
        visible={showCourtModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCourtModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "80%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "bold" }}>
                {editingCourt ? "Edit Court" : "Add Court"}
              </Text>
              <TouchableOpacity onPress={() => setShowCourtModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 }}>Court Name</Text>
              <TextInput
                value={courtName}
                onChangeText={setCourtName}
                placeholder="e.g., Court 1"
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 }}>Facility</Text>
              <TouchableOpacity
                onPress={() => setShowLocationPicker(true)}
                style={{
                  backgroundColor: COLORS.background,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: COLORS.text, fontSize: 16 }}>
                  {courtLocationId ? getLocationName(courtLocationId) : "Select a facility"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSaveCourt}
              style={{
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.background, fontSize: 16, fontWeight: "600" }}>
                {editingCourt ? "Update Court" : "Create Court"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "60%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "bold" }}>Select Facility</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  onPress={() => {
                    setCourtLocationId(location.id);
                    setShowLocationPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: courtLocationId === location.id ? COLORS.primary : COLORS.background,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: courtLocationId === location.id ? COLORS.background : COLORS.text,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {location.name}
                  </Text>
                  <Text
                    style={{
                      color: courtLocationId === location.id ? COLORS.cardDark : COLORS.textSecondary,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {location.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

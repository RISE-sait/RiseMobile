import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import BackButton from "@/components/buttons/BackButton";
import { COLORS } from "@/constants/colors";
import { useAppSelector } from "@/store/hooks";
import { getUserWaivers, uploadWaiver, Waiver } from "@/utils/api";

const WaiversScreen: React.FC = () => {
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [notes, setNotes] = useState("");

  const user = useAppSelector((state) => state.user.data);

  const loadWaivers = useCallback(async (showLoadingIndicator = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoadingIndicator) {
      setLoading(true);
    }

    try {
      const result = await getUserWaivers(user.id);

      if (result.error) {
        if (result.error.status !== 404) {
          Alert.alert("Error", result.error.userMessage || "Failed to load waivers");
        }
        setWaivers([]);
      } else {
        setWaivers(result.data || []);
      }
    } catch (error) {
      console.error("Error loading waivers:", error);
      Alert.alert("Error", "An unexpected error occurred while loading waivers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWaivers();
  }, [loadWaivers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWaivers(false);
  }, [loadWaivers]);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error("Error selecting document:", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      Alert.alert("Error", "Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadWaiver(selectedFile, user.id, notes.trim() || undefined);

      if (result.error) {
        Alert.alert("Upload Failed", result.error.userMessage || "Failed to upload waiver");
      } else {
        Alert.alert("Success", "Waiver uploaded successfully");
        setShowUploadModal(false);
        setSelectedFile(null);
        setNotes("");
        loadWaivers(false);
      }
    } catch (error) {
      console.error("Error uploading waiver:", error);
      Alert.alert("Error", "An unexpected error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleViewWaiver = (waiver: Waiver) => {
    if (waiver.file_url) {
      Linking.openURL(waiver.file_url).catch(() => {
        Alert.alert("Error", "Unable to open the waiver document");
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getWaiverName = (waiver: Waiver) => {
    return waiver.file_name || "Waiver Document";
  };

  const getWaiverDate = (waiver: Waiver) => {
    if (waiver.uploaded_at?.Valid && waiver.uploaded_at?.Time) {
      return waiver.uploaded_at.Time;
    }
    return undefined;
  };

  const renderWaiverItem = (waiver: Waiver) => (
    <TouchableOpacity
      key={waiver.id}
      style={styles.waiverItem}
      onPress={() => handleViewWaiver(waiver)}
    >
      <View style={styles.waiverIcon}>
        <Ionicons name="document-text" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.waiverContent}>
        <Text style={styles.waiverTitle} numberOfLines={1}>{getWaiverName(waiver)}</Text>
        <Text style={styles.waiverDate}>Uploaded: {formatDate(getWaiverDate(waiver))}</Text>
        {waiver.notes && (
          <Text style={styles.waiverNotes} numberOfLines={2}>
            {waiver.notes}
          </Text>
        )}
      </View>
      <Ionicons name="open-outline" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Waivers</Text>
      <Text style={styles.emptyDescription}>
        You haven't uploaded any waivers yet. Tap the button below to upload your first waiver document.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading waivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>My Waivers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Upload signed waiver documents for your records. Accepted formats: PDF, Images
          </Text>
        </View>

        {/* Waivers List */}
        <View style={styles.section}>
          {waivers.length > 0 ? (
            waivers.map(renderWaiverItem)
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSelectFile}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload" size={24} color={COLORS.background} />
          <Text style={styles.uploadButtonText}>Upload Waiver</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setNotes("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Waiver</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setNotes("");
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Selected File Info */}
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <Ionicons name="document" size={32} color={COLORS.primary} />
                <Text style={styles.selectedFileName} numberOfLines={2}>
                  {selectedFile.name}
                </Text>
              </View>
            )}

            {/* Notes Input */}
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any notes about this waiver..."
              placeholderTextColor={COLORS.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setNotes("");
                }}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, uploading && styles.disabledButton]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  infoBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 100,
  },
  waiverItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  waiverIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  waiverContent: {
    flex: 1,
    marginLeft: 12,
  },
  waiverTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  waiverDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  waiverNotes: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 20,
  },
  uploadButtonContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  uploadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  selectedFileContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top' as const,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.background,
  },
  disabledButton: {
    opacity: 0.6,
  },
};

export default WaiversScreen;

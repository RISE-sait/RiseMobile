import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import BackButton from "@/components/buttons/BackButton"

interface ServiceFormProps {
  initialData?: {
    id?: string
    name: string
    description: string
    price: number
    duration: number
    isActive: boolean
  }
  onSave: (service: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, onSave, onDelete }) => {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [duration, setDuration] = useState(initialData?.duration?.toString() || "")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Service name is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!price.trim()) newErrors.price = "Price is required"
    else if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = "Price must be a positive number"
    if (!duration.trim()) newErrors.duration = "Duration is required"
    else if (isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = "Duration must be a positive number"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const serviceData = {
        id: initialData?.id,
        name,
        description,
        price: Number(price),
        duration: Number(duration),
        isActive,
      }

      await onSave(serviceData)
      router.back()
    } catch (error) {
      Alert.alert("Error", "Failed to save service. Please try again.")
      console.error("Error saving service:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete) return

    Alert.alert("Delete Service", "Are you sure you want to delete this service? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete(initialData.id!)
            router.back()
          } catch (error) {
            Alert.alert("Error", "Failed to delete service. Please try again.")
            console.error("Error deleting service:", error)
          }
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{isEditing ? "Edit Service" : "Add Service"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Service Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Fade Haircut"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the service..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="25"
              placeholderTextColor="#666"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              style={[styles.input, errors.duration && styles.inputError]}
              placeholder="30"
              placeholderTextColor="#666"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              trackColor={{ false: "#333", true: "#FFD700" }}
              thumbColor={isActive ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#333"
              onValueChange={setIsActive}
              value={isActive}
            />
          </View>
          <Text style={styles.helperText}>
            {isActive ? "This service will be visible to clients" : "This service will be hidden from clients"}
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save Service"}</Text>
        </TouchableOpacity>

        {isEditing && onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Service</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

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
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF4D4F",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF4D4F",
    marginTop: 4,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    color: "#999",
    marginTop: 4,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF4D4F",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default ServiceForm


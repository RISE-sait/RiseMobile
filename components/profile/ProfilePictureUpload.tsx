import React, { useState } from 'react'
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store'
import { updateProfile } from '@/store/slices/userSlice'

interface ProfilePictureUploadProps {
  currentImageUri?: string
  defaultImage: any
  size?: number
  onUploadSuccess?: (imageUrl: string) => void
  onUploadError?: (error: string) => void
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUri,
  defaultImage,
  size = 120,
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null)
  
  const user = useSelector((state: RootState) => state.user.data)
  const dispatch = useDispatch()

  const uploadImageToCloud = async (imageUri: string): Promise<string> => {
    if (!user?.token) {
      throw new Error('User authentication required')
    }

    const formData = new FormData()
    
    // Create file object for upload
    const imageFile = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-picture.jpg'
    } as any

    formData.append('image', imageFile)

    const response = await fetch(
      'https://api-461776259687.us-west2.run.app/upload/image?folder=profiles',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result.url
  }

  const updateUserProfile = async (photoUrl: string): Promise<void> => {
    if (!user?.token || !user?.id) {
      throw new Error('User authentication required')
    }

    // Determine endpoint based on user role
    const isStaff = user.role === 'coach' || user.role === 'instructor' || user.role === 'barber'
    const endpoint = isStaff 
      ? `https://api-461776259687.us-west2.run.app/staff/${user.id}/profile`
      : `https://api-461776259687.us-west2.run.app/athletes/${user.id}/profile`

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photo_url: photoUrl
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Profile update failed: ${response.status} - ${errorText}`)
    }
  }

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!')
        return
      }

      // Show action sheet
      Alert.alert(
        'Select Profile Picture',
        'Choose how you would like to select your profile picture',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => openImageLibrary(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      )
    } catch (error) {
      console.error('Error requesting permissions:', error)
      onUploadError?.('Failed to request permissions')
    }
  }

  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
      
      if (cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error opening camera:', error)
      onUploadError?.('Failed to open camera')
    }
  }

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error opening image library:', error)
      onUploadError?.('Failed to open image library')
    }
  }

  const uploadProfilePicture = async (imageUri: string) => {
    setIsUploading(true)
    setLocalImageUri(imageUri) // Show selected image immediately

    try {
      // Step 1: Upload image to cloud storage
      const cloudImageUrl = await uploadImageToCloud(imageUri)
      
      // Step 2: Update user profile with cloud URL
      await updateUserProfile(cloudImageUrl)
      
      // Step 3: Update Redux store
      dispatch(updateProfile({
        profileImage: cloudImageUrl
      }))

      onUploadSuccess?.(cloudImageUrl)
      
      Alert.alert('Success', 'Profile picture updated successfully!')
      
    } catch (error) {
      console.error('Profile picture upload failed:', error)
      setLocalImageUri(null) // Reset on error
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
      
      Alert.alert('Upload Failed', errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const displayImageUri = localImageUri || currentImageUri

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <TouchableOpacity
        onPress={handleImagePicker}
        disabled={isUploading}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Profile Image */}
        <Image
          source={displayImageUri ? { uri: displayImageUri } : defaultImage}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
        
        {/* Upload Overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#FFD700',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#0C0B0B',
          }}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <FontAwesome6 name="camera" size={size * 0.12} color="#000" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default ProfilePictureUpload
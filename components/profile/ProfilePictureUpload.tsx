import React, { useState } from 'react'
import { View, TouchableOpacity, Alert, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCamera, faImage } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

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
  size = 100,
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const user = useSelector((state: RootState) => state.user.data)

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload profile pictures.',
        [{ text: 'OK' }]
      )
      return false
    }
    return true
  }

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add a profile picture',
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
  }

  const openCamera = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        handleImageSelection(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Camera error:', error)
      onUploadError?.('Failed to open camera')
    }
  }

  const openImageLibrary = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        handleImageSelection(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Image library error:', error)
      onUploadError?.('Failed to open photo library')
    }
  }

  const handleImageSelection = async (imageUri: string) => {
    if (!user?.token) {
      onUploadError?.('Authentication required')
      return
    }

    setIsUploading(true)

    try {
      console.log('Starting image upload...', imageUri)

      // Create FormData for file upload
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'profile.jpg'
      const match = /\.(.+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any)

      // Upload to backend
      const uploadResponse = await fetch('https://api-461776259687.us-west2.run.app/upload/image?folder=profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log('Upload successful:', uploadResult)

      if (uploadResult.url) {
        onUploadSuccess?.(uploadResult.url)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { width: size, height: size }]}>
        <Image
          source={currentImageUri ? { uri: currentImageUri } : defaultImage}
          style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
        
        {isUploading && (
          <View style={[styles.uploadingOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.cameraButton, {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            bottom: 0,
            right: 0,
          }]}
          onPress={showImagePickerOptions}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={faCamera} color="#FFFFFF" size={size * 0.12} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  cameraButton: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  uploadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
})

export default ProfilePictureUpload
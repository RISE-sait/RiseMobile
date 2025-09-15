import React, { useState, useEffect } from 'react'
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'

interface SafeTeamLogoProps {
  logoUrl?: string | null
  teamName?: string
  size?: number
  style?: any
  fallbackColor?: string
}

const SafeTeamLogo: React.FC<SafeTeamLogoProps> = ({
  logoUrl,
  teamName = 'Team',
  size = 60,
  style,
  fallbackColor = '#FFD700'
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(false)

  // Validate and process logo URL
  useEffect(() => {
    if (!logoUrl || logoUrl === 'null' || logoUrl.trim() === '') {
      setIsValidUrl(false)
      setImageError(true)
      return
    }

    // Check if it's a data URL (base64)
    if (logoUrl.startsWith('data:image/')) {
      const base64Data = logoUrl.split(',')[1]
      
      if (base64Data && base64Data.trim().length > 0) {
        setIsValidUrl(true)
        setImageError(false)
        return
      } else {
        console.warn(`SafeTeamLogo: Empty base64 data for team "${teamName}"`)
        setIsValidUrl(false)
        setImageError(true)
        return
      }
    }

    // Check if it's a valid HTTP/HTTPS URL
    try {
      const url = new URL(logoUrl)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        setIsValidUrl(true)
        setImageError(false)
      } else {
        console.warn(`SafeTeamLogo: Invalid protocol for team "${teamName}":`, url.protocol)
        setIsValidUrl(false)
        setImageError(true)
      }
    } catch (error) {
      console.warn(`SafeTeamLogo: Invalid URL format for team "${teamName}"`)
      setIsValidUrl(false)
      setImageError(true)
    }
  }, [logoUrl, teamName])

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = (error: any) => {
    console.error(`SafeTeamLogo: Image failed to load for team "${teamName}":`, error?.nativeEvent)
    setIsLoading(false)
    setImageError(true)
  }

  const handleImageLoadStart = () => {
    setIsLoading(true)
  }

  // If no valid logo URL or image failed to load, show fallback
  if (!isValidUrl || imageError) {
    return (
      <View style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${fallbackColor}20`
        },
        style
      ]}>
        <FontAwesome6 
          name="users" 
          size={size * 0.5} 
          color={fallbackColor} 
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={fallbackColor} />
        </View>
      )}
      
      <Image
        source={{ uri: logoUrl! }}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onLoadStart={handleImageLoadStart}
        resizeMode="cover"
        // Potential fix for base64 handling
        defaultSource={undefined}
        fadeDuration={0}
        // Add accessibility props
        accessibilityLabel={`${teamName} team logo`}
        accessibilityRole="image"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden'
  },
  logo: {
    backgroundColor: '#1A1A1A'
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1
  }
})

export default SafeTeamLogo

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface EmptyBookingsStateProps {
  userType: 'athlete' | 'coach'
  onRefresh?: () => void
  isRefreshing?: boolean
  colors?: {
    card: string
    text: string
    textSecondary: string
    primary?: string
  }
}

const EmptyBookingsState: React.FC<EmptyBookingsStateProps> = ({ 
  userType, 
  onRefresh,
  isRefreshing = false,
  colors = {
    card: '#1A1A1A',
    text: '#FFFFFF', 
    textSecondary: '#AAAAAA',
    primary: '#FFD700'
  }
}) => {
  const getContent = () => {
    switch (userType) {
      case 'athlete':
        return {
          icon: 'calendar-times' as const,
          title: 'No Upcoming Bookings',
          description: 'You don\'t have any upcoming appointments.\nBook a service below to get started!'
        }
      case 'coach':
        return {
          icon: 'chalkboard-teacher' as const,
          title: 'No Upcoming Practices',
          description: 'You don\'t have any upcoming practices scheduled.\nCreate a new practice session to get started!'
        }
      default:
        return {
          icon: 'calendar-times' as const,
          title: 'No Upcoming Bookings',
          description: 'Nothing scheduled at the moment.\nCheck back later or create a new booking!'
        }
    }
  }

  const content = getContent()

  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onRefresh()
    }
  }

  return (
    <View 
      style={{ 
        backgroundColor: colors.card, 
        borderRadius: 12, 
        padding: 20, 
        alignItems: 'center' 
      }}
    >
      <FontAwesome5 name={content.icon} size={32} color={colors.textSecondary} />
      <Text 
        style={{ 
          color: colors.text, 
          fontWeight: 'bold', 
          marginTop: 12, 
          fontSize: 16 
        }}
      >
        {content.title}
      </Text>
      <Text 
        style={{ 
          color: colors.textSecondary, 
          marginTop: 4, 
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: onRefresh ? 16 : 0
        }}
      >
        {content.description}
      </Text>
      
      {onRefresh && (
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary + '20',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            opacity: isRefreshing ? 0.6 : 1
          }}
          activeOpacity={0.7}
        >
          <FontAwesome5 
            name={isRefreshing ? 'spinner' : 'sync-alt'} 
            size={14} 
            color={colors.primary} 
            style={{ marginRight: 8 }}
          />
          <Text 
            style={{ 
              color: colors.primary, 
              fontSize: 14,
              fontWeight: '600'
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default EmptyBookingsState
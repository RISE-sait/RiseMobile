import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { getUserSubsidies, getUserSubsidyBalance, getUserSubsidyUsage } from '@/utils/api'
import { COLORS } from '@/constants/colors'
import type { SubsidyInfo, SubsidyBalance, SubsidyUsage } from '@/types'

interface SubsidyOverviewProps {
  userToken: string
}

export const SubsidyOverview: React.FC<SubsidyOverviewProps> = ({ userToken }) => {
  const [subsidies, setSubsidies] = useState<SubsidyInfo[]>([])
  const [balance, setBalance] = useState<SubsidyBalance | null>(null)
  const [usage, setUsage] = useState<SubsidyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [showUsageHistory, setShowUsageHistory] = useState(false)

  const fetchSubsidyData = async () => {
    try {
      setLoading(true)

      // Fetch subsidies info
      const subsidiesResult = await getUserSubsidies()
      if (subsidiesResult.error) {
        console.error('Error fetching subsidies:', subsidiesResult.error)
        setSubsidies([])
      } else {
        setSubsidies(subsidiesResult.data || [])
      }

      // Fetch balance
      const balanceResult = await getUserSubsidyBalance()
      if (balanceResult.error) {
        console.error('Error fetching subsidy balance:', balanceResult.error)
        setBalance({ total_balance: 0, available_balance: 0, used_balance: 0 })
      } else {
        setBalance(balanceResult.data || { total_balance: 0, available_balance: 0, used_balance: 0 })
      }
    } catch (error) {
      console.error('Error fetching subsidy data:', error)
      setSubsidies([])
      setBalance({ total_balance: 0, available_balance: 0, used_balance: 0 })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageHistory = async () => {
    try {
      const usageResult = await getUserSubsidyUsage()
      if (usageResult.error) {
        console.error('Error fetching subsidy usage:', usageResult.error)
        setUsage([])
      } else {
        setUsage(usageResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching subsidy usage:', error)
      setUsage([])
    }
  }

  useEffect(() => {
    fetchSubsidyData()
  }, [userToken])

  const handleShowUsageHistory = () => {
    if (!showUsageHistory) {
      fetchUsageHistory()
    }
    setShowUsageHistory(!showUsageHistory)
  }

  const renderUsageItem = ({ item }: { item: SubsidyUsage }) => {
    const isPositive = item.transaction_type === 'credit' || item.transaction_type === 'refund'
    const iconName = isPositive ? 'plus-circle' : 'minus-circle'

    return (
      <View style={styles.usageItem}>
        <FontAwesome5
          name={iconName}
          size={16}
          color={isPositive ? '#4ade80' : '#ef4444'}
        />
        <View style={styles.usageDetails}>
          <Text style={styles.usageDescription}>{item.description || 'Subsidy transaction'}</Text>
          <Text style={styles.usageDate}>
            {new Date(item.usage_date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[
          styles.usageAmount,
          { color: isPositive ? '#4ade80' : '#ef4444' }
        ]}>
          {isPositive ? '+' : '-'}¥{Math.abs(item.amount)}
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading subsidy information...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Subsidy</Text>
        <Text style={styles.balanceAmount}>¥{balance?.available_balance || 0}</Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Total</Text>
            <Text style={styles.balanceDetailValue}>¥{balance?.total_balance || 0}</Text>
          </View>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Used</Text>
            <Text style={styles.balanceDetailValue}>¥{balance?.used_balance || 0}</Text>
          </View>
        </View>
      </View>

      {/* Active Subsidies */}
      {subsidies.length > 0 && (
        <View style={styles.subsidiesSection}>
          <Text style={styles.sectionTitle}>Active Subsidies</Text>
          {subsidies.map((subsidy) => (
            <View key={subsidy.id} style={styles.subsidyCard}>
              <View style={styles.subsidyHeader}>
                <Text style={styles.subsidyStatus}>{subsidy.status}</Text>
              </View>
              <Text style={styles.subsidyAmount}>¥{subsidy.amount}</Text>
              {subsidy.description && (
                <Text style={styles.subsidyDescription}>{subsidy.description}</Text>
              )}
              <View style={styles.subsidyDates}>
                <Text style={styles.subsidyDate}>
                  Valid: {new Date(subsidy.start_date).toLocaleDateString()} - {new Date(subsidy.end_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Usage History */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={handleShowUsageHistory}
      >
        <Text style={styles.historyButtonText}>
          {showUsageHistory ? 'Hide' : 'View'} Usage History
        </Text>
        <FontAwesome5
          name={showUsageHistory ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {showUsageHistory && (
        <View style={styles.historyContainer}>
          {usage.length > 0 ? (
            <FlatList
              data={usage}
              renderItem={renderUsageItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No usage history available</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0B0B',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0B0B',
  },
  loadingText: {
    color: '#999999',
    marginTop: 12,
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetailItem: {
    flex: 1,
  },
  balanceDetailLabel: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 4,
  },
  balanceDetailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subsidiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subsidyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  subsidyHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  subsidyStatus: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subsidyAmount: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subsidyDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  subsidyDates: {
    marginTop: 8,
  },
  subsidyDate: {
    color: '#999999',
    fontSize: 12,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  historyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  historyContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  usageDetails: {
    flex: 1,
    marginLeft: 12,
  },
  usageDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  usageDate: {
    color: '#999999',
    fontSize: 12,
  },
  usageAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
})

export default SubsidyOverview

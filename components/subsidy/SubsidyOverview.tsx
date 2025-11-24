import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { API_URL } from '@/utils/api'
import { COLORS } from '@/constants/colors'
import type { SubsidyInfo, SubsidyBalance, SubsidyUsage } from '@/types'
import type { RootState } from '@/store'
import {
  setSubsidies,
  setSubsidyBalance,
  setSubsidyUsage,
  setLoading,
  setError,
  clearSubsidy,
} from '@/store/slices/subsidySlice'

interface SubsidyOverviewProps {
  userToken: string
}

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(safeValue)
  } catch {
    return `$${safeValue.toFixed(2)}`
  }
}

const formatUsageDescription = (desc?: string) => {
  const base = desc?.trim()
  if (!base) return 'Subsidy transaction'

  // Hide long session IDs tacked onto descriptions, keep the readable prefix
  const stripped = base.replace(/- Session\s+[A-Za-z0-9_]+$/i, '').trim()
  return stripped || base
}

export const SubsidyOverview: React.FC<SubsidyOverviewProps> = ({ userToken }) => {
  const dispatch = useDispatch()
  const previousTokenRef = React.useRef<string | null>(null)

  // Get subsidy data from Redux store
  const { subsidies, balance, usage } = useSelector(
    (state: RootState) => state.subsidy
  )

  const [loading, setLocalLoading] = useState(true)
  const [showUsageHistory, setShowUsageHistory] = useState(false)

  const fetchSubsidyData = async () => {
    try {
      setLocalLoading(true)
      dispatch(setLoading())

      // Initialize with default values
      let subsidiesData: SubsidyInfo[] = []
      let balanceData: SubsidyBalance = {
        total_balance: 0,
        available_balance: 0,
        used_balance: 0,
      }

      // Fetch subsidies info
      try {
        const subsidiesResponse = await axios.get<SubsidyInfo[] | { data?: SubsidyInfo[]; subsidies?: SubsidyInfo[] }>(
          `${API_URL}/subsidies/me`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        )

        // Handle different response formats
        let rawData: any[] = []
        if (Array.isArray(subsidiesResponse.data)) {
          rawData = subsidiesResponse.data
        } else if (subsidiesResponse.data?.data && Array.isArray(subsidiesResponse.data.data)) {
          // Backend returns { data: [...], pagination: {...} }
          rawData = subsidiesResponse.data.data
        } else if (subsidiesResponse.data?.subsidies && Array.isArray(subsidiesResponse.data.subsidies)) {
          rawData = subsidiesResponse.data.subsidies
        }

        // Map backend fields to frontend expected fields
        subsidiesData = rawData.map((item: any) => ({
          id: item.id,
          user_id: item.customer?.id || item.user_id || '',
          amount: item.approved_amount ?? item.amount ?? 0,
          remaining_balance: item.remaining_balance ?? 0,
          start_date: item.valid_from ?? item.start_date ?? '',
          end_date: item.valid_until ?? item.end_date ?? '',
          status: item.status ?? 'unknown',
          description: item.reason ?? item.description ?? '',
        }))
      } catch (subsidiesError) {
        // Silently handle subsidy list errors, keep default empty array
        console.log('No subsidies found or error fetching subsidies:', subsidiesError)
      }

      // Fetch subsidy balance
      try {
        const balanceResponse = await axios.get<SubsidyBalance | { has_active_subsidy?: boolean; provider_name?: string; remaining_balance?: number }>(
          `${API_URL}/subsidies/me/balance`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        )

        // Handle response with proper null checks
        if (balanceResponse.data) {
          // Backend returns { has_active_subsidy, provider_name, remaining_balance }
          const data = balanceResponse.data as any
          balanceData = {
            total_balance: data.remaining_balance ?? data.total_balance ?? 0,
            available_balance: data.remaining_balance ?? data.available_balance ?? 0,
            used_balance: data.used_balance ?? 0,
          }
        }
      } catch (balanceError) {
        // Silently handle balance errors, keep default zero values
        console.log('No balance found or error fetching balance:', balanceError)
      }

      // Update Redux store
      dispatch(setSubsidies(subsidiesData))
      dispatch(setSubsidyBalance(balanceData))
    } catch (error) {
      console.error('Error fetching subsidy data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unable to load subsidy information'
      dispatch(setError(errorMessage))
    } finally {
      setLocalLoading(false)
    }
  }

  const fetchUsageHistory = async () => {
    try {
      const response = await axios.get<SubsidyUsage[] | { data?: SubsidyUsage[]; usage?: SubsidyUsage[] }>(
        `${API_URL}/subsidies/me/usage`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      )

      // Handle different response formats
      let rawUsage: any[] = []
      if (Array.isArray(response.data)) {
        rawUsage = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Backend returns { data: [...], pagination: {...} }
        rawUsage = response.data.data
      } else if (response.data?.usage && Array.isArray(response.data.usage)) {
        rawUsage = response.data.usage
      }

      const normalizeUsage = (item: any): SubsidyUsage => {
        const rawAmount =
          item.amount ??
          item.original_amount ??
          item.subsidy_applied ??
          item.customer_paid ??
          item.amount_cents ??
          item.amount_in_cents ??
          item.price ??
          0
        const amountNumber =
          typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount)
        const safeAmount = Number.isFinite(amountNumber) ? amountNumber : 0

        const usageDateRaw =
          item.usage_date ||
          item.date ||
          item.created_at ||
          item.updated_at ||
          item.timestamp ||
          ''
        const parsedDate = usageDateRaw ? new Date(usageDateRaw) : null
        const safeDate =
          parsedDate && !isNaN(parsedDate.getTime())
            ? parsedDate.toISOString()
            : ''

        return {
          id: item.id || item.transaction_id || `${item.description || 'usage'}-${safeDate || Date.now()}`,
          subsidy_id: item.subsidy_id || item.subsidy || '',
          amount: safeAmount,
          usage_date: safeDate,
          description: item.description || item.reason || item.label || 'Subsidy transaction',
          event_id: item.event_id || item.event || undefined,
          transaction_type:
            item.transaction_type ||
            item.type ||
            (safeAmount >= 0 ? 'credit' : 'debit'),
        }
      }

      const usageData: SubsidyUsage[] = rawUsage.map(normalizeUsage)

      dispatch(setSubsidyUsage(usageData))
    } catch (error) {
      // Handle API errors gracefully by showing empty usage list
      console.log('No usage history found:', error)
      dispatch(setSubsidyUsage([]))
    }
  }

  useEffect(() => {
    // If user switches accounts, clear prior subsidy data to avoid leakage
    if (previousTokenRef.current && previousTokenRef.current !== userToken) {
      dispatch(clearSubsidy())
      setShowUsageHistory(false)
    }
    previousTokenRef.current = userToken

    fetchSubsidyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken])

  const handleShowUsageHistory = () => {
    if (!showUsageHistory && !usage) {
      fetchUsageHistory()
    }
    setShowUsageHistory(!showUsageHistory)
  }

  const renderUsageItem = ({ item }: { item: SubsidyUsage }) => {
    const isPositive = item.transaction_type === 'credit' || item.transaction_type === 'refund'
    const iconName = isPositive ? 'plus-circle' : 'minus-circle'
    const amountNumber =
      typeof item.amount === 'number' ? item.amount : Number(item.amount)
    const displayAmount = formatCurrency(
      Number.isFinite(amountNumber) ? Math.abs(amountNumber) : 0
    )
    const parsedDate = item.usage_date ? new Date(item.usage_date) : null
    const displayDate =
      parsedDate && !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString()
        : 'Date unavailable'

    return (
      <View style={styles.usageItem}>
        <FontAwesome5
          name={iconName}
          size={16}
          color={isPositive ? '#4ade80' : '#ef4444'}
        />
        <View style={styles.usageDetails}>
          <Text style={styles.usageDescription}>{formatUsageDescription(item.description)}</Text>
          <Text style={styles.usageDate}>
            {displayDate}
          </Text>
        </View>
        <Text style={[
          styles.usageAmount,
          { color: isPositive ? '#4ade80' : '#ef4444' }
        ]}>
          {isPositive ? '+' : '-'}{displayAmount}
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

  // Always show subsidy UI, even with zero balance
  const balanceToShow = balance || { total_balance: 0, available_balance: 0, used_balance: 0 }
  const subsidiesToShow = subsidies || []

  const renderHeaderComponent = () => (
    <View>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Subsidy</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balanceToShow.available_balance)}</Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Total</Text>
            <Text style={styles.balanceDetailValue}>{formatCurrency(balanceToShow.total_balance)}</Text>
          </View>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Used</Text>
            <Text style={styles.balanceDetailValue}>{formatCurrency(balanceToShow.used_balance)}</Text>
          </View>
        </View>
      </View>

      {/* Info Card for Zero Balance */}
      {balanceToShow.available_balance === 0 && (
        <View style={styles.infoCard}>
          <FontAwesome5 name="info-circle" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Subsidies are provided by RISE to help offset costs for sports activities and events.
          </Text>
        </View>
      )}

      {/* Active Subsidies */}
      {subsidiesToShow.length > 0 && (
        <View style={styles.subsidiesSection}>
          <Text style={styles.sectionTitle}>Active Subsidies</Text>
          {subsidiesToShow.map((subsidy) => (
            <View key={subsidy.id} style={styles.subsidyCard}>
              <View style={styles.subsidyHeader}>
                <Text style={styles.subsidyStatus}>{subsidy.status}</Text>
              </View>
              <Text style={styles.subsidyAmount}>{formatCurrency(subsidy.amount)}</Text>
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

      {/* Usage History Toggle */}
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
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={showUsageHistory && usage ? usage : []}
        renderItem={renderUsageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={
          showUsageHistory ? (
            <Text style={styles.emptyText}>No usage history available</Text>
          ) : null
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0B0B',
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
  listContainer: {
    padding: 16,
    paddingBottom: 20,
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
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  historyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 8,
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

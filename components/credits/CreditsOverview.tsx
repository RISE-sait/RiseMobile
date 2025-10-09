import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL, getCreditPackages } from '@/utils/api'
import { COLORS } from '@/constants/colors'
import type { CreditPackage } from '@/types/credit'

// Nested object structure for nullable fields
interface NullableString {
  String: string
  Valid: boolean
}

interface NullableTime {
  Time: string
  Valid: boolean
}

interface CreditsData {
  credits: number
  current_week_usage: number
  weekly_limit: number
}

interface CreditTransaction {
  id: string
  customer_id: string
  amount: number
  transaction_type: string
  event_id: string | null
  description: NullableString
  created_at: NullableTime
}

interface CreditsOverviewProps {
  userToken: string
}

export const CreditsOverview: React.FC<CreditsOverviewProps> = ({ userToken }) => {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)

  const fetchCreditsData = async () => {
    try {
      setLoading(true)

      // Initialize with default values
      let creditsData: CreditsData = {
        credits: 0,
        current_week_usage: 0,
        weekly_limit: 0,
      }

      try {
        // Fetch credits balance
        const creditsResponse = await axios.get<{ credits?: number; customer_id?: string }>(`${API_URL}/secure/credits`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })

        // Handle different response formats and null/undefined values
        creditsData.credits = creditsResponse.data?.credits ?? 0
      } catch {
        // Explicitly set default value when credits API fails
        // creditsData.credits remains 0 from initialization
      }

      try {
        // Fetch weekly usage
        const weeklyResponse = await axios.get<{
          current_week_usage?: number;
          weekly_limit?: number;
          customer_id?: string;
          remaining_credits?: number;
        }>(`${API_URL}/secure/credits/weekly-usage`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })

        // Handle different response formats and null/undefined values
        creditsData.current_week_usage = weeklyResponse.data?.current_week_usage ?? 0
        creditsData.weekly_limit = weeklyResponse.data?.weekly_limit ?? 0
      } catch {
        // Explicitly set default values when weekly usage API fails or returns error
        // This handles cases like 400 errors for users without credit packages
        creditsData.current_week_usage = 0
        creditsData.weekly_limit = 0
      }

      setCredits(creditsData)
    } catch (error) {
      console.error('Error fetching credits:', error)
      // Set default values even if there's an error
      setCredits({
        credits: 0,
        current_week_usage: 0,
        weekly_limit: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get<CreditTransaction[] | {
        customer_id?: string;
        limit?: number;
        offset?: number;
        transactions?: CreditTransaction[];
      }>(`${API_URL}/secure/credits/transactions`, {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      // Handle different response formats and ensure it's always an array
      const transactionsData = response.data
      if (Array.isArray(transactionsData)) {
        setTransactions(transactionsData)
      } else if (transactionsData?.transactions && Array.isArray(transactionsData.transactions)) {
        setTransactions(transactionsData.transactions)
      } else {
        // Handle case where backend returns null for transactions when user has no transaction history
        setTransactions([])
      }
    } catch (error) {
      // Handle API errors gracefully by showing empty transaction list
      setTransactions([])
    }
  }

  const fetchCreditPackages = async () => {
    try {
      setPackagesLoading(true)
      const result = await getCreditPackages()

      if (result.error) {
        console.error('Error fetching credit packages:', result.error)
        setCreditPackages([])
      } else {
        setCreditPackages(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching credit packages:', error)
      setCreditPackages([])
    } finally {
      setPackagesLoading(false)
    }
  }

  useEffect(() => {
    fetchCreditsData()
    fetchCreditPackages()
  }, [userToken])

  const handleShowTransactions = () => {
    if (!showTransactions) {
      fetchTransactions()
    }
    setShowTransactions(!showTransactions)
  }

  const renderTransaction = ({ item }: { item: CreditTransaction }) => {
    const isPositive = item.transaction_type === 'earned' || item.transaction_type === 'refund' || item.transaction_type === 'admin_adjustment'
    const iconName = item.transaction_type === 'earned' ? 'plus-circle' : item.transaction_type === 'spent' ? 'minus-circle' : 'undo'

    // Safely extract description and created_at from nested objects
    const description = item.description?.Valid ? item.description.String : 'No description'
    const createdAt = item.created_at?.Valid ? item.created_at.Time : new Date().toISOString()

    return (
      <View style={styles.transactionItem}>
        <FontAwesome5
          name={iconName}
          size={16}
          color={isPositive ? '#4ade80' : '#ef4444'}
        />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{description}</Text>
          <Text style={styles.transactionDate}>
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: isPositive ? '#4ade80' : '#ef4444' }
        ]}>
          {isPositive ? '+' : '-'}{Math.abs(item.amount)}
        </Text>
      </View>
    )
  }

  const renderCreditPackage = ({ item }: { item: CreditPackage }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View style={styles.packageTitleContainer}>
          <FontAwesome5 name="box" size={18} color={COLORS.primary} />
          <Text style={styles.packageName}>{item.name}</Text>
        </View>
        <Text style={styles.packagePrice}>${item.price.toFixed(2)}</Text>
      </View>

      {item.description && (
        <Text style={styles.packageDescription}>{item.description}</Text>
      )}

      <View style={styles.packageCreditsContainer}>
        <FontAwesome5 name="star" size={14} color={COLORS.primary} />
        <Text style={styles.packageCredits}>
          {item.credits_awarded} Credits
        </Text>
      </View>

      <TouchableOpacity
        style={styles.packageBuyButton}
        onPress={() => {
          // TODO: Implement purchase logic in future task
          console.log('Purchase package:', item.id)
        }}
      >
        <Text style={styles.packageBuyButtonText}>Purchase</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading credits...</Text>
      </View>
    )
  }

  // Always show credits UI, even with zero balance
  const creditsToShow = credits || { credits: 0, current_week_usage: 0, weekly_limit: 0 }

  const usagePercentage = creditsToShow.weekly_limit > 0 ? (creditsToShow.current_week_usage / creditsToShow.weekly_limit) * 100 : 0

  const renderHeaderComponent = () => (
    <View>
      {/* Credits Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <FontAwesome5 name="star" size={24} color={COLORS.primary} />
          <Text style={styles.balanceTitle}>Credits Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>{creditsToShow.credits}</Text>
        <Text style={styles.balanceSubtitle}>
          {creditsToShow.credits === 0 ? 'No credits available' : 'Available Credits'}
        </Text>
      </View>

      {/* Weekly Usage */}
      <View style={styles.usageCard}>
        <Text style={styles.usageTitle}>Weekly Usage</Text>
        <View style={styles.usageBar}>
          <View
            style={[
              styles.usageProgress,
              { width: `${Math.min(usagePercentage, 100)}%` }
            ]}
          />
        </View>
        <Text style={styles.usageText}>
          {creditsToShow.current_week_usage} / {creditsToShow.weekly_limit > 0 ? creditsToShow.weekly_limit : 'No limit'} credits used this week
        </Text>
      </View>

      {/* Info Card for Zero Balance */}
      {creditsToShow.credits === 0 && (
        <View style={styles.infoCard}>
          <FontAwesome5 name="info-circle" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Credits can be earned through participating in events, tournaments, or purchased through the app.
          </Text>
        </View>
      )}

      {/* Credit Packages Section */}
      <View style={styles.packagesSection}>
        <Text style={styles.packagesSectionTitle}>Purchase Credits</Text>
        {packagesLoading ? (
          <View style={styles.packagesLoadingContainer}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading packages...</Text>
          </View>
        ) : creditPackages.length > 0 ? (
          creditPackages.map((pkg) => (
            <View key={pkg.id}>
              {renderCreditPackage({ item: pkg })}
            </View>
          ))
        ) : (
          <Text style={styles.noPackagesText}>No credit packages available</Text>
        )}
      </View>

      {/* Transactions Toggle */}
      <TouchableOpacity style={styles.transactionsButton} onPress={handleShowTransactions}>
        <Text style={styles.transactionsButtonText}>
          {showTransactions ? 'Hide' : 'Show'} Transaction History
        </Text>
        <FontAwesome5
          name={showTransactions ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={showTransactions ? transactions : []}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={
          showTransactions ? (
            <Text style={styles.emptyText}>No transactions found</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  usageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  usageBar: {
    height: 8,
    backgroundColor: COLORS.cardDark,
    borderRadius: 4,
    marginBottom: 8,
  },
  usageProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  usageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transactionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
    paddingVertical: 20,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  packagesSection: {
    marginBottom: 16,
  },
  packagesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  packagesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  packageCreditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageCredits: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
  },
  packageBuyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  packageBuyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  noPackagesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
})

export default CreditsOverview
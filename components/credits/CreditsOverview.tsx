import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import axios from 'axios'
import { API_URL } from '@/utils/api'
import { COLORS } from '@/constants/colors'

interface CreditsData {
  balance: number
  weekly_usage: number
  weekly_limit: number
}

interface CreditTransaction {
  id: string
  amount: number
  type: 'earned' | 'spent' | 'refund'
  description: string
  created_at: string
}

interface CreditsOverviewProps {
  userToken: string
}

export const CreditsOverview: React.FC<CreditsOverviewProps> = ({ userToken }) => {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransactions, setShowTransactions] = useState(false)

  const fetchCreditsData = async () => {
    try {
      setLoading(true)

      // Initialize with default values
      let creditsData: CreditsData = {
        balance: 0,
        weekly_usage: 0,
        weekly_limit: 0,
      }

      try {
        // Fetch credits balance
        const creditsResponse = await axios.get(`${API_URL}/secure/credits`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })

        // Handle different response formats and null/undefined values
        creditsData.balance = creditsResponse.data?.balance ?? 0
      } catch (creditsError) {
      }

      try {
        // Fetch weekly usage
        const weeklyResponse = await axios.get(`${API_URL}/secure/credits/weekly-usage`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })

        // Handle different response formats and null/undefined values
        creditsData.weekly_usage = weeklyResponse.data?.weekly_usage ?? 0
        creditsData.weekly_limit = weeklyResponse.data?.weekly_limit ?? 0
      } catch (weeklyError) {
      }

      setCredits(creditsData)
    } catch (error) {
      console.error('Error fetching credits:', error)
      // Set default values even if there's an error
      setCredits({
        balance: 0,
        weekly_usage: 0,
        weekly_limit: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/secure/credits/transactions`, {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      // Handle different response formats and ensure it's always an array
      const transactionsData = response.data
      if (Array.isArray(transactionsData)) {
        setTransactions(transactionsData)
      } else if (transactionsData?.transactions && Array.isArray(transactionsData.transactions)) {
        setTransactions(transactionsData.transactions)
      } else {
        setTransactions([])
      }
    } catch (error) {
      setTransactions([])
    }
  }

  useEffect(() => {
    fetchCreditsData()
  }, [userToken])

  const handleShowTransactions = () => {
    if (!showTransactions) {
      fetchTransactions()
    }
    setShowTransactions(!showTransactions)
  }

  const renderTransaction = ({ item }: { item: CreditTransaction }) => {
    const isPositive = item.type === 'earned' || item.type === 'refund'
    const iconName = item.type === 'earned' ? 'plus-circle' : item.type === 'spent' ? 'minus-circle' : 'undo'

    return (
      <View style={styles.transactionItem}>
        <FontAwesome5
          name={iconName}
          size={16}
          color={isPositive ? '#4ade80' : '#ef4444'}
        />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.created_at).toLocaleDateString()}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading credits...</Text>
      </View>
    )
  }

  // Always show credits UI, even with zero balance
  const creditsToShow = credits || { balance: 0, weekly_usage: 0, weekly_limit: 0 }

  const usagePercentage = creditsToShow.weekly_limit > 0 ? (creditsToShow.weekly_usage / creditsToShow.weekly_limit) * 100 : 0

  const renderHeaderComponent = () => (
    <View>
      {/* Credits Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <FontAwesome5 name="star" size={24} color={COLORS.primary} />
          <Text style={styles.balanceTitle}>Credits Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>{creditsToShow.balance}</Text>
        <Text style={styles.balanceSubtitle}>
          {creditsToShow.balance === 0 ? 'No credits available' : 'Available Credits'}
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
          {creditsToShow.weekly_usage} / {creditsToShow.weekly_limit > 0 ? creditsToShow.weekly_limit : 'No limit'} credits used this week
        </Text>
      </View>

      {/* Info Card for Zero Balance */}
      {creditsToShow.balance === 0 && (
        <View style={styles.infoCard}>
          <FontAwesome5 name="info-circle" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Credits can be earned through participating in events, tournaments, or purchased through the app.
          </Text>
        </View>
      )}

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
})

export default CreditsOverview
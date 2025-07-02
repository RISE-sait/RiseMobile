import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Animated, 
  Dimensions,  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faCrown, 
  faCalendarAlt, 
  faCreditCard, 
  faCheckCircle, 
  faChevronRight,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "@/components/buttons/BackButton";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { setMembership } from "@/store/slices/membershipSlice";
import { getMembershipByCustomerId } from "@/utils/api"; 




// Define the structure of a payment history item
interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

type MembershipLevel = "bronze" | "silver" | "gold" | "platinum";

const getMembershipLevel = (planName: string): MembershipLevel => {
  if (!planName) return "bronze"; // fallback

  const lower = planName.toLowerCase();

  if (lower.includes("platinum")) return "platinum";
  if (lower.includes("gold")) return "gold";
  if (lower.includes("silver")) return "silver";
  if (lower.includes("tier 1") || lower.includes("girls u11") || lower.includes("full year"))
    return "gold";

  return "bronze";
};




const mockPaymentHistory: PaymentHistoryItem[] = [
  { id: '1', date: 'April 15, 2025', amount: '$49.99', status: 'completed' },
  { id: '2', date: 'March 15, 2025', amount: '$49.99', status: 'completed' },
  { id: '3', date: 'February 15, 2025', amount: '$49.99', status: 'completed' },
  { id: '4', date: 'January 15, 2025', amount: '$49.99', status: 'completed' }
];





// Membership level colors and gradients
const membershipColors = {
  bronze: {
    primary: '#CD7F32',
    gradient: ['#CD7F32', '#8B4513'],
    background: 'rgba(205, 127, 50, 0.1)'
  },
  silver: {
    primary: '#C0C0C0',
    gradient: ['#C0C0C0', '#808080'],
    background: 'rgba(192, 192, 192, 0.1)'
  },
  gold: {
    primary: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    background: 'rgba(255, 215, 0, 0.1)'
  },
  platinum: {
    primary: '#E5E4E2',
    gradient: ['#E5E4E2', '#A9A9A9'],
    background: 'rgba(229, 228, 226, 0.1)'
  }
};

const { width } = Dimensions.get('window');

const MembershipScreen: React.FC = () => {
   const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.user.data?.id); // ✅ inside component

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const membership = useSelector((state: RootState) => state.membership.data);

  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    const fetchMembership = async () => {
      if (!userId) return;

      try {
        const memberships = await getMembershipByCustomerId(userId);
        if (memberships?.length > 0) {
          dispatch(setMembership(memberships[0]));
        }
      } catch (error) {
        console.error("❌ Error fetching membership:", error);
      }
    };

    fetchMembership();
  }, [userId]);

  

      
      // Progress bar animation
      useEffect(() => {
        if (membership) {
          const daysRemaining = dayjs(membership.renewal_date).diff(dayjs(), "day");
          const progressValue = daysRemaining / 30;

          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]).start();

          Animated.timing(progressAnim, {
            toValue: progressValue > 1 ? 1 : progressValue,
            duration: 1000,
            useNativeDriver: false,
          }).start();
        }
      }, [membership]);



  const handleUpgradeMembership = () => {
    Alert.alert(
      "Upgrade Membership", 
      "Would you like to upgrade to our Platinum membership for $79.99/month?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "View Plans",
          onPress: () => Alert.alert("Membership Plans", "This feature will be available soon!")
        }
      ]
    );
  };

 
  const renderMembershipCard = () => {
    if (!membership) return null;
    
const level = getMembershipLevel(membership.membership_plan_name);
  const colors = membershipColors[level];
    
    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={colors.gradient as [ string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.membershipCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.membershipBadge}>
              <FontAwesomeIcon icon={faCrown} color="#FFFFFF" size={16} />
              <Text style={styles.membershipType}>
                {membership.membership_name}
              </Text>

            </View>
            
          </View>
          
          <View style={styles.cardBody}>
<Text style={styles.memberSince}>
  Member since {dayjs(membership.start_date).format("MMMM D, YYYY")}
</Text>
            <View style={styles.membershipProgress}>
              <Text style={styles.daysRemainingText}>
  {dayjs(membership.renewal_date).diff(dayjs(), "day")} days remaining
</Text>

              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }) 
                    }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#FFFFFF" size={14} />
<Text style={styles.footerText}>
  Next payment: {dayjs(membership.renewal_date).format("MMMM D, YYYY")}
</Text>
            </View>
            <View style={styles.footerItem}>
              <FontAwesomeIcon icon={faCreditCard} color="#FFFFFF" size={14} />
<Text style={styles.footerText}>$49.99/month</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

const renderBenefits = () => {
  if (!membership || typeof membership.membership_benefits !== "string") return null;

  const benefits: string[] = membership.membership_benefits
    .split("•")
    .filter((b): b is string => Boolean(b && b.trim())); // Strong type-safe filter

  return (
    <View style={styles.benefitsContainer}>
      <Text style={styles.sectionTitle}>Membership Benefits</Text>
      {benefits.map((benefit: string, index: number) => (
        <View key={index} style={styles.benefitItem}>
          <FontAwesomeIcon icon={faCheckCircle} color="#32CD32" size={16} />
          <Text style={styles.benefitText}>{benefit.trim()}</Text>
        </View>
      ))}
    </View>
  );
};




  const renderPaymentHistory = () => {
    if (!paymentHistory.length) return null;
    
    return (
      <View style={styles.paymentHistoryContainer}>
        <TouchableOpacity 
          style={styles.paymentHistoryHeader}
          onPress={() => setShowHistory(!showHistory)}
        >
          <View style={styles.paymentHistoryTitle}>
            <FontAwesomeIcon icon={faHistory} color="#FFFFFF" size={16} style={{marginRight: 10, alignSelf:"center", marginTop: -12}} />
            <Text style={styles.sectionTitle}>Payment History</Text>
          </View>
          <FontAwesomeIcon 
            icon={faChevronRight} 
            color="#FFFFFF" 
            size={16} 
            style={{ transform: [{ rotate: showHistory ? '90deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        
        {showHistory && (
          <View style={styles.paymentHistoryList}>
            {paymentHistory.map((payment) => (
              <View key={payment.id} style={styles.paymentHistoryItem}>
                <View>
                  <Text style={styles.paymentDate}>{payment.date}</Text>
                  <Text style={styles.paymentAmount}>{payment.amount}</Text>
                </View>
                <View style={[
                  styles.paymentStatusBadge,
                  { 
                    backgroundColor: 
                      payment.status === 'completed' ? 'rgba(50, 205, 50, 0.2)' : 
                      payment.status === 'pending' ? 'rgba(255, 165, 0, 0.2)' : 
                      'rgba(255, 69, 0, 0.2)' 
                  }
                ]}>
                  <Text style={[
                    styles.paymentStatusText,
                    { 
                      color: 
                        payment.status === 'completed' ? '#32CD32' : 
                        payment.status === 'pending' ? '#FFA500' : 
                        '#FF4500' 
                    }
                  ]}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Membership</Text>
      </View>

      
          
        
          <Animated.View style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Membership Card */}
            {renderMembershipCard()}
            
            {/* Membership Benefits */}
            {renderBenefits()}
            
            {/* Payment Method */}
            {/*renderPaymentMethod()*/}
            
            {/* Payment History */}
            {renderPaymentHistory()}
            
            {/* Upgrade Membership Button */}
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeMembership}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeGradient}
              >
                <FontAwesomeIcon icon={faCrown} color="#000000" size={18} style={styles.upgradeIcon} />
                <Text style={styles.upgradeText}>
                  Upgrade Membership
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            
          </Animated.View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  header: {
    flexDirection: "row",  // Align items in a row
    alignItems: "center",  // Center items vertically
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 12, // Add spacing between the BackButton and the title
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999999",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4500",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4500",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  membershipCard: {
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  membershipType: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 20,
  },
  memberSince: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  membershipProgress: {
    marginBottom: 8,
  },
  daysRemainingText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
  },
  benefitsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 12,
  },
  paymentMethodContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  paymentMethodCard: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  paymentMethodText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 12,
  },
  autoRenewalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoRenewalTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  autoRenewalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 4,
  },
  autoRenewalDescription: {
    color: "#999999",
    fontSize: 14,
  },
  autoRenewalToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleCircleOn: {
    transform: [{ translateX: 22 }],
  },
  paymentHistoryContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentHistoryTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // ✅ Ensures spacing between icon and text

  },
  paymentHistoryList: {
    marginTop: 16,
  },
  paymentHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  paymentDate: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 4,
  },
  paymentAmount: {
    color: "#999999",
    fontSize: 14,
  },
  paymentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  upgradeButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  upgradeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  upgradeIcon: {
    marginRight: 8,
  },
  upgradeText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  specialOffersContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
  },
  offerCard: {
    flexDirection: "row",
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  offerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  offerDescription: {
    color: "#999999",
    fontSize: 14,
    marginBottom: 12,
  },
  offerButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  offerButtonText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default MembershipScreen;

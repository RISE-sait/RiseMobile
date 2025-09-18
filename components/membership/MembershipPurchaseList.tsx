import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAllMembershipPlans, purchaseMembershipPlan } from "@/utils/api";
import { USE_MEMBERSHIP_TEST_MODE } from "@/utils/constants";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  benefits: string;
  price?: number;
}

interface MembershipPurchaseListProps {
  onPurchaseSuccess: () => void;
  onOpenPaymentWebView?: (url: string) => void;
}

const MembershipPurchaseList: React.FC<MembershipPurchaseListProps> = ({
  onPurchaseSuccess,
  onOpenPaymentWebView,
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call GET /memberships to get plan list
        const membershipPlans = await getAllMembershipPlans();

        setPlans(membershipPlans || []);
      } catch (error) {
        console.error("❌ Error fetching membership plans:", error);
        setError("Failed to load membership plans");
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipPlans();
  }, []);

  const handlePurchase = async (planId: string, planName: string) => {
    try {
      setPurchaseLoading(planId);

      // Call real API to initiate purchase
      const response = await purchaseMembershipPlan(planId);

      // If API returns payment_url, open WebView
      if (response && response.payment_url && onOpenPaymentWebView) {
        onOpenPaymentWebView(response.payment_url);
      } else {
        // API didn't return payment_url - show error message as per requirements
        Alert.alert(
          "Purchase Unavailable",
          "Unable to initiate purchase. Please try again later or contact support.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      // Use warn to avoid dev red banner while we show an Alert
      console.warn("❌ Purchase error:", error);
      const backendMessage: string | undefined = error?.message;
      const status: number | undefined = error?.status;

      // Provide specific UX for known backend message
      if (status === 409 && backendMessage?.includes("already has an active membership")) {
        Alert.alert(
          "Already Subscribed",
          "You already have an active membership for this plan.",
          [{ text: "OK" }]
        );
        return;
      }

      // Fallback error message
      Alert.alert(
        "Purchase Failed",
        backendMessage || "Unable to initiate purchase. Please try again later or contact support.",
        [{ text: "OK" }]
      );
    } finally {
      setPurchaseLoading(null);
    }
  };

  const renderBenefits = (benefitsString: string) => {
    if (!benefitsString) return null;

    const benefits = benefitsString
      .split("•")
      .filter((benefit) => benefit && benefit.trim())
      .map((benefit) => benefit.trim());

    return (
      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <FontAwesomeIcon icon={faCheck} color="#32CD32" size={12} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPlanCard = ({ item }: { item: MembershipPlan }) => (
    <View style={styles.planCard}>
      <LinearGradient
        colors={["#1A1A1A", "#2A2A2A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <FontAwesomeIcon icon={faCrown} color="#FFD700" size={20} />
            <Text style={styles.planName}>{item.name}</Text>
          </View>

          {/* Test Mode Indicator */}
          {USE_MEMBERSHIP_TEST_MODE && (
            <View style={styles.testModeBadge}>
              <Text style={styles.testModeText}>TEST MODE</Text>
            </View>
          )}

          {/* Price display */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {item.price ? `$${item.price.toFixed(2)}` : "Price: N/A"}
            </Text>
            {item.price && <Text style={styles.priceNote}>per month</Text>}
          </View>
        </View>

        {/* Plan Description */}
        {item.description && (
          <Text style={styles.planDescription}>{item.description}</Text>
        )}

        {/* Plan Benefits */}
        {item.benefits && renderBenefits(item.benefits)}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            purchaseLoading === item.id && styles.purchaseButtonLoading
          ]}
          onPress={() => handlePurchase(item.id, item.name)}
          disabled={purchaseLoading === item.id}
        >
          <Text style={styles.purchaseButtonText}>
            {purchaseLoading === item.id ? "Processing..." : "Purchase Plan"}
          </Text>
          {purchaseLoading === item.id && (
            <Text style={styles.purchaseButtonSubtext}>
              Initiating purchase...
            </Text>
          )}

          {/* Test Mode Note */}
          {USE_MEMBERSHIP_TEST_MODE && (
            <Text style={styles.testModeNote}>
              Note: All purchases will use test plan ID for now
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading membership plans...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Please try again later or contact support.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Membership Plan</Text>
        <Text style={styles.headerSubtitle}>
          Select a plan that best fits your needs
        </Text>
      </View>

      {/* Plans List */}
      <View style={styles.listContainer}>
        {plans.map((item) => (
          <View key={item.id}>
            {renderPlanCard({ item })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0C0B0B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#F0F0F0",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#999999",
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  planCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceText: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
  },
  priceNote: {
    color: "#999999",
    fontSize: 12,
    fontStyle: "italic",
  },
  planDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  purchaseButtonLoading: {
    backgroundColor: "#B8860B", // Darker gold when loading
  },
  purchaseButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  purchaseButtonSubtext: {
    color: "#777777",
    fontSize: 12,
    marginTop: 4,
  },
  testModeBadge: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  testModeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  testModeNote: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});

export default MembershipPurchaseList;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAllMembershipPlans, purchaseMembershipPlan, getPlansForMembership } from "@/utils/api";
import { USE_MEMBERSHIP_TEST_MODE } from "@/utils/constants";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  benefits: string;
  price?: number;
}

interface MembershipType {
  id: string;
  name: string;
  description: string;
}

interface MembershipSection {
  title: string;
  description: string;
  data: MembershipPlan[];
}

interface MembershipPurchaseListProps {
  onPurchaseSuccess: () => void;
  onOpenPaymentWebView?: (url: string) => void;
  onPurchaseCompleted?: () => void;
}

const MembershipPurchaseList: React.FC<MembershipPurchaseListProps> = ({
  onPurchaseSuccess,
  onOpenPaymentWebView,
  onPurchaseCompleted,
}) => {
  const [membershipSections, setMembershipSections] = useState<MembershipSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step a: Get all membership types
        console.log("🔄 Fetching membership types...");
        const membershipTypesResult = await getAllMembershipPlans();

        if (membershipTypesResult.error) {
          console.error("❌ Error fetching membership types:", membershipTypesResult.error);
          setError("Failed to load membership types");
          setLoading(false);
          return;
        }

        const membershipTypes: MembershipType[] = membershipTypesResult.data || [];
        console.log(`✅ Found ${membershipTypes.length} membership types`);

        if (membershipTypes.length === 0) {
          console.log("ℹ️ No membership types found");
          setMembershipSections([]);
          setLoading(false);
          return;
        }

        // Step b: Concurrently fetch plans for each membership type
        console.log("🔄 Fetching plans for all membership types...");
        const planPromises = membershipTypes.map(type =>
          getPlansForMembership(type.id)
        );

        const plansResults = await Promise.all(planPromises);

        // Step c: Combine data into SectionList format
        const combinedData: MembershipSection[] = membershipTypes.map((type, index) => {
          const plansResult = plansResults[index];
          const plans = plansResult.error ? [] : (plansResult.data || []);

          if (plansResult.error) {
            console.warn(`⚠️ Failed to fetch plans for membership type "${type.name}":`, plansResult.error);
          } else {
            console.log(`✅ Found ${plans.length} plans for membership type "${type.name}"`);
          }

          return {
            title: type.name,
            description: type.description || "",
            data: plans
          };
        });

        // Step d: Update state
        setMembershipSections(combinedData);
        console.log("✅ Successfully loaded all membership data");

      } catch (error) {
        // Step e: Error handling
        console.error("❌ Unexpected error fetching membership data:", error);
        setError("Failed to load membership information");
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

  const handlePurchase = async (planId: string, planName: string) => {
    setPurchaseLoading(planId);
    try {
      // Call API which now returns { data, error }
      const result: any = await purchaseMembershipPlan(planId);

      if (result?.error) {
        const status: number | undefined = result.error.status;
        const backendMessage: string | undefined = result.error.message;

        if (status === 409) {
          Alert.alert(
            "Already Subscribed",
            backendMessage || "You already have an active membership for this plan.",
            [{ text: "OK" }]
          );
          return;
        }

        Alert.alert(
          "Purchase Failed",
          backendMessage || "Unable to initiate purchase. Please try again later or contact support.",
          [{ text: "OK" }]
        );
        return;
      }

      // Success path
      const data = result?.data;
      if (data && data.payment_url && onOpenPaymentWebView) {
        onOpenPaymentWebView(data.payment_url);
        // Call the completion callback to trigger refresh when payment is initiated
        if (onPurchaseCompleted) {
          onPurchaseCompleted();
        }
      } else {
        Alert.alert(
          "Purchase Unavailable",
          "Unable to initiate purchase. Please try again later or contact support.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.warn("❌ Purchase error:", error);
      Alert.alert(
        "Purchase Failed",
        (error as Error)?.message || "Unable to initiate purchase. Please try again later or contact support.",
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
            purchaseLoading !== null && styles.purchaseButtonLoading
          ]}
          onPress={() => handlePurchase(item.id, item.name)}
          disabled={purchaseLoading !== null}
        >
          {purchaseLoading === item.id ? (
            <View style={styles.buttonLoadingContainer}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={[styles.purchaseButtonText, { marginLeft: 8 }]}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={styles.purchaseButtonText}>
              Purchase Plan
            </Text>
          )}

          {/* Test Mode Note (removed per request) */}
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

  const renderSectionHeader = ({ section }: { section: MembershipSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.description && (
        <Text style={styles.sectionDescription}>{section.description}</Text>
      )}
    </View>
  );

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
      <SectionList
        sections={membershipSections}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => renderPlanCard({ item })}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionDescription: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MembershipPurchaseList;
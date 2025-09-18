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
import { auth } from "@/firebase/firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrown, faCheck, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAllMembershipPlans, purchaseMembershipPlan, getPlansForMembership, refreshBackendJwt } from "@/utils/api";
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
  id: string;
  title: string;
  description: string;
  data: MembershipPlan[];
  loading?: boolean;
  error?: {
    message: string;
    type: string;
  } | null;
}

interface MembershipPurchaseListProps {
  onPurchaseSuccess: () => void;
  onOpenPaymentWebView?: (url: string) => void;
  onPurchaseCompleted?: () => void;
  headerComponent?: React.ReactNode;
}

const MembershipPurchaseList: React.FC<MembershipPurchaseListProps> = ({
  onPurchaseSuccess,
  onOpenPaymentWebView,
  onPurchaseCompleted,
  headerComponent,
}) => {
  const [membershipSections, setMembershipSections] = useState<MembershipSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  // Track which section is expanded, null means all collapsed
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);


  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

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

        // Step b: Initialize sections with loading states
        const initialSections: MembershipSection[] = membershipTypes.map(type => ({
          id: type.id,
          title: type.name,
          description: type.description || "",
          data: [],
          loading: true,
          error: null
        }));

        // Update state to show loading sections
        setMembershipSections(initialSections);

        // Step c: Fetch plans for each membership type with retry mechanism
        console.log("🔄 Fetching plans for all membership types...");
        const planPromises = membershipTypes.map(type =>
          fetchPlansWithRetry(type.id)
        );

        const plansResults = await Promise.all(planPromises);

        // Step d: Update sections with actual data
        const updatedSections: MembershipSection[] = membershipTypes.map((type, index) => {
          const plansResult = plansResults[index];
          const plans = plansResult.error ? [] : (plansResult.data || []);

          if (plansResult.error) {
            console.warn(`⚠️ Failed to fetch plans for membership type "${type.name}":`, plansResult.error);
          } else {
            console.log(`✅ Found ${plans.length} plans for membership type "${type.name}"`);
          }

          // Add a placeholder item for error/empty states when expanded
          let sectionData = plans;
          if (plans.length === 0) {
            // Add a placeholder item for empty/error state rendering
            sectionData = [{
              id: `${type.id}_placeholder`,
              name: '',
              description: '',
              benefits: '',
              price: 0
            }];
          }

          return {
            id: type.id,
            title: type.name,
            description: type.description || "",
            data: sectionData,
            loading: false,
            error: plansResult.error ? {
              message: plansResult.error.message,
              type: plansResult.error.type || 'unknown'
            } : null
          };
        });

        // Step e: Update state
        setMembershipSections(updatedSections);
        console.log("✅ Successfully loaded all membership data");

      } catch (error) {
        // Step e: Error handling
        console.error("❌ Unexpected error fetching membership data:", error);
        setError("Failed to load membership information");
      } finally {
        setLoading(false);
      }
    };

    const initializeDataFetch = () => {
      if (auth.currentUser) {
        fetchMembershipData();
      } else {
        console.log("⏳ Waiting for Firebase user to be ready before fetching membership data...");
        unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            console.log("✅ Firebase user is ready, fetching membership data...");
            fetchMembershipData();
          } else {
            console.warn("⚠️ Firebase user is not authenticated.");
            setError("User not authenticated");
            setLoading(false);
          }
        });
      }
    };

    initializeDataFetch();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Handle accordion section toggle
  const handleToggleSection = (sectionId: string) => {
    if (expandedSectionId === sectionId) {
      setExpandedSectionId(null); // Collapse if already expanded
    } else {
      setExpandedSectionId(sectionId); // Expand new section, auto-collapse others
    }
  };

  // Retry mechanism for fetching plans with auth error handling
  const fetchPlansWithRetry = async (membershipId: string, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch plans for membership ${membershipId}`);

      const result = await getPlansForMembership(membershipId);

      // If successful, return the result
      if (!result.error) {
        return result;
      }

      // If it's an auth error and we haven't exhausted retries, try refreshing token
      if (result.error.type === 'auth' && attempt < maxRetries) {
        console.log(`🔄 Auth error detected for membership ${membershipId}, refreshing token...`);
        try {
          await refreshBackendJwt();
          console.log(`✅ Token refreshed, retrying fetch for membership ${membershipId}...`);
          // Continue to next iteration to retry
        } catch (refreshError) {
          console.error(`❌ Failed to refresh token for membership ${membershipId}:`, refreshError);
          // Return the original error if token refresh fails
          return result;
        }
      } else {
        // Non-auth error or exhausted retries, return the error
        return result;
      }
    }

    // Should not reach here, but return error as fallback
    return {
      data: null,
      error: {
        message: `Failed to fetch plans for membership ${membershipId} after ${maxRetries} attempts`,
        status: 500,
        type: 'retry_exhausted'
      }
    };
  };

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
    <View style={styles.accordionPlanCard}>
      <LinearGradient
        colors={["#1A1A1A", "#2A2A2A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accordionCardGradient}
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
              {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : "Price not available"}
            </Text>
            {typeof item.price === 'number' && <Text style={styles.priceNote}>per month</Text>}
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

  const renderSectionHeader = ({ section }: { section: MembershipSection }) => {
    const isExpanded = expandedSectionId === section.id;

    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => handleToggleSection(section.id)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderContent}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.description && (
              <Text style={styles.sectionDescription}>{section.description}</Text>
            )}
          </View>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            color="#FFD700"
            size={16}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <View>
      {/* Custom header component passed from parent */}
      {headerComponent}

      {/* Original header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Membership Plan</Text>
        <Text style={styles.headerSubtitle}>
          Select a plan that best fits your needs
        </Text>
      </View>
    </View>
  );

  return (
    <SectionList
      style={styles.container}
      sections={membershipSections}
      keyExtractor={(item, index) => item.id + index}
      renderItem={({ item, section }) => {
        // Only render if this section is expanded
        if (expandedSectionId !== section.id) {
          return null;
        }

        // Handle loading state
        if (section.loading) {
          return (
            <View style={styles.sectionStateContainer}>
              <ActivityIndicator size="small" color="#FFD700" />
              <Text style={styles.sectionStateText}>Loading plans...</Text>
            </View>
          );
        }

        // Handle error state
        if (section.error) {
          return (
            <View style={styles.sectionStateContainer}>
              <Text style={styles.sectionErrorText}>
                {section.error.type === 'auth'
                  ? 'Authentication failed. Please log in again.'
                  : section.error.message}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  // Trigger a reload for this specific section
                  console.log(`🔄 Retrying fetch for section ${section.id}`);
                  // You could implement section-specific retry here
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        }

        // Handle empty state (no plans available)
        if (item.id.endsWith('_placeholder')) {
          return (
            <View style={styles.sectionStateContainer}>
              <Text style={styles.sectionStateText}>
                No plans available for this membership type
              </Text>
            </View>
          );
        }

        // Render normal plan card
        return renderPlanCard({ item });
      }}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={renderListHeader}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  accordionPlanCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  accordionCardGradient: {
    padding: 16,
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
    backgroundColor: "#1A1A1A",
  },
  sectionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderText: {
    flex: 1,
    marginRight: 12,
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
  sectionStateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  sectionStateText: {
    color: "#999999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  sectionErrorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MembershipPurchaseList;
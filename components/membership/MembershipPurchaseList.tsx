import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrown, faCheck, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAllMembershipPlans, purchaseMembershipPlan, getPlansForMembership } from "@/utils/api";
import type { RootState } from "@/store";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";
import useFeedbackDialog from "@/hooks/useFeedbackDialog";
import { useAuth } from "@/utils/auth";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  benefits: string;
  price?: number | string;
  joining_fee_price?: string;
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
  loaded?: boolean;
}

interface MembershipPurchaseListProps {
  onPurchaseSuccess: () => void;
  onOpenPaymentWebView?: (url: string) => void;
  onPurchaseCompleted?: () => void;
  headerComponent?: React.ReactNode;
  hasExistingMembership?: boolean;
}

const MembershipPurchaseList: React.FC<MembershipPurchaseListProps> = ({
  onPurchaseSuccess,
  onOpenPaymentWebView,
  onPurchaseCompleted,
  headerComponent,
  hasExistingMembership = false,
}) => {
  const [membershipSections, setMembershipSections] = useState<MembershipSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState<string | null>(null);
  // Track which section is expanded, null means all collapsed
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Get user data from Redux store (same pattern as other screens)
  const user = useSelector((state: RootState) => state.user.data);

  // Use custom feedback dialog instead of Alert.alert
  const dialog = useFeedbackDialog();
  const hideDialog = dialog.hide;
  const { getValidToken } = useAuth();
  const jwtRef = useRef<string | null>(null);
  const interactionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

  const ensureAuthToken = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      jwtRef.current = null;
    }

    if (jwtRef.current) {
      return jwtRef.current;
    }

    const token = await getValidToken();
    if (token) {
      jwtRef.current = token;
    }
    return token;
  }, [getValidToken]);

  useEffect(() => {
    return () => {
      hideDialog();
      jwtRef.current = null;
    };
  }, [hideDialog]);


  useEffect(() => {
    const fetchMembershipData = async () => {
      setLoading(true);
      setError(null);

      try {
        const membershipTypesResult = await getAllMembershipPlans();

        if (membershipTypesResult.error) {
          console.warn("⚠️ Error fetching membership types:", membershipTypesResult.error);
          setError("Failed to load membership types");
          setLoading(false);
          return;
        }

        const membershipTypes: MembershipType[] = membershipTypesResult.data || [];

        if (membershipTypes.length === 0) {
          setMembershipSections([]);
          setLoading(false);
          return;
        }

        const initialSections: MembershipSection[] = membershipTypes.map((type) => ({
          id: type.id,
          title: type.name,
          description: type.description || "",
          data: [],
          loading: false,
          error: null,
          loaded: false,
        }));

        setMembershipSections(initialSections);
      } catch (error) {
        console.warn("⚠️ Unexpected error fetching membership data:", error);
        setError("Failed to load membership information");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
      interactionRef.current?.cancel()
      interactionRef.current = InteractionManager.runAfterInteractions(() => {
        fetchMembershipData()
      })
    } else {
      console.warn("⚠️ User not authenticated in Redux store.");
      setError("User not authenticated");
      setLoading(false);
    }

    return () => {
      interactionRef.current?.cancel()
      interactionRef.current = null
    }
  }, [user]);

  useEffect(() => {
    jwtRef.current = null;
  }, [user?.id]);

  // Retry mechanism for fetching plans with auth error handling
  const fetchPlansWithRetry = async (membershipId: string, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const authToken = await ensureAuthToken(attempt > 1)
      if (!authToken) {
        return {
          data: null,
          error: {
            message: "Unable to authenticate with backend",
            status: 401,
            type: 'auth'
          }
        }
      }

      const result = await getPlansForMembership(membershipId, authToken)

      // If successful, filter plans by is_visible field and return the result
      if (!result.error) {
        // Filter to only show visible plans (is_visible === true)
        const visiblePlans = (result.data || []).filter((plan: any) => plan.is_visible === true);
        return {
          ...result,
          data: visiblePlans
        };
      }

      // Gracefully handle 503 errors (membership with no plans configured)
      // This is a known backend issue - treat as empty plans instead of error
      if (result.error.status === 503) {
        return {
          data: [],
          error: null
        };
      }

      // If it's an auth error and we haven't exhausted retries, try refreshing token
      if (result.error.type === 'auth' && attempt < maxRetries) {
        await ensureAuthToken(true)
        continue
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

  const loadSectionPlans = async (sectionId: string) => {
    setMembershipSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, loading: true, error: null }
          : section
      )
    );

    const result = await fetchPlansWithRetry(sectionId);

    setMembershipSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const plans = result.error ? [] : (result.data || []);
        const data = plans.length
          ? plans
          : [
              {
                id: `${sectionId}_placeholder`,
                name: "",
                description: "",
                benefits: "",
                price: 0,
              },
            ];

        return {
          ...section,
          data,
          loading: false,
          loaded: true,
          error: result.error
            ? {
                message: result.error.message,
                type: result.error.type || "unknown",
              }
            : null,
        };
      })
    );
  };

  const handleToggleSection = (sectionId: string) => {
    console.log("🟡 Section toggle - ID:", sectionId, "| Current expanded:", expandedSectionId);
    if (expandedSectionId === sectionId) {
      console.log("🟡 Collapsing section");
      setExpandedSectionId(null);
      return;
    }

    console.log("🟡 Expanding section");
    setExpandedSectionId(sectionId);
    const target = membershipSections.find((section) => section.id === sectionId);
    if (target && !target.loaded && !target.loading) {
      console.log("🟡 Loading section plans for:", sectionId);
      loadSectionPlans(sectionId);
    } else {
      console.log("🟡 Section already loaded or loading:", {
        loaded: target?.loaded,
        loading: target?.loading,
        plansCount: target?.data?.length
      });
    }
  };

  const retryFetchPlans = async (sectionId: string) => {
    try {
      await loadSectionPlans(sectionId);
    } catch (error: any) {
      setMembershipSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                loading: false,
                error: {
                  message:
                    error?.message ||
                    "Failed to refresh plans. Please try again later.",
                  type: "retry_failed",
                },
              }
            : section
        )
      );
    }
  };

  const handlePurchase = async (planId: string, planName: string) => {
    console.log("🔷 handlePurchase called - Plan:", planName, "| ID:", planId);
    setPurchaseLoadingId(planId);

    // Set a timeout to reset loading state if request takes too long
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Purchase request timeout - resetting loading state");
      setPurchaseLoadingId(null);
      dialog.show(
        "Request Timeout",
        "The purchase request is taking longer than expected. Please try again.",
        [{ text: "OK", onPress: () => {}, style: "primary" }],
        "clock",
        "#E8920F"
      );
    }, 30000); // 30 second timeout

    try {
      console.log("🔷 Calling purchaseMembershipPlan API...");
      // Call API which now returns { data, error }
      const result: any = await purchaseMembershipPlan(planId);
      console.log("🔷 API call completed. Result:", result);

      // Clear timeout if request completes
      clearTimeout(timeoutId);

      if (result?.error) {
        console.log("🔷 Error detected - Status:", result.error.status, "| Message:", result.error.message);
        const status: number | undefined = result.error.status;
        let backendMessage: string | undefined = result.error.message;

        // Parse Stripe error if present in the message
        if (backendMessage && backendMessage.includes("Subscription setup failed:")) {
          try {
            const stripeErrorMatch = backendMessage.match(/Subscription setup failed: ({.*})/);
            if (stripeErrorMatch) {
              const stripeError = JSON.parse(stripeErrorMatch[1]);
              // Extract user-friendly message from Stripe error
              if (stripeError.code === "resource_missing" && stripeError.param === "customer") {
                backendMessage = "Your account is not set up for payments yet. Please contact support to set up your payment account.";
              } else if (stripeError.message) {
                backendMessage = stripeError.message;
              }
            }
          } catch (parseError) {
            console.warn("⚠️ Failed to parse Stripe error:", parseError);
            // Keep original message if parsing fails
          }
        }

        if (status === 409) {
          console.log("🔷 Showing 'Already Subscribed' dialog");
          dialog.show(
            "Already Subscribed",
            backendMessage || "You already have an active membership for this plan.",
            [{ text: "OK", onPress: () => {}, style: "primary" }],
            "user-check",
            "#FCA311"
          );
          return;
        }

        console.log("🔷 Showing 'Purchase Failed' dialog with message:", backendMessage);
        dialog.show(
          "Purchase Failed",
          backendMessage || "Unable to initiate purchase. Please try again later or contact support.",
          [{ text: "OK", onPress: () => {}, style: "primary" }],
          "circle-xmark",
          "#EF4444"
        );
        return;
      }

      // Success path
      const data = result?.data;
      if (data && data.payment_url && onOpenPaymentWebView) {
        onOpenPaymentWebView(data.payment_url);
        // Defer refresh until the WebView flow reports completion
        if (onPurchaseCompleted) {
          console.log("ℹ️ Purchase initiated via WebView; deferring onPurchaseCompleted until flow finishes.");
        }
        return;
      } else {
        dialog.show(
          "Purchase Unavailable",
          "Unable to initiate purchase. Please try again later or contact support.",
          [{ text: "OK", onPress: () => {}, style: "primary" }],
          "circle-exclamation",
          "#E8920F"
        );
      }
    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      console.warn("❌ Purchase error:", error);
      dialog.show(
        "Purchase Failed",
        (error as Error)?.message || "Unable to initiate purchase. Please try again later or contact support.",
        [{ text: "OK", onPress: () => {}, style: "primary" }],
        "circle-xmark",
        "#EF4444"
      );
    } finally {
      // Ensure loading state is always cleared
      clearTimeout(timeoutId);
      setPurchaseLoadingId(null);
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

  const renderPlanCard = ({ item }: { item: MembershipPlan }) => {
    const joiningFeeRaw = item.joining_fee_price?.toString().trim() ?? "";
    const joiningFeeClean = joiningFeeRaw.replace(/[^0-9.]/g, "");
    const joiningFeeValue = joiningFeeClean ? Number(joiningFeeClean) : NaN;
    const shouldShowJoiningFee =
      !!joiningFeeRaw &&
      Number.isFinite(joiningFeeValue) &&
      joiningFeeValue > 0;

    // Format price for display
    const formattedPrice = item.price
      ? (typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price.toString().replace(/\$\$/g, '$'))
      : null;

    return (
      <View style={styles.accordionPlanCard}>
        <LinearGradient
          colors={["#1C1C1E", "#2C2C2E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accordionCardGradient}
        >
          {/* Plan Name with Icon */}
          <View style={styles.planTitleRow}>
            <View style={styles.planIconContainer}>
              <FontAwesomeIcon icon={faCrown} color="#FCA311" size={16} />
            </View>
            <Text style={styles.planName}>{item.name}</Text>
          </View>

          {/* Price Section - Prominent Display */}
          <View style={styles.pricingSection}>
            <View style={styles.priceRow}>
              {formattedPrice ? (
                <>
                  <Text style={styles.priceAmount}>{formattedPrice}</Text>
                  <Text style={styles.pricePeriod}>/bi-weekly</Text>
                </>
              ) : (
                <Text style={styles.priceUnavailable}>Contact for pricing</Text>
              )}
            </View>

            {/* Joining Fee - Subtle display */}
            {shouldShowJoiningFee && (
              <Text style={styles.joiningFeeText}>
                + {joiningFeeRaw.replace(/\$\$/g, '$')} one-time joining fee
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

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
              purchaseLoadingId === item.id && styles.purchaseButtonLoading
            ]}
            onPress={() => {
              handlePurchase(item.id, item.name);
            }}
            disabled={purchaseLoadingId === item.id}
            activeOpacity={0.8}
          >
            {purchaseLoadingId === item.id ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={[styles.purchaseButtonText, { marginLeft: 8 }]}>
                  Processing...
                </Text>
              </View>
            ) : (
              <Text style={styles.purchaseButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

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
            color="#FCA311"
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
    </View>
  );

  // If user has existing membership, show header but minimal upgrade content
  if (hasExistingMembership) {
    return (
      <View style={styles.container}>
        {headerComponent}
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#999999', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            Membership upgrades and changes will be available soon.{'\n'}Contact support for assistance with your current membership.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
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
                <ActivityIndicator size="small" color="#FCA311" />
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
                  onPress={() => retryFetchPlans(section.id)}
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
      <FeedbackDialog
        visible={dialog.visible}
        title={dialog.config.title}
        message={dialog.config.message}
        icon={dialog.config.icon}
        iconColor={dialog.config.iconColor}
        buttons={dialog.config.buttons}
        onDismiss={dialog.hide}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#999999",
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
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
    marginHorizontal: 4,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  accordionCardGradient: {
    padding: 20,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.3,
  },
  pricingSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  pricePeriod: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  priceUnavailable: {
    color: "#888888",
    fontSize: 16,
    fontStyle: "italic",
  },
  joiningFeeText: {
    color: "#FCA311",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginBottom: 16,
  },
  planDescription: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 14,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  benefitText: {
    color: "#E0E0E0",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: "#FCA311",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FCA311",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonLoading: {
    backgroundColor: "#B8960B",
    shadowOpacity: 0.1,
  },
  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  purchaseButtonSubtext: {
    color: "#777777",
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#141414",
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#252525",
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
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 18,
  },
  sectionStateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#141414",
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#252525",
  },
  sectionStateText: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
  sectionErrorText: {
    color: "#EF4444",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FCA311",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default MembershipPurchaseList;

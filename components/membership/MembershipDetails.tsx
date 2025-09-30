import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCrown,
  faCalendarAlt,
  faCheckCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";

interface MembershipData {
  membership_name?: string;
  membership_plan_name?: string;
  membership_description?: string;
  membership_benefits?: string;
  price?: string;
  start_date?: string;
  renewal_date?: string;
  next_payment_date?: string | null;
  status?: string;
  benefits?: string;
}

interface MembershipDetailsProps {
  membership: MembershipData;
  onRefresh: () => void;
}

const MembershipDetails: React.FC<MembershipDetailsProps> = ({
  membership,
  onRefresh,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (renewalDate?: string) => {
    if (!renewalDate) return 0;
    try {
      const renewal = new Date(renewalDate);
      const today = new Date();
      const timeDiff = renewal.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(0, daysDiff);
    } catch {
      return 0;
    }
  };

  const renderBenefits = (benefitsString?: string) => {
    if (!benefitsString) return null;

    const benefits = benefitsString
      .split("•")
      .filter((benefit) => benefit && benefit.trim())
      .map((benefit) => benefit.trim());

    if (benefits.length === 0) return null;

    return (
      <View style={styles.benefitsContainer}>
        <Text style={styles.sectionTitle}>Membership Benefits</Text>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <FontAwesomeIcon icon={faCheckCircle} color="#32CD32" size={14} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    );
  };

  const daysRemaining = getDaysRemaining(membership.renewal_date);
  const progressPercentage = Math.min((daysRemaining / 30) * 100, 100);


  return (
    <>
      <View style={styles.container}>
      {/* Membership Card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.membershipCard}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.membershipBadge}>
              <FontAwesomeIcon icon={faCrown} color="#000000" size={18} />
              <Text
              style={styles.membershipType}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
                {membership.membership_name || "Premium Member"}
              </Text>
            </View>
            {/* Info Icon for more details */}
            <TouchableOpacity onPress={() => setShowDetailsModal(true)}>
              <FontAwesomeIcon icon={faInfoCircle} color="#000000" size={18} />
            </TouchableOpacity>
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
            <Text
              style={styles.planName}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {membership.membership_plan_name || "Unknown Plan"}
            </Text>
            <Text style={styles.memberSince}>
              Member since {formatDate(membership.start_date)}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <Text style={styles.daysRemainingText}>
                {daysRemaining} days remaining
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Card Footer */}
          {membership.next_payment_date && (
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <FontAwesomeIcon icon={faCalendarAlt} color="#000000" size={14} />
                <Text style={styles.footerText}>
                  Next Payment Date: {formatDate(membership.next_payment_date)}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Membership Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <FontAwesomeIcon icon={faInfoCircle} color="#32CD32" size={16} />
          <Text style={styles.statusTitle}>Membership Status</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {(membership.status || "Active").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Benefits Section */}
      {(membership.membership_benefits || membership.benefits) &&
        renderBenefits(membership.membership_benefits || membership.benefits)}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Refresh Membership Data</Text>
        </TouchableOpacity>
      </View>

      {/* Full Details Modal */}
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Membership Details</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDetailsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
        <ScrollView style={styles.modalContent}>
          {/* Membership Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Membership Name:</Text>
            <Text style={styles.detailValue}>
              {membership.membership_name || "N/A"}
            </Text>
          </View>

          {/* Plan Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan Name:</Text>
            <Text style={styles.detailValue}>
              {membership.membership_plan_name || "N/A"}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>
              {membership.price || "N/A"}
            </Text>
          </View>

          {/* Member Since */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Member Since:</Text>
            <Text style={styles.detailValue}>
              {formatDate(membership.start_date)}
            </Text>
          </View>

          {/* Next Payment Date */}
          {membership.next_payment_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Payment Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(membership.next_payment_date)}
              </Text>
            </View>
          )}

          {/* Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadgeModal}>
              <Text style={styles.statusTextModal}>
                {(membership.status || "Active").toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Description */}
          {membership.membership_description ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.detailText}>
                {membership.membership_description}
              </Text>
            </View>
          ) : null}

          {/* Benefits */}
          {(membership.membership_benefits || membership.benefits) && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {renderBenefits(membership.membership_benefits || membership.benefits)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  membershipCard: {
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  membershipType: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  cardBody: {
    marginBottom: 20,
  },
  planName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  memberSince: {
    color: "#333333",
    fontSize: 14,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 8,
  },
  daysRemainingText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.2)",
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#000000",
    fontSize: 14,
    marginLeft: 8,
  },
  statusContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: "rgba(50, 205, 50, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    color: "#32CD32",
    fontSize: 14,
    fontWeight: "600",
  },
  benefitsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
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
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: "#444444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#0C0B0B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#FFD700",
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  detailLabel: {
    color: "#999999",
    fontSize: 16,
    flex: 1,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  detailSection: {
    marginTop: 20,
  },
  detailText: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadgeModal: {
    backgroundColor: "rgba(50, 205, 50, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusTextModal: {
    color: "#32CD32",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MembershipDetails;
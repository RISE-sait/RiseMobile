import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, ActivityIndicator, Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCart } from "./cartContext";
import { Ionicons } from "@expo/vector-icons";

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const { cart, clearCart } = useCart(); // ✅ Use cart context
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Check if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      router.replace("/screens/store/store");
    }
  }, [cart]);

  // ✅ Simulated Payment Processing
  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Payment Successful", "Thank you for your purchase!");
      clearCart(); // ✅ Empty the cart after "payment"
      router.replace("/screens/store/store"); // ✅ Redirect to store
    }, 2000); // Simulates a 2-second processing time
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] px-4 pt-5">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      {/* 🛒 Checkout Header */}
      <View className="py-5">
        <Text className="text-center text-3xl font-bold text-[#F0F0F0]">🛒 Checkout</Text>
      </View>

      {/* 🏷️ Order Summary */}
      <View className="bg-[#1D1C1E] p-5 rounded-xl shadow-md">
        <Text className="text-[#F0F0F0] text-xl font-bold text-center">
          Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
        </Text>
      </View>

      {/* 🚨 Loading Indicator */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCA311" />
          <Text className="text-gray-400 mt-3">Processing payment...</Text>
        </View>
      ) : (
        <>
          {/* 💳 Proceed to Payment */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FCA311",
              paddingVertical: 16,
              borderRadius: 30,
              shadowColor: "#FCA311",
              shadowOpacity: 0.4,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              marginTop: 20,
              width: "100%",
              alignSelf: "center",
            }}
            onPress={handlePayment}
          >
            <Ionicons name="card-outline" size={24} color="#0C0B0B" style={{ marginRight: 10 }} />
            <Text
              style={{
                color: "#0C0B0B",
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Proceed to Payment
            </Text>
          </TouchableOpacity>

          {/* ⬅️ Back to Store */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#444",
              paddingVertical: 16,
              borderRadius: 30,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              marginTop: 10,
              width: "100%",
              alignSelf: "center",
            }}
            onPress={() => router.replace("/screens/store/store")}
          >
            <Ionicons name="arrow-back" size={24} color="#F0F0F0" style={{ marginRight: 10 }} />
            <Text
              style={{
                color: "#F0F0F0",
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Back to Store
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default CheckoutScreen;

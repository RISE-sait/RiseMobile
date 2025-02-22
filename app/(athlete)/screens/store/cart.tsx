import React from "react";
import { 
  View, Text, FlatList, Image, TouchableOpacity, Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "./cartContext"; // ✅ Import useCart hook

const CartScreen: React.FC = () => {
  const { cart, removeFromCart, updateQuantity } = useCart(); // ✅ Use updated functions
  const router = useRouter();

  // ✅ Calculate Total Price
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderCartItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1D1C1E", // 🖤 Dark card for contrast
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      {/* 🖼 Product Image */}
      <Image
        source={{ uri: item.image }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 12,
          backgroundColor: "#0C0B0B",
        }}
        resizeMode="cover"
      />

      {/* 📝 Product Info */}
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: "#F0F0F0", fontSize: 18, fontWeight: "bold" }}>
          {item.name}
        </Text>
        <Text style={{ color: "#FCA311", fontSize: 16, fontWeight: "600", marginTop: 3 }}>
          ${item.price.toFixed(2)}
        </Text>
      </View>

      {/* ➖➕ Quantity Controls */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
          <Ionicons name="remove-circle-outline" size={28} color="#FCA311" />
        </TouchableOpacity>
        <Text style={{ color: "#F0F0F0", fontSize: 18, fontWeight: "600", marginHorizontal: 12 }}>
          {item.quantity}
        </Text>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Ionicons name="add-circle-outline" size={28} color="#FCA311" />
        </TouchableOpacity>
      </View>

      {/* 🗑 Remove Button */}
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
        <Ionicons name="trash-outline" size={26} color="#FF5555" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingHorizontal: 16, paddingTop: 10 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* 🔙 Back Button */}
      <TouchableOpacity
        onPress={() => router.replace("/screens/store/store")}
        style={{
          position: "absolute",
          top: 40,
          left: 15,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: 12,
          borderRadius: 50,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        }}
      >
        <Ionicons name="chevron-back" size={28} color="#F0F0F0" />
      </TouchableOpacity>

      {/* 🛒 Header */}
      <View style={{ paddingTop: 20, paddingBottom: 15, alignItems: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#F0F0F0" }}>🛒 My Cart</Text>
        <Text style={{ fontSize: 16, color: "#A0A0A0", marginTop: 5 }}>Review your items</Text>
      </View>

      {/* 📦 Empty Cart */}
      {cart.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: "#A0A0A0" }}>Your cart is empty 😢</Text>
        </View>
      ) : (
        <>
          {/* 🛍 Cart Items */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={{ paddingBottom: 120, marginTop: 10 }}
          />

          {/* 💳 Total & Checkout */}
          <View
            style={{
              backgroundColor: "#1D1C1E",
              padding: 16,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              position: "absolute",
              bottom: 20,
              width: "90%",
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#F0F0F0", fontSize: 18 }}>Total:</Text>
              <Text style={{ color: "#FCA311", fontSize: 22, fontWeight: "bold" }}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>

            {/* 🏁 Proceed to Checkout Button */}
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
    width: "100%",
    alignSelf: "center",
  }}
  onPress={() => {
    if (cart.length > 0) {
      router.replace({
        pathname: "/screens/store/checkout", // ✅ Navigate with cart data
        params: { cart: JSON.stringify(cart) },
      });
    } else {
      Alert.alert("Cart is empty", "Add items before checking out.");
    }
  }}
>
  <Ionicons name="card-outline" size={24} color="#0C0B0B" style={{ marginRight: 10 }} />
  <Text style={{
    color: "#0C0B0B",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  }}>
    Checkout
  </Text>
</TouchableOpacity>

          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

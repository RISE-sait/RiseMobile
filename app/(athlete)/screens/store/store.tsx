import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { mockProducts, Product } from "./storeData"; // ✅ Import centralized data
import { home } from '@/assets/icons/home.png';

const { width } = Dimensions.get("window");
const itemWidth = width / 2 - 24; // Two-column layout with spacing

const StoreScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Simulate API Call to Fetch Products
  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts); // ✅ Use centralized data
      setLoading(false);
    }, 1500);
  }, []);

  // Handle Buy Now Button
  const handleBuyNow = (productId: string) => {
    router.push(`/screens/store/product-details/${productId}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        width: itemWidth,
        marginBottom: 16,
        backgroundColor: "#1D1C1E", // Dark gray card
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
      onPress={() => handleBuyNow(item.id)}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.image }}
        style={{
          width: "100%",
          height: 130,
          borderRadius: 12,
          backgroundColor: "#0C0B0B",
        }}
        resizeMode="cover"
      />
      <Text style={{ color: "#F0F0F0", fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
        {item.name}
      </Text>
      <Text style={{ color: "#FCA311", fontSize: 14, fontWeight: "600", marginTop: 5 }}>
        ${item.price.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingHorizontal: 16, paddingTop: 10 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.replace('/(athlete)/(tabs)/home')}
        style={{
          position: "absolute",
          top: 70,
          left: 30,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
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

      {/* Header */}
      <View style={{ paddingTop: 20, paddingBottom: 15, alignItems: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#F0F0F0" }}>🏪 RISE Store</Text>
        <Text style={{ fontSize: 16, color: "#A0A0A0", marginTop: 5 }}>Find your perfect gear</Text>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FCA311" />
          <Text style={{ color: "#A0A0A0", marginTop: 10 }}>Loading store items...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2} // ✅ Display as a grid
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100, marginTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Cart Button (Nike-style) */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 25,
          right: 20,
          backgroundColor: "#FCA311",
          padding: 16,
          borderRadius: 50,
          shadowColor: "#FCA311",
          shadowOpacity: 0.5,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => router.replace("/screens/store/cart")}
      >
        <Ionicons name="cart-outline" size={28} color="#0C0B0B" />
        <Text style={{ color: "#0C0B0B", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
          Cart
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StoreScreen;

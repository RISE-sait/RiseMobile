import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, Alert, Animated, Dimensions, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { mockProducts, Product } from "../storeData";
import { useCart } from "../cartContext";

const { width } = Dimensions.get("window");

const ProductDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const { addToCart } = useCart(); 

  const product = mockProducts.find((p) => p.id === id);
  const [added, setAdded] = useState(false);
  const scaleAnim = new Animated.Value(1);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-[#1D1C1E] px-4 pt-5 justify-center items-center">
        <Text className="text-[#F0F0F0] text-xl">Product not found.</Text>
      </SafeAreaView>
    );
  }

  // quantity adding to cart
const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  
    Alert.alert("Added to Cart", `${product.name} has been added!`);
  };
  

  return (
    <SafeAreaView className="flex-1 bg-[#1D1C1E] position-relative">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      {/* 🔙 Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
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
          zIndex: 10,
        }}
      >
        <Ionicons name="chevron-back" size={28} color="#F0F0F0" />
      </TouchableOpacity>

      <ScrollView>
        {/* 📸 Large Product Image */}
        <View className="w-full h-96 bg-[#0C0B0B] rounded-b-3xl flex justify-center items-center shadow-lg">
          <Image source={{ uri: product.image }} style={{ width: width * 0.9, height: 300 }} resizeMode="contain" />
        </View>

        {/* 📝 Product Details */}
        <View className="px-6 pt-6">
          <Text className="text-[#F0F0F0] text-3xl font-bold tracking-wide">{product.name}</Text>
          <Text className="text-[#FCA311] text-xl font-semibold mt-2">${product.price.toFixed(2)}</Text>
          <Text className="text-[#F0F0F0] text-lg mt-3 leading-6">
            This is a high-performance sports product designed for elite athletes. 
            Lightweight, durable, and built for performance.
          </Text>

          {/* 🚀 Features (Nike / Adidas Style) */}
          <View className="mt-5">
            <Text className="text-[#F0F0F0] font-semibold text-lg">Features:</Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="checkmark-circle" size={20} color="#FCA311" />
              <Text className="text-[#F0F0F0] text-md ml-2">Breathable, high-quality material</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Ionicons name="checkmark-circle" size={20} color="#FCA311" />
              <Text className="text-[#F0F0F0] text-md ml-2">Designed for durability</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Ionicons name="checkmark-circle" size={20} color="#FCA311" />
              <Text className="text-[#F0F0F0] text-md ml-2">Sleek, modern aesthetic</Text>
            </View>
          </View>

          {/* 🛒 Add to Cart Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity
    onPress={handleAddToCart}
    disabled={added}
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: added ? "#1D1C1E" : "#FCA311", // ✅ Darker when added
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 30, // ✅ Rounded for modern UI
      marginTop: 20,
      shadowColor: "#FCA311",
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      width: "100%",
      alignSelf: "center",
    }}
  >
    {/* ✅ Transition to Check Icon when Added */}
    {added ? (
      <Ionicons name="checkmark-circle" size={24} color="#F0F0F0" />
    ) : (
      <Text
        style={{
          color: "#0C0B0B",
          fontSize: 18,
          fontWeight: "bold",
          textTransform: "uppercase", // ✅ Gives modern, sports-brand look
          letterSpacing: 1,
        }}
      >
        Add to Cart
      </Text>
    )}
  </TouchableOpacity>
</Animated.View>

          {/* 🛍 Go to Cart Button (Nike/Shopify Inspired) */}
          <TouchableOpacity
  onPress={() => router.replace("/screens/store/cart")}
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCA311",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 15,
    shadowColor: "#FCA311",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    width: "100%",
    alignSelf: "center",
  }}
>
  <Ionicons name="cart-outline" size={24} color="#0C0B0B" style={{ marginRight: 10 }} />
  <Text
    style={{
      color: "#0C0B0B",
      fontSize: 18,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    }}
  >
    Go to Cart
  </Text>
</TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

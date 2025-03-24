import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { mockProducts, Product } from "./storeData";
import BackButton from "@/components/buttons/BackButton";
import PageTitle from "@/components/PageTitle";
import ProductCard from "@/components/store/ProductCard";
import LoadingIndicator from "@/components/feedback/LoadingIndicator";
import FloatingCartButton from "@/components/store/FloatingCartButton";

const StoreScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B", paddingHorizontal: 16 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <BackButton  />

      <View className="items-center">
        <PageTitle 
        title="🏪 RISE Store" 
        />
      </View>

      {loading ? (
        <LoadingIndicator text="Loading store items..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100, marginTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingCartButton />
    </SafeAreaView>
  );
};

export default StoreScreen;

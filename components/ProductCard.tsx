import React from 'react';
import { TouchableOpacity, Image, Text, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '../app/(athlete)/screens/store/storeData';

const { width } = Dimensions.get("window");
const itemWidth = width / 2 - 24;

interface ProductCardProps {
  item: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{
        width: itemWidth,
        marginBottom: 16,
        backgroundColor: "#1D1C1E",
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
      onPress={() => router.push(`/screens/store/product-details/${item.id}`)}
    >
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
};

export default ProductCard;

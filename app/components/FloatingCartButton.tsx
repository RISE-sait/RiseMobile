import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FloatingCartButton: React.FC = () => {
  const router = useRouter();

  return (
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
  );
};

export default FloatingCartButton;

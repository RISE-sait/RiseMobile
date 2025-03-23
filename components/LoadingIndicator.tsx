import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingIndicatorProps {
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text = "Loading..." }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#FCA311" />
    <Text style={{ color: "#A0A0A0", marginTop: 10 }}>{text}</Text>
  </View>
);

export default LoadingIndicator;

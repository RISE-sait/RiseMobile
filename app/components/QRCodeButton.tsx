import React from "react";
import { TouchableOpacity, Image, GestureResponderEvent } from "react-native";
import images from "@/constants/images";

interface QRCodeButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const QRCodeButton: React.FC<QRCodeButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-12 h-12 bg-gray-900 rounded-full flex justify-center items-center shadow-md"
    >
      <Image
        source={images.qrcode}
        className="w-6 h-6"
        style={{ resizeMode: "contain" }}
      />
    </TouchableOpacity>
  );
};

export default QRCodeButton;

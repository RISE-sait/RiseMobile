import React from "react";
import { TouchableOpacity, View } from "react-native";
import { usePathname, useRouter, useSegments, useNavigation } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const BackButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const navigation = useNavigation();

  const handleBack = () => {
    const canGoBack = router.canGoBack?.() ?? false;
    const navState = navigation.getState();

    // 🔍 Step 2: Log detailed router state when back button pressed using useNavigation()
    console.log("[BackButton] 🔙 pressed", {
      pathname,
      segments: segments.join("/") || "(root)",
      canGoBack,
      navState: navState ? {
        type: navState.type,
        index: navState.index,
        routes: navState.routes?.map((r: any) => ({
          name: r.name,
          key: r.key,
          params: r.params,
        })),
        routeCount: navState.routes?.length,
        currentRoute: navState.routes?.[navState.index],
      } : "unavailable",
    });
    console.log("[BackButton] 🔙 Full navState:", JSON.stringify(navState, null, 2));

    if (!canGoBack) {
      console.warn("[BackButton] ⚠️ Cannot go back - stack might be empty or at root");
    }

    router.back();

    // Log state after navigation
    setTimeout(() => {
      const afterState = navigation.getState();
      console.log("[BackButton] ✅ AFTER back:", {
        pathname: pathname,
        canGoBack: router.canGoBack?.() ?? null,
        navState: afterState ? {
          type: afterState.type,
          index: afterState.index,
          routeCount: afterState.routes?.length,
        } : "unavailable",
      });
      console.log("[BackButton] ✅ Full navState after:", JSON.stringify(afterState, null, 2));
    }, 100);
  };

  return (
    <View className="flex items-start">
      <TouchableOpacity
        onPress={handleBack}
        className="bg-black-100/40 rounded-full items-center justify-center"
        style={{ height: 40, width: 40 }}
      >
        <FontAwesome6 name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;

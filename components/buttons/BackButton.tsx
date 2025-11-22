import React from "react";
import { TouchableOpacity, View } from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const BackButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const handleBack = () => {
    const canGoBack = router.canGoBack?.() ?? false;
    const routerState = router.getState?.();

    // 🔍 Step 2: Log detailed router state when back button pressed
    console.log("[BackButton] 🔙 pressed", {
      pathname,
      segments: segments.join("/") || "(root)",
      canGoBack,
      routerState: routerState ? {
        index: routerState.index,
        routes: routerState.routes?.map((r: any) => ({
          name: r.name,
          key: r.key,
          params: r.params,
        })),
        routeCount: routerState.routes?.length,
        currentRoute: routerState.routes?.[routerState.index],
      } : "unavailable",
    });

    if (!canGoBack) {
      console.warn("[BackButton] ⚠️ Cannot go back - stack might be empty or at root");
    }

    router.back();

    // Log state after navigation
    setTimeout(() => {
      const afterState = router.getState?.();
      console.log("[BackButton] ✅ AFTER back:", {
        pathname: router.pathname || "unknown",
        canGoBack: router.canGoBack?.() ?? null,
        routerState: afterState ? {
          index: afterState.index,
          routeCount: afterState.routes?.length,
        } : "unavailable",
      });
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

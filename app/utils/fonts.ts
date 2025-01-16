import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    "Bebas-Neue": require("../../assets/fonts/BebasNeue-Regular.ttf"),
    // Add other fonts here
  });

  return fontsLoaded;
};

/**
 * Seasonal Splash Screen Component
 * Displays a full-screen seasonal splash image based on current date
 * Simplified implementation: direct switch without fade animation
 */

import React, { useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import {
  getCurrentSeasonalTheme,
  getSeasonalSplashImage,
  SeasonalTheme,
} from '../utils/seasonalSplash';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SeasonalSplashProps {
  visible: boolean;
  onHide: () => void;
  displayDuration?: number;
}

export const SeasonalSplash: React.FC<SeasonalSplashProps> = ({
  visible,
  onHide,
  displayDuration = 2000,
}) => {
  const theme = useRef<SeasonalTheme>(getCurrentSeasonalTheme()).current;
  const splashImage = useRef(getSeasonalSplashImage(theme)).current;

  useEffect(() => {
    if (!visible) return;

    // Show splash for specified duration, then hide directly
    const timer = setTimeout(() => {
      onHide();
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [visible, displayDuration, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Image
        source={splashImage}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#000000', // Fallback while image loads
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default SeasonalSplash;

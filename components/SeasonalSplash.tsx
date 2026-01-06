/**
 * Seasonal Splash Screen Component
 * Displays a themed splash screen overlay based on the current date/season
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import {
  getCurrentSeasonalTheme,
  getSeasonalThemeInfo,
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const theme = useRef<SeasonalTheme>(getCurrentSeasonalTheme()).current;
  const themeInfo = useRef(getSeasonalThemeInfo(theme)).current;
  const splashImage = useRef(getSeasonalSplashImage(theme)).current;

  useEffect(() => {
    if (!visible) return;

    // Show splash for specified duration, then animate out
    const timer = setTimeout(() => {
      // Animate fade out with slight scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [visible, displayDuration, fadeAnim, scaleAnim, onHide]);

  if (!visible) return null;

  const isDefault = theme === 'default';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: themeInfo.primaryColor,
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Decorative elements for seasonal themes */}
      {!isDefault && (
        <View style={styles.decorContainer}>
          {renderSeasonalDecorations(theme, themeInfo.secondaryColor)}
        </View>
      )}

      {/* Main content */}
      <Animated.View
        style={[
          styles.contentContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Logo */}
        <Image
          source={splashImage}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Seasonal message */}
        {themeInfo.message && (
          <Text style={[styles.message, { color: themeInfo.secondaryColor }]}>
            {themeInfo.message}
          </Text>
        )}
      </Animated.View>

      {/* Bottom accent for seasonal themes */}
      {!isDefault && (
        <View
          style={[
            styles.bottomAccent,
            { backgroundColor: themeInfo.secondaryColor },
          ]}
        />
      )}
    </Animated.View>
  );
};

/**
 * Render seasonal-specific decorations
 */
function renderSeasonalDecorations(theme: SeasonalTheme, accentColor: string) {
  switch (theme) {
    case 'christmas':
      return (
        <>
          <View style={[styles.snowflake, styles.snowflake1, { borderColor: accentColor }]} />
          <View style={[styles.snowflake, styles.snowflake2, { borderColor: accentColor }]} />
          <View style={[styles.snowflake, styles.snowflake3, { borderColor: accentColor }]} />
        </>
      );
    case 'halloween':
      return (
        <>
          <View style={[styles.pumpkin, styles.pumpkin1, { backgroundColor: accentColor }]} />
          <View style={[styles.pumpkin, styles.pumpkin2, { backgroundColor: accentColor }]} />
        </>
      );
    case 'valentines':
      return (
        <>
          <Text style={[styles.heart, styles.heart1]}>❤️</Text>
          <Text style={[styles.heart, styles.heart2]}>💕</Text>
          <Text style={[styles.heart, styles.heart3]}>❤️</Text>
        </>
      );
    case 'summer':
      return (
        <>
          <Text style={[styles.summerIcon, styles.summerIcon1]}>☀️</Text>
          <Text style={[styles.summerIcon, styles.summerIcon2]}>🏀</Text>
        </>
      );
    case 'stpatricks':
      return (
        <>
          <Text style={[styles.clover, styles.clover1]}>🍀</Text>
          <Text style={[styles.clover, styles.clover2]}>🍀</Text>
          <Text style={[styles.clover, styles.clover3]}>🍀</Text>
        </>
      );
    case 'easter':
      return (
        <>
          <Text style={[styles.easterIcon, styles.easterIcon1]}>🐰</Text>
          <Text style={[styles.easterIcon, styles.easterIcon2]}>🥚</Text>
        </>
      );
    case 'thanksgiving':
      return (
        <>
          <Text style={[styles.thanksgivingIcon, styles.thanksgivingIcon1]}>🦃</Text>
          <Text style={[styles.thanksgivingIcon, styles.thanksgivingIcon2]}>🍂</Text>
        </>
      );
    case 'newyear':
      return (
        <>
          <Text style={[styles.newyearIcon, styles.newyearIcon1]}>🎆</Text>
          <Text style={[styles.newyearIcon, styles.newyearIcon2]}>🎉</Text>
          <Text style={[styles.newyearIcon, styles.newyearIcon3]}>✨</Text>
        </>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    maxWidth: 300,
    maxHeight: 300,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  // Christmas decorations
  snowflake: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  snowflake1: { top: '10%', left: '15%' },
  snowflake2: { top: '20%', right: '20%' },
  snowflake3: { top: '35%', left: '25%' },
  // Halloween decorations
  pumpkin: {
    position: 'absolute',
    width: 30,
    height: 25,
    borderRadius: 15,
  },
  pumpkin1: { bottom: '15%', left: '10%' },
  pumpkin2: { bottom: '20%', right: '15%' },
  // Valentine's decorations
  heart: {
    position: 'absolute',
    fontSize: 24,
  },
  heart1: { top: '12%', left: '20%' },
  heart2: { top: '18%', right: '15%' },
  heart3: { bottom: '25%', left: '15%' },
  // Summer decorations
  summerIcon: {
    position: 'absolute',
    fontSize: 32,
  },
  summerIcon1: { top: '10%', right: '15%' },
  summerIcon2: { bottom: '15%', left: '10%' },
  // St. Patrick's decorations
  clover: {
    position: 'absolute',
    fontSize: 24,
  },
  clover1: { top: '10%', left: '15%' },
  clover2: { top: '25%', right: '20%' },
  clover3: { bottom: '20%', left: '25%' },
  // Easter decorations
  easterIcon: {
    position: 'absolute',
    fontSize: 28,
  },
  easterIcon1: { top: '12%', right: '18%' },
  easterIcon2: { bottom: '18%', left: '12%' },
  // Thanksgiving decorations
  thanksgivingIcon: {
    position: 'absolute',
    fontSize: 28,
  },
  thanksgivingIcon1: { top: '10%', left: '15%' },
  thanksgivingIcon2: { bottom: '15%', right: '15%' },
  // New Year decorations
  newyearIcon: {
    position: 'absolute',
    fontSize: 28,
  },
  newyearIcon1: { top: '8%', left: '20%' },
  newyearIcon2: { top: '15%', right: '15%' },
  newyearIcon3: { bottom: '20%', left: '15%' },
});

export default SeasonalSplash;

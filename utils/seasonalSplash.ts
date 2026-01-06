/**
 * Seasonal Splash Screen Utility
 * Determines which seasonal splash image to display based on current date
 *
 * Seasons:
 * - Spring: March 20 - June 20
 * - Summer: June 21 - September 21
 * - Fall: September 22 - December 14
 * - Winter: December 15 - March 19 (when not holiday)
 * - Holiday: December 15 - January 5 (overrides Winter)
 */

import { Dimensions, Platform } from 'react-native';

export type SeasonalTheme = 'default' | 'spring' | 'summer' | 'fall' | 'winter' | 'holiday';

// Phone splash images
const PHONE_IMAGES = {
  default: require('../assets/images/splash/riseSplash.png'),
  spring: require('../assets/images/splash/rise_splash_spring.png'),
  summer: require('../assets/images/splash/rise_splash_summer.png'),
  fall: require('../assets/images/splash/rise_splash_fall.png'),
  winter: require('../assets/images/splash/rise_splash_winter.png'),
  holiday: require('../assets/images/splash/rise_splash_holiday.png'),
};

// Tablet splash images (default uses phone version as fallback)
const TABLET_IMAGES = {
  default: require('../assets/images/splash/riseSplash.png'), // No tablet version, use phone
  spring: require('../assets/images/splash/rise_splash_spring_tablet.png'),
  summer: require('../assets/images/splash/rise_splash_summer_tablet.png'),
  fall: require('../assets/images/splash/rise_splash_fall_tablet.png'),
  winter: require('../assets/images/splash/rise_splash_winter_tablet.png'),
  holiday: require('../assets/images/splash/rise_splash_holiday_tablet.png'),
};

/**
 * Check if device is a tablet based on screen dimensions
 */
export function isTablet(): boolean {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  const screenSize = Math.sqrt(width * width + height * height);

  // Tablets typically have:
  // - Larger screen size (diagonal > 900 points)
  // - Lower aspect ratio (closer to 4:3 vs phone's 16:9)
  if (Platform.OS === 'ios') {
    // iPad detection: screen diagonal > 900 points or aspect ratio < 1.6
    return screenSize > 900 || aspectRatio < 1.6;
  } else {
    // Android tablet detection
    return screenSize > 900 && aspectRatio < 1.6;
  }
}

/**
 * Get the current seasonal theme based on today's date
 */
export function getCurrentSeasonalTheme(): SeasonalTheme {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-indexed
  const day = today.getDate();

  // Holiday period: December 15 - January 5 (overrides winter)
  if ((month === 12 && day >= 15) || (month === 1 && day <= 5)) {
    return 'holiday';
  }

  // Spring: March 20 - June 20
  if ((month === 3 && day >= 20) || (month > 3 && month < 6) || (month === 6 && day <= 20)) {
    return 'spring';
  }

  // Summer: June 21 - September 21
  if ((month === 6 && day >= 21) || (month > 6 && month < 9) || (month === 9 && day <= 21)) {
    return 'summer';
  }

  // Fall: September 22 - December 14
  if ((month === 9 && day >= 22) || (month > 9 && month < 12) || (month === 12 && day <= 14)) {
    return 'fall';
  }

  // Winter: December 15 - March 19 (but holiday takes priority Dec 15 - Jan 5)
  // This covers: Jan 6 - Mar 19, Dec 15 - Dec 31 (but holiday overrides)
  if ((month >= 1 && month < 3) || (month === 3 && day < 20) || (month === 12 && day >= 15)) {
    return 'winter';
  }

  return 'default';
}

/**
 * Get the splash image source for the current theme and device type
 */
export function getSeasonalSplashImage(theme?: SeasonalTheme): number {
  const currentTheme = theme ?? getCurrentSeasonalTheme();
  const useTablet = isTablet();

  if (useTablet) {
    return TABLET_IMAGES[currentTheme];
  }

  return PHONE_IMAGES[currentTheme];
}

/**
 * Check if we should show the seasonal splash (any theme except default)
 */
export function shouldShowSeasonalSplash(): boolean {
  const theme = getCurrentSeasonalTheme();
  // Always show seasonal splash for non-default themes
  // For default, we rely on the native splash screen
  return theme !== 'default';
}

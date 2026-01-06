/**
 * Seasonal Splash Screen Utility
 * Determines which seasonal theme to display based on current date
 */

export type SeasonalTheme =
  | 'default'
  | 'christmas'
  | 'valentines'
  | 'stpatricks'
  | 'easter'
  | 'summer'
  | 'halloween'
  | 'thanksgiving'
  | 'newyear';

interface SeasonalConfig {
  theme: SeasonalTheme;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  // For holidays that vary by year (like Easter, Thanksgiving)
  getDynamicDates?: (year: number) => { start: Date; end: Date };
}

// Static seasonal configurations
const SEASONAL_CONFIGS: SeasonalConfig[] = [
  {
    theme: 'newyear',
    name: 'New Year',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 7, // New Year celebration period
  },
  {
    theme: 'valentines',
    name: "Valentine's Day",
    startMonth: 2,
    startDay: 10,
    endMonth: 2,
    endDay: 15,
  },
  {
    theme: 'stpatricks',
    name: "St. Patrick's Day",
    startMonth: 3,
    startDay: 14,
    endMonth: 3,
    endDay: 18,
  },
  {
    theme: 'easter',
    name: 'Easter',
    startMonth: 3,
    startDay: 20,
    endMonth: 4,
    endDay: 25,
    // Easter date varies - this is a simplified range
    getDynamicDates: (year: number) => {
      const easterDate = calculateEasterDate(year);
      const start = new Date(easterDate);
      start.setDate(start.getDate() - 3);
      const end = new Date(easterDate);
      end.setDate(end.getDate() + 1);
      return { start, end };
    },
  },
  {
    theme: 'summer',
    name: 'Summer',
    startMonth: 6,
    startDay: 1,
    endMonth: 8,
    endDay: 31,
  },
  {
    theme: 'halloween',
    name: 'Halloween',
    startMonth: 10,
    startDay: 20,
    endMonth: 11,
    endDay: 1,
  },
  {
    theme: 'thanksgiving',
    name: 'Thanksgiving',
    startMonth: 11,
    startDay: 20,
    endMonth: 11,
    endDay: 30,
    // US Thanksgiving is 4th Thursday of November
    getDynamicDates: (year: number) => {
      const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // 4th Thursday of November (month 10 = Nov)
      const start = new Date(thanksgiving);
      start.setDate(start.getDate() - 3);
      const end = new Date(thanksgiving);
      end.setDate(end.getDate() + 3);
      return { start, end };
    },
  },
  {
    theme: 'christmas',
    name: 'Christmas',
    startMonth: 12,
    startDay: 15,
    endMonth: 12,
    endDay: 31,
  },
];

/**
 * Calculate Easter Sunday date using Anonymous Gregorian algorithm
 */
function calculateEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Get the nth weekday of a month
 * @param year - Full year
 * @param month - 0-indexed month (0 = January, 10 = November)
 * @param weekday - Day of week (0 = Sunday, 4 = Thursday)
 * @param n - Which occurrence (1 = first, 4 = fourth)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let dayOffset = weekday - firstWeekday;
  if (dayOffset < 0) dayOffset += 7;
  const nthDay = 1 + dayOffset + (n - 1) * 7;
  return new Date(year, month, nthDay);
}

/**
 * Check if a date falls within a seasonal range
 */
function isDateInRange(
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  // Handle year wrap (e.g., Christmas Dec 15 - Jan 3)
  if (startMonth > endMonth) {
    // Range wraps around year end
    return (
      (month > startMonth || (month === startMonth && day >= startDay)) ||
      (month < endMonth || (month === endMonth && day <= endDay))
    );
  }

  // Normal range within same year
  if (month < startMonth || month > endMonth) return false;
  if (month === startMonth && day < startDay) return false;
  if (month === endMonth && day > endDay) return false;
  return true;
}

/**
 * Get the current seasonal theme based on today's date
 */
export function getCurrentSeasonalTheme(): SeasonalTheme {
  const today = new Date();
  const year = today.getFullYear();

  for (const config of SEASONAL_CONFIGS) {
    // Check dynamic dates first (for holidays like Easter, Thanksgiving)
    if (config.getDynamicDates) {
      const { start, end } = config.getDynamicDates(year);
      if (today >= start && today <= end) {
        return config.theme;
      }
    }

    // Check static date ranges
    if (isDateInRange(today, config.startMonth, config.startDay, config.endMonth, config.endDay)) {
      return config.theme;
    }
  }

  return 'default';
}

/**
 * Get seasonal theme info for display
 */
export function getSeasonalThemeInfo(theme: SeasonalTheme): {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  message?: string;
} {
  const themeInfo: Record<SeasonalTheme, { name: string; primaryColor: string; secondaryColor: string; message?: string }> = {
    default: {
      name: 'RISE',
      primaryColor: '#000000',
      secondaryColor: '#F5A623',
    },
    christmas: {
      name: 'Happy Holidays',
      primaryColor: '#1B4D3E',
      secondaryColor: '#C41E3A',
      message: 'Season\'s Greetings from RISE!',
    },
    valentines: {
      name: "Valentine's Day",
      primaryColor: '#8B0000',
      secondaryColor: '#FF69B4',
      message: 'Love the Game!',
    },
    stpatricks: {
      name: "St. Patrick's Day",
      primaryColor: '#009A44',
      secondaryColor: '#FFD700',
      message: 'Lucky to Play!',
    },
    easter: {
      name: 'Easter',
      primaryColor: '#9370DB',
      secondaryColor: '#98FB98',
      message: 'Spring into Action!',
    },
    summer: {
      name: 'Summer',
      primaryColor: '#FF8C00',
      secondaryColor: '#00CED1',
      message: 'Summer Training!',
    },
    halloween: {
      name: 'Halloween',
      primaryColor: '#1C1C1C',
      secondaryColor: '#FF6600',
      message: 'Scary Good Skills!',
    },
    thanksgiving: {
      name: 'Thanksgiving',
      primaryColor: '#8B4513',
      secondaryColor: '#DAA520',
      message: 'Grateful for the Game!',
    },
    newyear: {
      name: 'New Year',
      primaryColor: '#000080',
      secondaryColor: '#FFD700',
      message: 'New Year, New Goals!',
    },
  };

  return themeInfo[theme];
}

/**
 * Get the splash image source for a seasonal theme
 * Returns require() for static images or URI for remote images
 */
export function getSeasonalSplashImage(theme: SeasonalTheme): number {
  // All themes use the same base logo - we apply styling in the component
  // This allows for a single optimized asset with dynamic theming
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../assets/images/splash-icon.png');
}

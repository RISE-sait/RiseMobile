/**
 * Navigation Utilities - Robust routing for different booking/item types
 * 
 * Provides type-safe navigation across all user roles and item types
 * Supports: practices, matches/games, events, appointments, child details, etc.
 */

export type BookingType = 
  | 'practice' 
  | 'match' 
  | 'game' 
  | 'event' 
  | 'course'
  | 'appointment'
  | 'child'
  | 'haircut'
  | 'playground'
  | 'others';

export type UserRole =
  | 'coach'
  | 'athlete';

/**
 * Get the appropriate detail route based on item type and user role
 * Supports robust navigation for different booking types across all user roles
 */
export const getDetailRouteForType = (type: string, id: string, userRole?: string): string => {
  
  // Normalize type to lowercase
  const normalizedType = type?.toLowerCase().trim();
  
  switch (normalizedType) {
    // Sports/Training related
    case 'practice':
      return `/screens/practice-details/${id}`;
    
    case 'match':
    case 'game':
      return `/screens/match-details/${id}`;
    
    case 'event':
    case 'course':
      return `/screens/event-details/${id}`;
    
    // Legacy appointment and child types - redirect to events
    case 'appointment':
    case 'child':
      return `/screens/event-details/${id}`;
    
    // Service bookings - these don't have detail pages, show booking summary
    case 'haircut':
      // Haircuts are appointments, not events - redirect to service page instead
      return `/screens/booking-options/CourtsideKutz`;
    
    case 'playground':
      // Playground bookings - redirect to drop-in page instead  
      return `/screens/booking-options/DropIn`;
    
    // Generic types
    case 'others':
      return `/screens/event-details/${id}`;
    
    default:
      // Fallback routing based on user role and common patterns
      
      // Role-based fallbacks
      switch (userRole) {
        case 'coach':
          return `/screens/practice-details/${id}`;
        case 'athlete':
          return `/screens/event-details/${id}`;
        default:
          return `/screens/event-details/${id}`;
      }
  }
};

/**
 * Get appropriate icon for booking type
 * Used for consistent UI across the app
 */
export const getIconForType = (type: string): string => {
  const normalizedType = type?.toLowerCase().trim();
  
  switch (normalizedType) {
    case 'practice':
      return 'basketball-ball';
    case 'match':
    case 'game':
      return 'trophy';
    case 'event':
    case 'course':
      return 'calendar';
    case 'appointment':
      return 'clock';
    case 'child':
      return 'child';
    case 'haircut':
      return 'cut';
    case 'playground':
      return 'playground';
    default:
      return 'calendar';
  }
};

/**
 * Get display color for booking type
 * Used for consistent theming across the app
 */
export const getColorForType = (type: string): string => {
  const normalizedType = type?.toLowerCase().trim();
  
  switch (normalizedType) {
    case 'practice':
      return '#FF7043'; // Orange
    case 'match':
    case 'game':
      return '#4CAF50'; // Green
    case 'event':
    case 'course':
      return '#2196F3'; // Blue
    case 'appointment':
      return '#9C27B0'; // Purple
    case 'child':
      return '#FF9800'; // Amber
    case 'haircut':
      return '#795548'; // Brown
    case 'playground':
      return '#FFC107'; // Yellow
    default:
      return '#607D8B'; // Blue Grey
  }
};

/**
 * Validate if a route exists and is accessible
 * Can be extended to check user permissions
 */
export const validateRoute = (route: string, userRole?: string): boolean => {
  // Basic validation - ensure route is properly formatted
  if (!route || !route.includes('/')) {
    return false;
  }
  
  // Role-specific validation
  if (route.includes('(coach)') && userRole !== 'coach') {
    return false;
  }
  
  return true;
};

/**
 * Safe navigation with validation
 * Prevents navigation to unauthorized routes
 */
export const navigateToDetails = (
  router: any, 
  type: string, 
  id: string, 
  userRole?: string
): boolean => {
  const route = getDetailRouteForType(type, id, userRole);
  
  if (!validateRoute(route, userRole)) {
    // Fallback to safe route
    const fallbackRoute = `/screens/event-details/${id}`;
    router.push(fallbackRoute);
    return false;
  }
  
  router.push(route);
  return true;
};

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
  | 'athlete' 
  | 'parent' 
  | 'instructor' 
  | 'barber';

/**
 * Get the appropriate detail route based on item type and user role
 * Supports robust navigation for different booking types across all user roles
 */
export const getDetailRouteForType = (type: string, id: string, userRole?: string): string => {
  console.log("🎯 Navigation: Determining route for type:", type, "id:", id, "userRole:", userRole);
  
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
    
    // Role-specific routes
    case 'appointment':
      if (userRole === 'barber') {
        return `/(barber)/screens/appointment-details/${id}`;
      }
      // Fallback for appointments by non-barbers
      return `/screens/event-details/${id}`;
    
    case 'child':
      if (userRole === 'parent') {
        return `/(parent)/screens/child-details/${id}`;
      }
      // Fallback for child-related items by non-parents
      return `/screens/event-details/${id}`;
    
    // Service bookings - these don't have detail pages, show booking summary
    case 'haircut':
      // Haircuts are appointments, not events - redirect to service page instead
      console.log("💇 Haircut booking - redirecting to Courtside Kutz service page");
      return `/screens/booking-options/CourtsideKutz`;
    
    case 'playground':
      // Playground bookings - redirect to drop-in page instead  
      console.log("🏀 Playground booking - redirecting to Drop-In service page");
      return `/screens/booking-options/DropIn`;
    
    // Generic types
    case 'others':
      return `/screens/event-details/${id}`;
    
    default:
      // Fallback routing based on user role and common patterns
      console.warn("⚠️ Navigation: Unknown booking type:", type, "- using fallback routing");
      
      // Role-based fallbacks
      switch (userRole) {
        case 'coach':
          return `/screens/practice-details/${id}`;
        case 'athlete':
          return `/screens/event-details/${id}`;
        case 'parent':
          return `/screens/event-details/${id}`;
        case 'instructor':
          return `/screens/event-details/${id}`;
        case 'barber':
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
  if (route.includes('(barber)') && userRole !== 'barber') {
    console.warn("⚠️ Navigation: Attempted to access barber route with role:", userRole);
    return false;
  }
  
  if (route.includes('(parent)') && userRole !== 'parent') {
    console.warn("⚠️ Navigation: Attempted to access parent route with role:", userRole);
    return false;
  }
  
  if (route.includes('(coach)') && userRole !== 'coach') {
    console.warn("⚠️ Navigation: Attempted to access coach route with role:", userRole);
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
    console.error("❌ Navigation: Route validation failed for:", route);
    // Fallback to safe route
    const fallbackRoute = `/screens/event-details/${id}`;
    console.log("🔄 Navigation: Using fallback route:", fallbackRoute);
    router.push(fallbackRoute);
    return false;
  }
  
  console.log("✅ Navigation: Navigating to validated route:", route);
  router.push(route);
  return true;
};

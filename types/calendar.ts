/**
 * Calendar Types - Unified type definitions for calendar/schedule data
 * 
 * P2 Architecture Optimization - Centralized, type-safe API definitions
 * Replaces duplicate interfaces across the codebase
 */

// ===== BASE TYPES =====

export type ScheduleItemType = 'event' | 'game' | 'practice'
export type ScheduleItemStatus = 'upcoming' | 'live' | 'finished' | 'cancelled'

// ===== SHARED INTERFACES =====

export interface Location {
  id: string
  name: string
  address?: string
}

export interface ScheduleTeam {
  id: string
  name: string
  logo_url?: string
}

export interface ScheduleUser {
  id: string
  first_name: string
  last_name: string
  email?: string
}

export interface Program {
  id: string
  name: string
  type: string
  description?: string
}

// ===== API RESPONSE TYPES =====

/**
 * Base schedule item from API
 */
export interface BaseScheduleApiItem {
  id: string
  start_time: string
  end_time?: string
  location_id?: string
  location_name?: string
  created_at: string
  updated_at: string
  status: string
}

/**
 * Event from /secure/schedule API
 */
export interface ScheduleEventApi extends BaseScheduleApiItem {
  name: string
  description?: string
  capacity?: number
  program?: Program
  team?: ScheduleTeam
  created_by: ScheduleUser
  updated_by?: ScheduleUser
  customers: any[] // Customer booking data
  staff: any[] // Staff assignments
  location?: Location
  // Legacy fields for backward compatibility
  start_at?: string // alias for start_time
  end_at?: string   // alias for end_time
}

/**
 * Game/Match from /secure/schedule API
 */
export interface ScheduleGameApi extends BaseScheduleApiItem {
  home_team_id: string
  home_team_name: string
  home_team_logo_url?: string
  away_team_id: string
  away_team_name: string
  away_team_logo_url?: string
  home_score?: number
  away_score?: number
  court_id?: string
  court_name?: string
  location?: Location
}

/**
 * Practice from /secure/schedule API
 */
export interface SchedulePracticeApi extends BaseScheduleApiItem {
  team_id: string
  team_name: string
  team_logo_url?: string
  court_id?: string
  court_name?: string
  booked_by?: string
  booked_by_name?: string
  location?: Location
}

/**
 * Complete API response from /secure/schedule
 */
export interface ScheduleApiResponse {
  events: ScheduleEventApi[]
  games: ScheduleGameApi[]
  practices: SchedulePracticeApi[]
  // Optional metadata
  pagination?: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
  filters?: {
    after?: string
    before?: string
    program_type?: string
  }
}

// ===== UNIFIED CLIENT TYPES =====

/**
 * Unified schedule item for client consumption
 * Normalized data structure regardless of original API type
 */
export interface UnifiedScheduleItem {
  // Core identification
  id: string
  type: ScheduleItemType
  status: ScheduleItemStatus
  
  // Display data
  title: string
  description: string
  
  // Time and location
  date: string  // YYYY-MM-DD
  time: string  // HH:MM
  duration?: number // minutes
  location: string
  location_id?: string
  
  // Type-specific data
  // For events
  capacity?: number
  program?: Program
  attendees?: number
  
  // For games
  homeTeam?: string
  awayTeam?: string
  homeTeamId?: string
  awayTeamId?: string
  homeLogo?: string
  awayLogo?: string
  homeScore?: number
  awayScore?: number
  venue?: string
  
  // For practices
  teamName?: string
  teamId?: string
  teamLogo?: string
  bookedBy?: string
  bookedByName?: string
  
  // Metadata
  created_at: string
  updated_at: string
  created_by?: ScheduleUser
  
  // Raw API data for advanced usage
  raw: ScheduleEventApi | ScheduleGameApi | SchedulePracticeApi
}

// ===== REDUX STATE TYPES =====

/**
 * Schedule state for Redux store
 */
export interface ScheduleState {
  items: UnifiedScheduleItem[]
  byDate: Record<string, UnifiedScheduleItem[]>
  byId: Record<string, UnifiedScheduleItem>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  lastFetched: string | null
  cache: {
    params: string
    timestamp: number
  } | null
}

// ===== API REQUEST TYPES =====

/**
 * Parameters for schedule API requests
 */
export interface ScheduleRequestParams {
  after?: string        // Start date (YYYY-MM-DD)
  before?: string       // End date (YYYY-MM-DD)
  program_type?: 'event' | 'game' | 'practice'
  response_type?: 'date' | 'time'
  team_id?: string
  location_id?: string
  status?: string
  limit?: number
  page?: number
}

// ===== CREATE/UPDATE TYPES =====

/**
 * Base payload for creating schedule items
 */
export interface BaseScheduleCreatePayload {
  start_time: string
  end_time?: string
  location_id: string
  status?: string
}

/**
 * Payload for creating practices
 */
export interface PracticeCreatePayload extends BaseScheduleCreatePayload {
  team_id: string
  court_id?: string
}

/**
 * Payload for creating recurring practices
 */
export interface RecurringPracticeCreatePayload {
  day: string // Day of week (e.g., 'MONDAY', 'TUESDAY')
  practice_start_at: string // Time format
  practice_end_at: string   // Time format
  location_id: string
  team_id: string
  recurrence_start_at: string // Date when recurrence starts
  recurrence_end_at: string   // Date when recurrence ends
  court_id?: string
  status?: string
}

/**
 * Payload for creating events
 */
export interface EventCreatePayload extends BaseScheduleCreatePayload {
  name: string
  description?: string
  capacity?: number
  program_id?: string
  team_id?: string
}

/**
 * Payload for creating games
 */
export interface GameCreatePayload extends BaseScheduleCreatePayload {
  home_team_id: string
  away_team_id: string
  court_id?: string
}

// ===== FILTER AND SEARCH TYPES =====

/**
 * Schedule filter options
 */
export interface ScheduleFilters {
  types?: ScheduleItemType[]
  statuses?: ScheduleItemStatus[]
  dateRange?: {
    start: string
    end: string
  }
  teams?: string[]
  locations?: string[]
  search?: string
}

/**
 * Schedule sort options
 */
export interface ScheduleSortOptions {
  field: 'date' | 'time' | 'title' | 'type' | 'location'
  direction: 'asc' | 'desc'
}

// ===== CALENDAR COMPONENT TYPES =====

/**
 * Calendar view modes
 */
export type CalendarViewMode = 'day' | 'week' | 'month' | 'list'

/**
 * Calendar marked dates for calendar components
 */
export interface CalendarMarkedDates {
  [date: string]: {
    marked?: boolean
    selected?: boolean
    selectedColor?: string
    selectedTextColor?: string
    disabled?: boolean
    disableTouchEvent?: boolean
    dots?: Array<{
      key: string
      color: string
      selectedDotColor?: string
    }>
    customStyles?: {
      container?: any
      text?: any
    }
    // Schedule data
    items?: UnifiedScheduleItem[]
    count?: number
  }
}

/**
 * Calendar event for display in calendar components
 */
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  data: UnifiedScheduleItem
}

// ===== UTILITY TYPES =====

/**
 * Date range utility
 */
export interface DateRange {
  start: string | Date
  end: string | Date
}

/**
 * Time slot for schedule planning
 */
export interface TimeSlot {
  start: string // HH:MM
  end: string   // HH:MM
  available: boolean
  scheduledItem?: UnifiedScheduleItem
}

/**
 * Weekly schedule structure
 */
export interface WeeklySchedule {
  [dayOfWeek: string]: UnifiedScheduleItem[]
}

// ===== ERROR TYPES =====

/**
 * Schedule API error
 */
export interface ScheduleApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// ===== CACHE TYPES =====

/**
 * Cache entry structure
 */
export interface ScheduleCacheEntry {
  key: string
  data: ScheduleApiResponse
  timestamp: number
  params: ScheduleRequestParams
  ttl: number
}

// ===== TYPE GUARDS =====

export function isScheduleEvent(item: any): item is ScheduleEventApi {
  return item && typeof item.name === 'string' && item.capacity !== undefined
}

export function isScheduleGame(item: any): item is ScheduleGameApi {
  return item && item.home_team_name && item.away_team_name
}

export function isSchedulePractice(item: any): item is SchedulePracticeApi {
  return item && item.team_name && !item.home_team_name
}

export function isUnifiedScheduleItem(item: any): item is UnifiedScheduleItem {
  return item && item.id && item.type && ['event', 'game', 'practice'].includes(item.type)
}

// ===== DEFAULT VALUES =====

export const DEFAULT_SCHEDULE_PARAMS: ScheduleRequestParams = {
  response_type: 'date'
}

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  types: ['event', 'game', 'practice'],
  statuses: ['upcoming', 'live']
}

// Re-export for backward compatibility
export type { ScheduleEventApi as ScheduleEvent }
export type { ScheduleGameApi as ScheduleGame }  
export type { SchedulePracticeApi as SchedulePractice }
export type { ScheduleApiResponse as ScheduleResponse }
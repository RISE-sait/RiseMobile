/**
 * CalendarService - Unified Calendar Data Management
 * 
 * Centralizes all /secure/schedule API calls and provides intelligent caching,
 * data transformation, and request deduplication for optimal performance.
 * 
 * P2 Architecture Optimization - Reduces API duplication and improves UX
 */

import axios from 'axios'
import dayjs from 'dayjs'
import { API_URL, refreshBackendJwt } from '../utils/api'

// ===== UNIFIED TYPE DEFINITIONS =====

export interface BaseScheduleItem {
  id: string
  start_time: string
  end_time?: string
  location_id?: string
  location_name?: string
  created_at: string
  updated_at: string
  status: string
}

export interface ScheduleEvent extends BaseScheduleItem {
  name: string
  description?: string
  capacity?: number
  program?: {
    id: string
    name: string
    type: string
    description?: string
  }
  team?: {
    id: string
    name: string
  }
  created_by: {
    id: string
    first_name: string
    last_name: string
  }
  customers: any[]
  staff: any[]
}

export interface ScheduleGame extends BaseScheduleItem {
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
}

export interface SchedulePractice extends BaseScheduleItem {
  team_id: string
  team_name: string
  team_logo_url?: string
  court_id?: string
  court_name?: string
  booked_by?: string
  booked_by_name?: string
}

export interface ScheduleResponse {
  events: ScheduleEvent[]
  games: ScheduleGame[]
  practices: SchedulePractice[]
}

export interface UnifiedScheduleItem {
  id: string
  title: string
  date: string  // YYYY-MM-DD format
  time: string  // HH:MM format
  type: 'event' | 'game' | 'practice'
  location: string
  description: string
  
  // Optional fields based on type
  homeTeam?: string
  awayTeam?: string
  homeLogo?: string
  awayLogo?: string
  teamName?: string
  teamLogo?: string
  capacity?: number
  
  // Metadata
  raw: ScheduleEvent | ScheduleGame | SchedulePractice
  created_at: string
  updated_at: string
  status: 'scheduled' | 'in_progress' | 'completed'
}

// ===== CACHE MANAGEMENT =====

interface CacheEntry {
  data: ScheduleResponse
  timestamp: number
  params: string
}

class ScheduleCache {
  private cache = new Map<string, CacheEntry>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes
  
  private getCacheKey(params: ScheduleParams): string {
    return `${params.after || ''}-${params.before || ''}-${params.program_type || ''}`
  }
  
  get(params: ScheduleParams): ScheduleResponse | null {
    const key = this.getCacheKey(params)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  set(params: ScheduleParams, data: ScheduleResponse): void {
    const key = this.getCacheKey(params)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      params: key
    })
  }
  
  invalidate(params?: ScheduleParams): void {
    if (params) {
      const key = this.getCacheKey(params)
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
  
  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.TTL) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

// ===== API PARAMETERS =====

export interface ScheduleParams {
  after?: string
  before?: string
  program_type?: 'practice' | 'event' | 'game'
  response_type?: 'date' | 'time'
}

// ===== REQUEST DEDUPLICATION =====

class RequestManager {
  private pendingRequests = new Map<string, Promise<ScheduleResponse>>()
  
  private getRequestKey(params: ScheduleParams, token: string): string {
    const paramKey = `${params.after || ''}-${params.before || ''}-${params.program_type || ''}`
    return `${paramKey}-${token.substring(0, 10)}`
  }
  
  async execute(
    params: ScheduleParams, 
    token: string, 
    executor: () => Promise<ScheduleResponse>
  ): Promise<ScheduleResponse> {
    const key = this.getRequestKey(params, token)
    
    // Check if request is already pending
    const existing = this.pendingRequests.get(key)
    if (existing) {
      return existing
    }
    
    // Execute new request
    const promise = executor().finally(() => {
      this.pendingRequests.delete(key)
    })
    
    this.pendingRequests.set(key, promise)
    return promise
  }
}

// ===== CALENDAR SERVICE CLASS =====

class CalendarService {
  private cache = new ScheduleCache()
  private requestManager = new RequestManager()
  
  /**
   * Fetch schedule data with intelligent caching and request deduplication
   */
  async getSchedule(params: ScheduleParams = {}): Promise<UnifiedScheduleItem[]> {
    // Check cache first
    const cached = this.cache.get(params)
    if (cached) {
      console.log('📅 CalendarService: Using cached schedule data')
      return this.transformScheduleData(cached)
    }
    
    // Get authentication token
    const token = await refreshBackendJwt()
    if (!token) {
      throw new Error('Authentication required: Could not retrieve backend JWT')
    }
    
    // Execute API request with deduplication
    const response = await this.requestManager.execute(params, token, async () => {
      return this.fetchFromAPI(params, token)
    })
    
    // Cache the response
    this.cache.set(params, response)
    
    // Transform and return unified data
    return this.transformScheduleData(response)
  }
  
  /**
   * Get practices specifically (optimized for coach workflows)
   */
  async getPractices(after?: string, before?: string): Promise<UnifiedScheduleItem[]> {
    const params: ScheduleParams = {
      after: after || dayjs().format('YYYY-MM-DD'),
      before: before || dayjs().add(30, 'days').format('YYYY-MM-DD'),
      program_type: 'practice',
      response_type: 'date'
    }
    
    const allItems = await this.getSchedule(params)
    return allItems.filter(item => item.type === 'practice')
  }
  
  /**
   * Get upcoming events for dashboard display
   */
  async getUpcomingEvents(limit = 5): Promise<UnifiedScheduleItem[]> {
    const params: ScheduleParams = {
      after: dayjs().format('YYYY-MM-DD'),
      before: dayjs().add(7, 'days').format('YYYY-MM-DD')
    }
    
    const allItems = await this.getSchedule(params)
    return allItems
      .filter(item => item.status === 'scheduled')
      .sort((a, b) => dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`)))
      .slice(0, limit)
  }
  
  /**
   * Get schedule items by date range
   */
  async getScheduleByDateRange(startDate: string, endDate: string): Promise<UnifiedScheduleItem[]> {
    const params: ScheduleParams = {
      after: startDate,
      before: endDate,
      response_type: 'date'
    }
    
    return this.getSchedule(params)
  }
  
  /**
   * Get schedule items grouped by date
   */
  async getScheduleGroupedByDate(startDate: string, endDate: string): Promise<Record<string, UnifiedScheduleItem[]>> {
    const items = await this.getScheduleByDateRange(startDate, endDate)
    
    const grouped: Record<string, UnifiedScheduleItem[]> = {}
    items.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = []
      }
      grouped[item.date].push(item)
    })
    
    // Sort items within each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time))
    })
    
    return grouped
  }
  
  /**
   * Invalidate cache (useful after creating/updating schedule items)
   */
  invalidateCache(params?: ScheduleParams): void {
    this.cache.invalidate(params)
    console.log('📅 CalendarService: Cache invalidated')
  }
  
  /**
   * Internal: Fetch data from API
   */
  private async fetchFromAPI(params: ScheduleParams, token: string): Promise<ScheduleResponse> {
    const urlParams = new URLSearchParams()
    
    if (params.after) urlParams.append('after', params.after)
    if (params.before) urlParams.append('before', params.before)
    if (params.program_type) urlParams.append('program_type', params.program_type)
    if (params.response_type) urlParams.append('response_type', params.response_type)
    
    const url = `${API_URL}/secure/schedule${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    
    console.log('📅 CalendarService: Fetching from API:', url)
    
    const response = await axios.get<ScheduleResponse>(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!response.data) {
      throw new Error('Invalid schedule response: No data received')
    }
    
    console.log('📅 CalendarService: API Response received:', {
      events: response.data.events?.length || 0,
      games: response.data.games?.length || 0,
      practices: response.data.practices?.length || 0
    })
    
    return response.data
  }
  
  /**
   * Internal: Transform raw API data to unified format
   */
  private transformScheduleData(response: ScheduleResponse): UnifiedScheduleItem[] {
    const items: UnifiedScheduleItem[] = []
    
    // Process events
    response.events?.forEach(event => {
      items.push({
        id: event.id,
        title: event.name || 'Event',
        date: dayjs(event.start_time).format('YYYY-MM-DD'),
        time: dayjs(event.start_time).format('HH:mm'),
        type: 'event',
        location: event.location_name || 'TBD',
        description: event.description || `${event.name} event`,
        capacity: event.capacity,
        teamName: event.team?.name,
        raw: event,
        created_at: event.created_at,
        updated_at: event.updated_at,
        status: this.determineStatus(event.start_time, event.end_time)
      })
    })
    
    // Process games
    response.games?.forEach(game => {
      const title = `${game.home_team_name} vs ${game.away_team_name}`
      items.push({
        id: game.id,
        title,
        date: dayjs(game.start_time).format('YYYY-MM-DD'),
        time: dayjs(game.start_time).format('HH:mm'),
        type: 'game',
        location: game.location_name || game.court_name || 'TBD',
        description: `Game: ${title}`,
        homeTeam: game.home_team_name,
        awayTeam: game.away_team_name,
        homeLogo: game.home_team_logo_url,
        awayLogo: game.away_team_logo_url,
        raw: game,
        created_at: game.created_at,
        updated_at: game.updated_at,
        status: this.determineStatus(game.start_time, game.end_time)
      })
    })
    
    // Process practices
    response.practices?.forEach(practice => {
      const title = `${practice.team_name} Practice`
      items.push({
        id: practice.id,
        title,
        date: dayjs(practice.start_time).format('YYYY-MM-DD'),
        time: dayjs(practice.start_time).format('HH:mm'),
        type: 'practice',
        location: practice.location_name || practice.court_name || 'RISE Basketball Facility',
        description: `Practice session for ${practice.team_name}`,
        teamName: practice.team_name,
        teamLogo: practice.team_logo_url,
        raw: practice,
        created_at: practice.created_at,
        updated_at: practice.updated_at,
        status: this.determineStatus(practice.start_time, practice.end_time)
      })
    })
    
    return items
  }
  
  /**
   * Internal: Determine item status based on time
   */
  private determineStatus(start_time: string, end_time?: string): 'scheduled' | 'in_progress' | 'completed' {
    const now = dayjs()
    const start = dayjs(start_time)
    const end = end_time ? dayjs(end_time) : start.add(2, 'hours') // Default duration
    
    if (now.isBefore(start)) return 'scheduled'
    if (now.isAfter(end)) return 'completed'
    return 'in_progress'
  }
  
  /**
   * Cleanup expired cache entries (call periodically)
   */
  cleanup(): void {
    this.cache.cleanup()
  }
}

// ===== SINGLETON EXPORT =====

export const calendarService = new CalendarService()

// Cleanup cache every 10 minutes
setInterval(() => {
  calendarService.cleanup()
}, 10 * 60 * 1000)

export default calendarService
/**
 * Calendar Selectors - Memoized selectors for unified calendar data
 * 
 * P2 Architecture Optimization - Performance-optimized selectors for calendar data
 * Works with CalendarService for centralized schedule management
 */

import { createSelector } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import type { RootState } from '../index'
import type { UnifiedScheduleItem } from '../../services/CalendarService'

// ===== BASE SELECTORS =====

// Schedule slice selectors (legacy support)
export const selectScheduleItems = (state: RootState) => state.schedule?.items || []
export const selectScheduleByDate = (state: RootState) => state.schedule?.byDate || {}
export const selectScheduleStatus = (state: RootState) => state.schedule?.status || 'idle'
export const selectScheduleError = (state: RootState) => state.schedule?.error

// ===== COMPUTED SELECTORS =====

/**
 * Get all schedule items sorted by date and time
 */
export const selectAllScheduleItemsSorted = createSelector(
  [selectScheduleItems],
  (items) => {
    return [...items].sort((a, b) => {
      const dateA = dayjs(`${a.date} ${a.time}`)
      const dateB = dayjs(`${b.date} ${b.time}`)
      return dateA.diff(dateB)
    })
  }
)

/**
 * Get upcoming schedule items (today and future)
 */
export const selectUpcomingScheduleItems = createSelector(
  [selectAllScheduleItemsSorted],
  (items) => {
    const today = dayjs().startOf('day')
    return items.filter(item => 
      dayjs(item.date).isAfter(today) || dayjs(item.date).isSame(today, 'day')
    )
  }
)

/**
 * Get past schedule items
 */
export const selectPastScheduleItems = createSelector(
  [selectAllScheduleItemsSorted],
  (items) => {
    const today = dayjs().startOf('day')
    return items.filter(item => 
      dayjs(item.date).isBefore(today)
    ).reverse() // Most recent first
  }
)

/**
 * Get schedule items by type
 */
export const selectScheduleItemsByType = createSelector(
  [selectScheduleItems],
  (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = []
      acc[item.type].push(item)
      return acc
    }, {} as Record<string, any[]>)
  }
)

/**
 * Get upcoming practices specifically
 */
export const selectUpcomingPractices = createSelector(
  [selectUpcomingScheduleItems],
  (items) => items.filter(item => item.type === 'practice')
)

/**
 * Get upcoming games specifically
 */
export const selectUpcomingGames = createSelector(
  [selectUpcomingScheduleItems],
  (items) => items.filter(item => item.type === 'match' || item.type === 'game')
)

/**
 * Get upcoming events specifically
 */
export const selectUpcomingEvents = createSelector(
  [selectUpcomingScheduleItems],
  (items) => items.filter(item => item.type === 'event')
)

/**
 * Get today's schedule items
 */
export const selectTodayScheduleItems = createSelector(
  [selectScheduleItems],
  (items) => {
    const today = dayjs().format('YYYY-MM-DD')
    return items
      .filter(item => item.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }
)

/**
 * Get this week's schedule items
 */
export const selectThisWeekScheduleItems = createSelector(
  [selectScheduleItems],
  (items) => {
    const startOfWeek = dayjs().startOf('week')
    const endOfWeek = dayjs().endOf('week')
    
    return items.filter(item => {
      const itemDate = dayjs(item.date)
      return itemDate.isAfter(startOfWeek) && itemDate.isBefore(endOfWeek)
    })
  }
)

/**
 * Get next upcoming item (closest future item)
 */
export const selectNextUpcomingItem = createSelector(
  [selectUpcomingScheduleItems],
  (items) => {
    if (items.length === 0) return null
    
    const now = dayjs()
    const futureItems = items.filter(item => {
      const itemDateTime = dayjs(`${item.date} ${item.time}`)
      return itemDateTime.isAfter(now)
    })
    
    return futureItems[0] || null
  }
)

/**
 * Get schedule statistics
 */
export const selectScheduleStats = createSelector(
  [selectScheduleItems, selectUpcomingScheduleItems, selectPastScheduleItems],
  (allItems, upcomingItems, pastItems) => ({
    total: allItems.length,
    upcoming: upcomingItems.length,
    past: pastItems.length,
    practices: allItems.filter(item => item.type === 'practice').length,
    games: allItems.filter(item => item.type === 'match' || item.type === 'game').length,
    events: allItems.filter(item => item.type === 'event').length
  })
)

/**
 * Get schedule items grouped by date
 */
export const selectScheduleGroupedByDate = createSelector(
  [selectScheduleItems],
  (items) => {
    const grouped: Record<string, any[]> = {}
    
    items.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = []
      }
      grouped[item.date].push(item)
    })
    
    // Sort items within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time))
    })
    
    return grouped
  }
)

/**
 * Get schedule items for specific date
 */
export const selectScheduleForDate = (date: string) => createSelector(
  [selectScheduleGroupedByDate],
  (groupedItems) => groupedItems[date] || []
)

/**
 * Get schedule items for date range
 */
export const selectScheduleForDateRange = (startDate: string, endDate: string) => createSelector(
  [selectScheduleItems],
  (items) => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    
    return items.filter(item => {
      const itemDate = dayjs(item.date)
      return itemDate.isAfter(start.subtract(1, 'day')) && itemDate.isBefore(end.add(1, 'day'))
    })
  }
)

/**
 * Search schedule items by text
 */
export const selectScheduleSearchResults = (query: string) => createSelector(
  [selectScheduleItems],
  (items) => {
    if (!query.trim()) return items
    
    const searchTerm = query.toLowerCase()
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchTerm) ||
      item.title?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.location?.toLowerCase().includes(searchTerm)
    )
  }
)

/**
 * Get schedule loading state
 */
export const selectIsScheduleLoading = createSelector(
  [selectScheduleStatus],
  (status) => status === 'loading'
)

/**
 * Get schedule error state
 */
export const selectHasScheduleError = createSelector(
  [selectScheduleError],
  (error) => Boolean(error)
)

/**
 * Get schedule ready state (loaded and no errors)
 */
export const selectIsScheduleReady = createSelector(
  [selectScheduleStatus, selectScheduleError],
  (status, error) => status === 'succeeded' && !error
)

// ===== SPECIALIZED SELECTORS FOR DIFFERENT USER ROLES =====

/**
 * Coach-specific selectors
 */
export const selectCoachUpcomingPractices = createSelector(
  [selectUpcomingPractices],
  (practices) => practices.slice(0, 10) // Show next 10 practices
)

export const selectCoachTodayActivities = createSelector(
  [selectTodayScheduleItems],
  (items) => items.filter(item => item.type === 'practice' || item.type === 'match')
)

/**
 * Athlete-specific selectors  
 */
export const selectAthleteUpcomingActivities = createSelector(
  [selectUpcomingScheduleItems],
  (items) => items.filter(item => 
    item.type === 'practice' || item.type === 'match' || item.type === 'event'
  ).slice(0, 5)
)

/**
 * Parent-specific selectors
 */
export const selectParentChildActivities = createSelector(
  [selectUpcomingScheduleItems],
  (items) => items.filter(item => 
    item.type === 'practice' || item.type === 'match'
  )
)

// ===== CALENDAR VIEW HELPERS =====

/**
 * Get calendar data formatted for calendar components
 */
export const selectCalendarData = createSelector(
  [selectScheduleGroupedByDate],
  (groupedItems) => {
    const calendarData: Record<string, {marked: boolean, items: any[]}> = {}
    
    Object.entries(groupedItems).forEach(([date, items]) => {
      calendarData[date] = {
        marked: items.length > 0,
        items
      }
    })
    
    return calendarData
  }
)

/**
 * Get month view data for specific month
 */
export const selectMonthViewData = (year: number, month: number) => createSelector(
  [selectScheduleItems],
  (items) => {
    const startOfMonth = dayjs().year(year).month(month).startOf('month')
    const endOfMonth = dayjs().year(year).month(month).endOf('month')
    
    const monthItems = items.filter(item => {
      const itemDate = dayjs(item.date)
      return itemDate.isAfter(startOfMonth.subtract(1, 'day')) && 
             itemDate.isBefore(endOfMonth.add(1, 'day'))
    })
    
    // Group by date for month view
    const grouped: Record<string, any[]> = {}
    monthItems.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = []
      grouped[item.date].push(item)
    })
    
    return grouped
  }
)

export default {
  // Base selectors
  selectScheduleItems,
  selectScheduleByDate,
  selectScheduleStatus,
  selectScheduleError,
  
  // Computed selectors
  selectAllScheduleItemsSorted,
  selectUpcomingScheduleItems,
  selectPastScheduleItems,
  selectScheduleItemsByType,
  selectUpcomingPractices,
  selectUpcomingGames,
  selectUpcomingEvents,
  selectTodayScheduleItems,
  selectThisWeekScheduleItems,
  selectNextUpcomingItem,
  selectScheduleStats,
  selectScheduleGroupedByDate,
  
  // State selectors
  selectIsScheduleLoading,
  selectHasScheduleError,
  selectIsScheduleReady,
  
  // Role-specific selectors
  selectCoachUpcomingPractices,
  selectCoachTodayActivities,
  selectAthleteUpcomingActivities,
  selectParentChildActivities,
  
  // Calendar helpers
  selectCalendarData,
  
  // Factory selectors
  selectScheduleForDate,
  selectScheduleForDateRange,
  selectScheduleSearchResults,
  selectMonthViewData
}
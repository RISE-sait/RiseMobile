import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import dayjs from 'dayjs'

// Basic selectors (direct state access)
export const selectPracticesState = (state: RootState) => state.practices
export const selectPracticesItems = (state: RootState) => state.practices.items
export const selectPracticesByDate = (state: RootState) => state.practices.byDate
export const selectPracticesById = (state: RootState) => state.practices.byId
export const selectPracticesStatus = (state: RootState) => state.practices.status
export const selectPracticesError = (state: RootState) => state.practices.error
export const selectPracticesLastFetched = (state: RootState) => state.practices.lastFetched

// Memoized selectors (computed values)
export const selectPracticesCount = createSelector(
  [selectPracticesItems],
  (practices) => practices.length
)

export const selectUpcomingPractices = createSelector(
  [selectPracticesItems],
  (practices) => {
    const today = dayjs().startOf('day')
    return practices
      .filter(practice => dayjs(practice.date).isAfter(today) || dayjs(practice.date).isSame(today, 'day'))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
  }
)

export const selectPastPractices = createSelector(
  [selectPracticesItems],
  (practices) => {
    const today = dayjs().startOf('day')
    return practices
      .filter(practice => dayjs(practice.date).isBefore(today))
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
  }
)

export const selectPracticesForDate = createSelector(
  [selectPracticesByDate, (state: RootState, date: string) => date],
  (practicesByDate, date) => practicesByDate[date] || []
)

export const selectPracticesForWeek = createSelector(
  [selectPracticesItems, (state: RootState, startDate: string) => startDate],
  (practices, startDate) => {
    const weekStart = dayjs(startDate).startOf('week')
    const weekEnd = weekStart.add(7, 'day')
    
    return practices.filter(practice => {
      const practiceDate = dayjs(practice.date)
      return practiceDate.isAfter(weekStart) && practiceDate.isBefore(weekEnd)
    })
  }
)

export const selectPracticesForMonth = createSelector(
  [selectPracticesItems, (state: RootState, month: string) => month],
  (practices, month) => {
    const monthStart = dayjs(month).startOf('month')
    const monthEnd = monthStart.endOf('month')
    
    return practices.filter(practice => {
      const practiceDate = dayjs(practice.date)
      return practiceDate.isAfter(monthStart) && practiceDate.isBefore(monthEnd)
    })
  }
)

export const selectPracticesLoading = createSelector(
  [selectPracticesStatus],
  (status) => status === 'loading'
)

export const selectPracticesLoaded = createSelector(
  [selectPracticesStatus],
  (status) => status === 'succeeded'
)

export const selectPracticesFailed = createSelector(
  [selectPracticesStatus],
  (status) => status === 'failed'
)

export const selectPracticesStale = createSelector(
  [selectPracticesLastFetched],
  (lastFetched) => {
    if (!lastFetched) return true
    const staleTime = 5 * 60 * 1000 // 5 minutes
    return Date.now() - new Date(lastFetched).getTime() > staleTime
  }
)
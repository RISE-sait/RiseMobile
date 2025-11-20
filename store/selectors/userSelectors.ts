import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Basic selectors (direct state access)
export const selectUserState = (state: RootState) => state.user
export const selectUserData = (state: RootState) => state.user.data
export const selectUserStatus = (state: RootState) => state.user.status
export const selectUserError = (state: RootState) => state.user.error

// Alias for selectUserData (no memoization needed for direct access)
export const selectCurrentUser = selectUserData

export const selectUserRole = createSelector(
  [selectUserData],
  (userData) => userData?.role
)

export const selectUserToken = createSelector(
  [selectUserData],
  (userData) => userData?.token
)

export const selectUserFullName = createSelector(
  [selectUserData],
  (userData) => {
    if (!userData) return ''
    return `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
  }
)

export const selectUserInitials = createSelector(
  [selectUserData],
  (userData) => {
    if (!userData) return ''
    const firstName = userData.firstName || ''
    const lastName = userData.lastName || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
)

export const selectIsAuthenticated = createSelector(
  [selectUserData],
  (userData) => Boolean(userData && userData.token)
)

export const selectIsCoach = createSelector(
  [selectUserRole],
  (role) => role === 'coach'
)

export const selectIsAthlete = createSelector(
  [selectUserRole],
  (role) => role === 'athlete'
)

export const selectIsInstructor = createSelector(
  [selectUserRole],
  (role) => role === 'instructor'
)

export const selectIsParent = createSelector(
  [selectUserRole],
  (role) => role === 'parent'
)

export const selectIsBarber = createSelector(
  [selectUserRole],
  (role) => role === 'barber'
)

export const selectUserLoading = createSelector(
  [selectUserStatus],
  (status) => status === 'loading'
)

export const selectUserLoaded = createSelector(
  [selectUserStatus],
  (status) => status === 'succeeded'
)

export const selectUserFailed = createSelector(
  [selectUserStatus],
  (status) => status === 'failed'
)

export const selectUserCountryCode = createSelector(
  [selectUserData],
  (userData) => userData?.countryCode || 'US'
)

export const selectUserEmail = createSelector(
  [selectUserData],
  (userData) => userData?.email || ''
)
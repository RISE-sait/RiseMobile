// Centralized runtime configuration for feature flags and test modes
// All values must be in English per project guidelines

// Membership test mode flags (read from Expo public env variables)
export const USE_MEMBERSHIP_TEST_MODE: boolean =
  (process.env.EXPO_PUBLIC_MEMBERSHIP_TEST_MODE ?? "false").toLowerCase() ===
  "true";

// Default to the only valid plan ID provided by backend until fixed
export const MEMBERSHIP_TEST_PLAN_ID: string =
  process.env.EXPO_PUBLIC_MEMBERSHIP_TEST_PLAN_ID ??
  "14a89cfc-518f-4871-84fe-43d27e2fe274";




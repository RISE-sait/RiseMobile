// /types/user.ts

export interface MembershipInfo {
  membership_name: string
  membership_description: string
  membership_benefits: string
  plan_name: string
  start_date: string
  renewal_date: string
  next_payment_date?: string | null
}

export interface MembershipState {
  data: MembershipInfo | null
  status: "idle" | "succeeded"
  error: string | null
}


export interface User {
  id: string
  uuid?: string
  email: string
  firstName: string
  lastName: string
  role: string
  jerseyNumber?: string
  profileImage?: string
  countryCode: string
  token: string
  isAuthenticated?: boolean
  membership_info?: MembershipInfo
  phoneNumber?: string
  position?: string
  bio?: string
  teamLogo?: string
  // Backend API properties (snake_case) - for compatibility
  first_name?: string
  last_name?: string
  country_code?: string
}

export interface UserState {
  data: User | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

// /types/user.ts

export interface MembershipInfo {
  membership_name: string
  membership_description: string
  membership_benefits: string
  plan_name: string
  start_date: string
  renewal_date: string
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
}

export interface UserState {
  data: User | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

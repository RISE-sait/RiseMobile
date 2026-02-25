export interface Child {
  id: string
  first_name: string
  last_name: string
  dob: string
  country_code: string
  photo_url?: string
}

export interface Parent {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface Sibling {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface LinkRequest {
  id: string
  initiated_by: string
  child_email: string
  child_name: string
  child_id: string
  new_parent_email?: string
  new_parent_name?: string
  new_parent_id?: string
  old_parent_email?: string
  old_parent_name?: string
  old_parent_id?: string
  created_at: string
  expires_at: string
  awaiting_user_action: boolean
  counterparty_verified: boolean
  old_parent_verified: boolean
  requires_old_parent: boolean
  user_role: string
}

export interface FamilyState {
  children: Child[]
  parent: Parent | null
  siblings: Sibling[]
  linkRequests: LinkRequest[]
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null
}

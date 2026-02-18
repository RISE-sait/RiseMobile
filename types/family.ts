export interface Child {
  id: string
  first_name: string
  last_name: string
  dob: string
  country_code: string
  photo_url?: string
}

export interface LinkRequest {
  id: string
  status: string
  child?: { id: string; first_name: string; last_name: string }
  parent?: { id: string; first_name: string; last_name: string }
  new_parent?: { id: string; first_name: string; last_name: string }
  old_parent?: { id: string; first_name: string; last_name: string }
  created_at?: string
}

export interface FamilyState {
  children: Child[]
  linkRequests: LinkRequest[]
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null
}

// types/subsidy.ts

export interface SubsidyInfo {
  id: string
  user_id: string
  amount: number
  remaining_balance: number
  start_date: string
  end_date: string
  status: string
  description?: string
}

export interface SubsidyBalance {
  total_balance: number
  available_balance: number
  used_balance: number
}

export interface SubsidyUsage {
  id: string
  subsidy_id: string
  amount: number
  usage_date: string
  description?: string
  event_id?: string
  transaction_type: string
}

export interface SubsidyState {
  subsidies: SubsidyInfo[] | null
  balance: SubsidyBalance | null
  usage: SubsidyUsage[] | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { SubsidyInfo, SubsidyBalance, SubsidyUsage, SubsidyState } from "@/types"

const initialState: SubsidyState = {
  subsidies: null,
  balance: null,
  usage: null,
  status: "idle",
  error: null,
}

const subsidySlice = createSlice({
  name: "subsidy",
  initialState,
  reducers: {
    setSubsidies: (state, action: PayloadAction<SubsidyInfo[]>) => {
      state.subsidies = action.payload
      state.status = "succeeded"
    },
    setSubsidyBalance: (state, action: PayloadAction<SubsidyBalance>) => {
      state.balance = action.payload
      state.status = "succeeded"
    },
    setSubsidyUsage: (state, action: PayloadAction<SubsidyUsage[]>) => {
      state.usage = action.payload
      state.status = "succeeded"
    },
    setLoading: (state) => {
      state.status = "loading"
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.status = "failed"
    },
    clearSubsidy: (state) => {
      state.subsidies = null
      state.balance = null
      state.usage = null
      state.status = "idle"
      state.error = null
    },
  },
})

export const {
  setSubsidies,
  setSubsidyBalance,
  setSubsidyUsage,
  setLoading,
  setError,
  clearSubsidy,
} = subsidySlice.actions

export default subsidySlice.reducer

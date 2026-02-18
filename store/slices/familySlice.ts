import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Child, LinkRequest, FamilyState } from "@/types/family"

const initialState: FamilyState = {
  children: [],
  linkRequests: [],
  loading: "idle",
  error: null,
}

const familySlice = createSlice({
  name: "family",
  initialState,
  reducers: {
    setChildren: (state, action: PayloadAction<Child[]>) => {
      state.children = action.payload
      state.loading = "succeeded"
      state.error = null
    },
    setLinkRequests: (state, action: PayloadAction<LinkRequest[]>) => {
      state.linkRequests = action.payload
    },
    addChild: (state, action: PayloadAction<Child>) => {
      state.children.push(action.payload)
    },
    removeChild: (state, action: PayloadAction<string>) => {
      state.children = state.children.filter((c) => c.id !== action.payload)
    },
    setFamilyLoading: (state) => {
      state.loading = "pending"
      state.error = null
    },
    setFamilyError: (state, action: PayloadAction<string>) => {
      state.loading = "failed"
      state.error = action.payload
    },
    clearFamily: () => initialState,
  },
})

export const {
  setChildren,
  setLinkRequests,
  addChild,
  removeChild,
  setFamilyLoading,
  setFamilyError,
  clearFamily,
} = familySlice.actions

export default familySlice.reducer

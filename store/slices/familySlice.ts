import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Child, Parent, Sibling, LinkRequest, FamilyState } from "@/types/family"

const initialState: FamilyState = {
  children: [],
  parent: null,
  siblings: [],
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
    setParent: (state, action: PayloadAction<Parent | null>) => {
      state.parent = action.payload
    },
    setSiblings: (state, action: PayloadAction<Sibling[]>) => {
      state.siblings = action.payload
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
  setParent,
  setSiblings,
  setLinkRequests,
  addChild,
  removeChild,
  setFamilyLoading,
  setFamilyError,
  clearFamily,
} = familySlice.actions

export default familySlice.reducer

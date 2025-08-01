import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { MembershipInfo, MembershipState } from "@/types"

const initialState: MembershipState = {
  data: null,
  status: "idle",
  error: null,
}

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    setMembership: (state, action: PayloadAction<MembershipInfo>) => {
      state.data = action.payload
      state.status = "succeeded"
    },
    clearMembership: (state) => {
      state.data = null
      state.status = "idle"
      state.error = null
    },
  },
})

export const { setMembership, clearMembership } = membershipSlice.actions
export default membershipSlice.reducer

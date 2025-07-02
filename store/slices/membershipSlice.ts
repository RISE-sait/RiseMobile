import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MembershipInfo {
  membership_description: string;
  membership_name: string;
  membership_plan_name: string;
  membership_benefits: string;
  price: string;
  renewal_date: string;
  start_date: string;
  status: string;
}


interface MembershipState {
  data: MembershipInfo | null
  status: "idle" | "succeeded"
  error: string | null
}

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

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { loginUser } from "@/utils/api"

// Define types
export interface MembershipInfo {
  membership_name: string
  membership_description: string
  membership_benefits: string
  plan_name: string
  start_date: string
  renewal_date: string
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



interface UserState {
  data: User | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

// Initial state
const initialState: UserState = {
  data: null,
  status: "idle",
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  "user/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginUser(email, password)
      return user
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed")
    }
  },
)

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null
      state.status = "idle"
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.data = action.payload
      state.status = "succeeded"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.data = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

// Export actions and reducer
export const { logout, updateProfile, setUser } = userSlice.actions
export default userSlice.reducer


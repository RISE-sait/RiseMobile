import axios from "axios";
import { API_URL } from "./core/constants";

// Types
export interface Customer {
  id: string; // Normalized from user_id
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  country_code?: string;
  dob?: string;
  is_archived: boolean;
  hubspot_id?: string;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  deleted_at?: string;
  scheduled_deletion_at?: string;
  membership_info?: {
    membership_name?: string;
    membership_plan_id?: string;
    membership_plan_name?: string;
    membership_start_date?: string;
    membership_renewal_date?: string;
  };
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  role_name: string;
  is_active: boolean;
  country_code?: string;
  hubspot_id?: string;
  created_at?: string;
  updated_at?: string;
  coach_stats?: {
    wins: number;
    losses: number;
  };
}

export interface PendingStaff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id: string;
  country_code?: string;
  dob?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StaffActivityLog {
  id: string;
  staff_id: string;
  activity_description: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface CustomerCredits {
  customer_id: string;
  credits: number;
}

export interface CustomerTransaction {
  id: string;
  customer_id: string;
  amount: number;
  transaction_type: string;
  event_id?: string | null;
  description: {
    String: string;
    Valid: boolean;
  };
  created_at: {
    Time: string;
    Valid: boolean;
  };
}

export interface CustomerTransactionsResponse {
  customer_id: string;
  limit: number;
  offset: number;
  transactions: CustomerTransaction[];
}

export interface CustomerWeeklyUsage {
  customer_id: string;
  current_week_usage: number;
  remaining_credits: number;
  weekly_limit: number;
}

export interface Subsidy {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  provider: {
    id: string;
    name: string;
  };
  approved_amount: number;
  total_amount_used: number;
  remaining_balance: number;
  status: string;
  valid_from: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubsidiesResponse {
  data: Subsidy[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  location?: {
    id: string;
    name: string;
  };
  program?: {
    id: string;
    name: string;
  };
}

export interface ScheduleGame {
  id: string;
  title?: string;
  home_team?: { id: string; name: string };
  away_team?: { id: string; name: string };
  start_at: string;
  end_at?: string;
  location?: { id: string; name: string };
}

export interface SchedulePractice {
  id: string;
  title?: string;
  team?: { id: string; name: string };
  team_id?: string;
  team_name?: string;
  team_logo_url?: string;
  start_at?: string; // Some APIs use start_at
  end_at?: string;
  start_time?: string; // Some APIs use start_time
  end_time?: string;
  location?: { id: string; name: string };
  location_id?: string;
  location_name?: string;
  court_id?: string;
  court_name?: string;
  status?: string;
}

export interface TodaySchedule {
  events: ScheduleEvent[];
  games: ScheduleGame[];
  practices: SchedulePractice[];
}

export interface CustomerCheckIn {
  id: string;
  membership_name?: string;
  plan_name?: string;
  start_date?: string;
  renewal_date?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  todayCheckIns: number;
  activeStaff: number;
  pendingStaff: number;
}

// Customer APIs
export const getCustomers = async (
  jwt: string,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ customers: Customer[]; total: number; page: number; pages: number; activeMembersCount?: number }> => {
  try {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append("search", search);
    }

    const response = await axios.get(`${API_URL}/customers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const data = response.data;

    // Handle nested response format: { customers: { data: [], total: X, page: Y, pages: Z } }
    let customers: Customer[];
    let total: number;
    let currentPage: number;
    let totalPages: number;
    // NEW: Extract active_members_count from backend response
    let activeMembersCount: number | undefined = data.active_members_count;

    if (data.customers && typeof data.customers === 'object' && data.customers.data) {
      // Nested format
      customers = data.customers.data;
      total = data.customers.total || customers.length;
      currentPage = data.customers.page || page;
      totalPages = data.customers.pages || Math.ceil(total / limit);
    } else if (data.customers && Array.isArray(data.customers)) {
      // Direct array format
      customers = data.customers;
      total = data.total || customers.length;
      currentPage = data.page || page;
      totalPages = data.pages || Math.ceil(total / limit);
    } else if (data.data && Array.isArray(data.data)) {
      // Alternative format
      customers = data.data;
      total = data.total || customers.length;
      currentPage = data.page || page;
      totalPages = data.pages || Math.ceil(total / limit);
    } else if (Array.isArray(data)) {
      // Direct array
      customers = data;
      total = customers.length;
      currentPage = page;
      totalPages = 1;
    } else {
      customers = [];
      total = 0;
      currentPage = page;
      totalPages = 1;
    }

    // Normalize customer data - ensure id field is set from user_id
    customers = customers.map((customer: any) => ({
      ...customer,
      id: customer.user_id,
    }));

    return {
      customers,
      total,
      page: currentPage,
      pages: totalPages,
      activeMembersCount,
    };
  } catch (error: any) {
    console.error("❌ Error fetching customers:", error?.response?.data || error.message);
    console.error("❌ Error status:", error?.response?.status);
    return { customers: [], total: 0, page: 1, pages: 1, activeMembersCount: undefined };
  }
};

export const getCustomerById = async (
  jwt: string,
  customerId: string
): Promise<Customer | null> => {
  try {
    const response = await axios.get(`${API_URL}/customers/id/${customerId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer:", error?.response?.data || error.message);
    return null;
  }
};

export const getSuspendedCustomers = async (
  jwt: string,
  limit: number = 10
): Promise<Customer[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/customers?is_suspended=true&limit=${limit}&offset=0`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data.customers || response.data || [];
  } catch (error: any) {
    console.error("Error fetching suspended customers:", error?.response?.data || error.message);
    return [];
  }
};

// Get archived customers count
export const getArchivedCustomersCount = async (
  jwt: string
): Promise<{ total: number }> => {
  try {
    const response = await axios.get(
      `${API_URL}/customers/archived?limit=1&offset=0`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    const data = response.data;
    // Handle different response formats
    if (data.customers && typeof data.customers === 'object' && data.customers.total !== undefined) {
      return { total: data.customers.total };
    } else if (data.total !== undefined) {
      return { total: data.total };
    } else if (Array.isArray(data.customers)) {
      // If no total provided, we need to count - but this is inefficient
      // For now, return the array length as a fallback
      return { total: data.customers.length };
    } else if (Array.isArray(data)) {
      return { total: data.length };
    }
    return { total: 0 };
  } catch (error: any) {
    console.error("Error fetching archived customers count:", error?.response?.data || error.message);
    return { total: 0 };
  }
};

// Staff APIs
export const getAllStaff = async (
  jwt: string,
  roleFilter?: string
): Promise<Staff[]> => {
  try {
    const params = roleFilter ? `?role=${roleFilter}` : "";
    const response = await axios.get(`${API_URL}/staffs${params}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching staff:", error?.response?.data || error.message);
    return [];
  }
};

export const getStaffPaginated = async (
  jwt: string,
  params?: { limit?: number; offset?: number; role?: string }
): Promise<{ staffs: Staff[]; total: number }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.role) queryParams.append("role", params.role);

    const response = await axios.get(`${API_URL}/staffs?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    return {
      staffs: response.data.staffs || response.data || [],
      total: response.data.total || 0,
    };
  } catch (error: any) {
    console.error("Error fetching staff:", error?.response?.data || error.message);
    return { staffs: [], total: 0 };
  }
};

export const getPendingStaff = async (jwt: string): Promise<PendingStaff[]> => {
  try {
    const response = await axios.get(`${API_URL}/register/staff/pending`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching pending staff:", error?.response?.data || error.message);
    return [];
  }
};

export const approveStaff = async (jwt: string, staffId: string): Promise<boolean> => {
  try {
    await axios.post(
      `${API_URL}/register/staff/approve/${staffId}`,
      {},
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return true;
  } catch (error: any) {
    console.error("Error approving staff:", error?.response?.data || error.message);
    return false;
  }
};

export const rejectStaff = async (jwt: string, staffId: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/register/staff/reject/${staffId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return true;
  } catch (error: any) {
    console.error("Error rejecting staff:", error?.response?.data || error.message);
    return false;
  }
};

export const getStaffActivityLogs = async (
  jwt: string,
  staffId: string,
  params?: { limit?: number; offset?: number; search_description?: string }
): Promise<{ logs: StaffActivityLog[]; total: number }> => {
  try {
    const queryParams = new URLSearchParams({ staff_id: staffId });
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.search_description) queryParams.append("search_description", params.search_description);

    const response = await axios.get(`${API_URL}/staff/logs?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    return {
      logs: response.data || [],
      total: response.data?.length || 0,
    };
  } catch (error: any) {
    console.error("Error fetching staff activity logs:", error?.response?.data || error.message);
    return { logs: [], total: 0 };
  }
};

// Customer Credits APIs
export const getCustomerCredits = async (
  jwt: string,
  customerId: string
): Promise<CustomerCredits | null> => {
  try {
    const response = await axios.get(`${API_URL}/admin/customers/${customerId}/credits`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer credits:", error?.response?.data || error.message);
    return null;
  }
};

export const getCustomerTransactions = async (
  jwt: string,
  customerId: string,
  params?: { limit?: number; offset?: number }
): Promise<CustomerTransactionsResponse | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const url = `${API_URL}/admin/customers/${customerId}/credits/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer transactions:", error?.response?.data || error.message);
    return null;
  }
};

export const getCustomerWeeklyUsage = async (
  jwt: string,
  customerId: string
): Promise<CustomerWeeklyUsage | null> => {
  try {
    const response = await axios.get(`${API_URL}/admin/customers/${customerId}/credits/weekly-usage`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer weekly usage:", error?.response?.data || error.message);
    return null;
  }
};

export const getCustomerSubsidies = async (
  jwt: string,
  customerId: string,
  params?: { provider_id?: string; status?: string; page?: number; limit?: number }
): Promise<SubsidiesResponse | null> => {
  try {
    const queryParams = new URLSearchParams({ customer_id: customerId });
    if (params?.provider_id) queryParams.append("provider_id", params.provider_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await axios.get(`${API_URL}/subsidies?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer subsidies:", error?.response?.data || error.message);
    return null;
  }
};

// Schedule APIs
export const getTodaySchedule = async (jwt: string): Promise<TodaySchedule> => {
  try {
    const response = await axios.get(`${API_URL}/secure/schedule`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return {
      events: response.data.events || [],
      games: response.data.games || [],
      practices: response.data.practices || [],
    };
  } catch (error: any) {
    console.error("Error fetching schedule:", error?.response?.data || error.message);
    return { events: [], games: [], practices: [] };
  }
};

// Check-in APIs
export const checkInCustomer = async (
  jwt: string,
  customerId: string
): Promise<CustomerCheckIn | null> => {
  try {
    const response = await axios.get(`${API_URL}/customers/checkin/${customerId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error checking in customer:", error?.response?.data || error.message);
    return null;
  }
};

// Dashboard Stats - Aggregate data
export const getDashboardStats = async (jwt: string): Promise<DashboardStats> => {
  try {
    // Fetch multiple endpoints in parallel
    const [customersRes, staffRes, pendingStaffRes] = await Promise.all([
      getCustomers(jwt, undefined, 1, 1), // Just to get total
      getAllStaff(jwt),
      getPendingStaff(jwt),
    ]);

    return {
      totalCustomers: customersRes.total,
      todayCheckIns: 0, // Will be tracked locally or via separate endpoint
      activeStaff: staffRes.filter((s) => s.is_active_staff !== false).length,
      pendingStaff: pendingStaffRes.length,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error?.response?.data || error.message);
    return {
      totalCustomers: 0,
      todayCheckIns: 0,
      activeStaff: 0,
      pendingStaff: 0,
    };
  }
};

// Search customer by name/email for check-in
export const searchCustomerForCheckIn = async (
  jwt: string,
  searchTerm: string
): Promise<Customer[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/customers?search=${encodeURIComponent(searchTerm)}&limit=10&offset=0`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data.customers || response.data || [];
  } catch (error: any) {
    console.error("Error searching customers:", error?.response?.data || error.message);
    return [];
  }
};

// Website Content Types
export interface HeroPromo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  media_url: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
  button_text?: string;
  button_link?: string;
  display_order: number;
  duration_seconds?: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PromoVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Website Content APIs
export const getAllHeroPromos = async (jwt: string): Promise<HeroPromo[]> => {
  try {
    const response = await axios.get(`${API_URL}/website/hero-promos/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching hero promos:", error?.response?.data || error.message);
    return [];
  }
};

export const getActiveHeroPromos = async (): Promise<HeroPromo[]> => {
  try {
    const response = await axios.get(`${API_URL}/website/hero-promos/active`);
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching active hero promos:", error?.response?.data || error.message);
    return [];
  }
};

export const updateHeroPromo = async (
  jwt: string,
  id: string,
  data: Partial<HeroPromo>
): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/website/hero-promos/${id}`, data, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return true;
  } catch (error: any) {
    console.error("Error updating hero promo:", error?.response?.data || error.message);
    return false;
  }
};

export const getAllFeatureCards = async (jwt: string): Promise<FeatureCard[]> => {
  try {
    const response = await axios.get(`${API_URL}/website/feature-cards/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching feature cards:", error?.response?.data || error.message);
    return [];
  }
};

export const updateFeatureCard = async (
  jwt: string,
  id: string,
  data: Partial<FeatureCard>
): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/website/feature-cards/${id}`, data, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return true;
  } catch (error: any) {
    console.error("Error updating feature card:", error?.response?.data || error.message);
    return false;
  }
};

export const getAllPromoVideos = async (jwt: string): Promise<PromoVideo[]> => {
  try {
    const response = await axios.get(`${API_URL}/website/promo-videos/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching promo videos:", error?.response?.data || error.message);
    return [];
  }
};

export const updatePromoVideo = async (
  jwt: string,
  id: string,
  data: Partial<PromoVideo>
): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/website/promo-videos/${id}`, data, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return true;
  } catch (error: any) {
    console.error("Error updating promo video:", error?.response?.data || error.message);
    return false;
  }
};

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiInternalDomainsTeamDtoRosterMemberInfo {
  assists?: number;
  country?: string;
  email?: string;
  id?: string;
  losses?: number;
  name?: string;
  points?: number;
  rebounds?: number;
  steals?: number;
  wins?: number;
}

export interface CustomerAthleteRegistrationRequestDto {
  country_code?: string;
  /** @example "2000-01-01" */
  dob: string;
  first_name: string;
  gender?: "M" | "F";
  has_consent_to_email_marketing?: boolean;
  has_consent_to_sms?: boolean;
  last_name: string;
  /** @example "+15141234567" */
  phone_number?: string;
  waivers?: CustomerWaiverSigningRequestDto[];
}

export interface CustomerAthleteResponseDto {
  assists?: number;
  losses?: number;
  points?: number;
  rebounds?: number;
  steals?: number;
  wins?: number;
}

export interface CustomerChildRegistrationRequestDto {
  country_code?: string;
  /** @example "2000-01-01" */
  dob: string;
  first_name: string;
  gender?: "M" | "F";
  last_name: string;
  waivers?: CustomerWaiverSigningRequestDto[];
}

export interface CustomerMembershipResponseDto {
  membership_name?: string;
  membership_plan_id?: string;
  membership_plan_name?: string;
  membership_renewal_date?: string;
  membership_start_date?: string;
}

export interface CustomerParentRegistrationRequestDto {
  country_code?: string;
  /** @example "2000-01-01" */
  dob: string;
  first_name: string;
  gender?: "M" | "F";
  has_consent_to_email_marketing?: boolean;
  has_consent_to_sms?: boolean;
  last_name: string;
  /** @example "+15141234567" */
  phone_number?: string;
}

export interface CustomerResponse {
  athlete_info?: CustomerAthleteResponseDto;
  country_code?: string;
  dob?: string;
  email?: string;
  first_name?: string;
  hubspot_id?: string;
  last_name?: string;
  membership_info?: CustomerMembershipResponseDto;
  phone?: string;
  user_id?: string;
}

export interface CustomerStatsUpdateRequestDto {
  assists?: number;
  losses?: number;
  points?: number;
  rebounds?: number;
  steals?: number;
  wins?: number;
}

export interface CustomerWaiverSigningRequestDto {
  is_waiver_signed?: boolean;
  waiver_url: string;
}

export interface EventCreateRequestDto {
  /** @example 100 */
  capacity?: number;
  /** @example "THURSDAY" */
  day?: string;
  /** @example "23:00:00+00:00" */
  end_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  location_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  program_id?: string;
  /** @example "2023-10-05T07:00:00Z" */
  recurrence_end_at: string;
  /** @example "2023-10-05T07:00:00Z" */
  recurrence_start_at: string;
  required_membership_plan_ids?: string[];
  /** @example "23:00:00+00:00" */
  start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  team_id?: string;
}

export interface EventCustomerResponseDto {
  email?: string;
  first_name?: string;
  gender?: string;
  has_cancelled_enrollment?: boolean;
  id?: string;
  last_name?: string;
  phone?: string;
}

export interface EventDeleteRequestDto {
  /** @minItems 1 */
  ids: string[];
}

export interface EventEventResponseDto {
  capacity?: number;
  created_by?: EventPersonResponseDto;
  customers?: EventCustomerResponseDto[];
  end_at?: string;
  id?: string;
  location?: EventLocationInfo;
  program?: EventProgramInfo;
  required_membership_plan_ids?: string[];
  staff?: EventStaffResponseDto[];
  start_at?: string;
  team?: EventTeamInfo;
  updated_by?: EventPersonResponseDto;
}

export interface EventLocation {
  address?: string;
  id?: string;
  name?: string;
}

export interface EventLocationInfo {
  address?: string;
  id?: string;
  name?: string;
}

export interface EventPersonResponseDto {
  first_name?: string;
  id?: string;
  last_name?: string;
}

export interface EventProgram {
  id?: string;
  name?: string;
  type?: string;
  photo_url?: string;
}

export interface EventProgramInfo {
  id?: string;
  name?: string;
  type?: string;
  photo_url?: string;
}

export interface EventScheduleResponseDto {
  day?: string;
  location?: EventLocation;
  program?: EventProgram;
  recurrence_end_at?: string;
  recurrence_start_at?: string;
  session_end_at?: string;
  session_start_at?: string;
  team?: EventTeam;
}

export interface EventStaffResponseDto {
  email?: string;
  first_name?: string;
  gender?: string;
  id?: string;
  last_name?: string;
  phone?: string;
  role_name?: string;
}

export interface EventTeam {
  id?: string;
  name?: string;
}

export interface EventTeamInfo {
  id?: string;
  name?: string;
}

export interface EventUpdateEventsRequestDto {
  /** @example 100 */
  new_capacity?: number;
  /** @example "23:00:00+00:00" */
  new_event_end_at: string;
  /** @example "21:00:00+00:00" */
  new_event_start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  new_location_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  new_program_id?: string;
  /** @example "2023-10-05T07:00:00Z" */
  new_recurrence_end_at: string;
  /** @example "2023-10-05T07:00:00Z" */
  new_recurrence_start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  new_team_id?: string;
  /** @example 100 */
  original_capacity?: number;
  /** @example "13:00:00+00:00" */
  original_event_end_at: string;
  /** @example "10:00:00+00:00" */
  original_event_start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  original_location_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  original_program_id?: string;
  /** @example "2023-10-05T07:00:00Z" */
  original_recurrence_end_at: string;
  /** @example "2023-10-05T07:00:00Z" */
  original_recurrence_start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  original_team_id?: string;
}

export interface EventUpdateRequestDto {
  /** @example 100 */
  capacity?: number;
  /** @example "2023-10-05T07:00:00Z" */
  end_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  location_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  program_id?: string;
  required_membership_plan_ids?: string[];
  /** @example "2023-10-05T07:00:00Z" */
  start_at: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  team_id?: string;
}

export interface GameRequestDto {
  description?: string;
  lose_score?: number;
  lose_team?: string;
  name: string;
  win_score?: number;
  win_team?: string;
}

export interface GameResponseDto {
  created_at?: string;
  description?: string;
  id?: string;
  lose_score?: number;
  lose_team?: string;
  name?: string;
  updated_at?: string;
  win_score?: number;
  win_team?: string;
}

export interface HaircutBarberServiceResponseDto {
  barber_id?: string;
  barber_name?: string;
  created_at?: string;
  haircut_name?: string;
  id?: string;
  service_type_id?: string;
  updated_at?: string;
}

export interface HaircutCreateBarberServiceRequestDto {
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  barber_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  haircut_service_id?: string;
}

export interface HaircutEventResponseDto {
  barber_id?: string;
  barber_name?: string;
  created_at?: string;
  customer_id?: string;
  customer_name?: string;
  end_at?: string;
  id?: string;
  start_at?: string;
  updated_at?: string;
}

export interface HaircutRequestDto {
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  barber_id?: string;
  /** @example "2023-10-05T07:00:00Z" */
  begin_time: string;
  /** @example "2023-10-05T07:00:00Z" */
  end_time: string;
  /** @example "Haircut" */
  service_name: string;
}

export interface IdentityAthleteResponseDto {
  assists?: number;
  losses?: number;
  points?: number;
  rebounds?: number;
  steals?: number;
  wins?: number;
}

export interface IdentityMembershipReadResponseDto {
  membership_benefits?: string;
  membership_description?: string;
  membership_name?: string;
  plan_name?: string;
  renewal_date?: string;
  start_date?: string;
}

export interface IdentityUserAuthenticationResponseDto {
  age?: string;
  athlete_info?: IdentityAthleteResponseDto;
  country_code?: string;
  email?: string;
  first_name?: string;
  gender?: string;
  id?: string;
  is_active_staff?: boolean;
  last_name?: string;
  membership_info?: IdentityMembershipReadResponseDto;
  phone?: string;
  role?: string;
}

export interface LocationRequestDto {
  address: string;
  name: string;
}

export interface LocationResponseDto {
  address?: string;
  id?: string;
  name?: string;
}

export interface MembershipRequestDto {
  /** @example "Access to all premium features" */
  description?: string;
  /** @example "Premium Membership" */
  name: string;
}

export interface MembershipResponse {
  benefits?: string;
  created_at?: string;
  description?: string;
  id?: string;
  name?: string;
  updated_at?: string;
}

export interface MembershipPlanPlanRequestDto {
  amt_periods?: number;
  membership_id: string;
  name?: string;
  stripe_joining_fees_id?: string;
  stripe_price_id: string;
}

export interface MembershipPlanPlanResponse {
  amt_periods?: number;
  created_at?: string;
  id?: string;
  is_visible?: boolean;
  membership_id?: string;
  name?: string;
  stripe_joining_fees_id?: string;
  stripe_price_id?: string;
  updated_at?: string;
}

export interface PaymentCheckoutResponseDto {
  payment_url?: string;
}

export interface ProgramLevelsResponse {
  levels?: string[];
}

export interface ProgramRequestDto {
  capacity?: number;
  description?: string;
  level: string;
  name: string;
  type: string;
}

export interface ProgramResponse {
  capacity?: number;
  created_at?: string;
  description?: string;
  id?: string;
  level?: string;
  name?: string;
  type?: string;
  updated_at?: string;
}

export interface StaffCoachStatsResponseDto {
  losses?: number;
  wins?: number;
}

export interface StaffRegistrationRequestDto {
  country_code?: string;
  /** @example "2000-01-01" */
  dob: string;
  first_name: string;
  gender?: "M" | "F";
  is_active_staff?: boolean;
  last_name: string;
  /** @example "+15141234567" */
  phone_number?: string;
  role: string;
}

export interface StaffRequestDto {
  is_active: boolean;
  role_name: string;
}

export interface StaffResponseDto {
  coach_stats?: StaffCoachStatsResponseDto;
  country_code?: string;
  created_at?: string;
  email?: string;
  first_name?: string;
  hubspot_id?: string;
  id?: string;
  is_active?: boolean;
  last_name?: string;
  phone?: string;
  role_name?: string;
  updated_at?: string;
}

export interface TeamCoach {
  email?: string;
  id?: string;
  name?: string;
}

export interface TeamRequestDto {
  capacity: number;
  /** @example "faae4b3a-ad9f-463c-ae4b-3aad9fb63c9b" */
  coach_id?: string;
  name: string;
}

export interface TeamResponse {
  capacity?: number;
  coach?: TeamCoach;
  created_at?: string;
  id?: string;
  logo_url?: string;
  name?: string;
  roster?: ApiInternalDomainsTeamDtoRosterMemberInfo[];
  updated_at?: string;
}

export interface UserUpdateRequestDto {
  /** @example "US" */
  country_alpha2_code: string;
  /** @example "2000-01-01" */
  dob: string;
  email?: string;
  first_name: string;
  gender?: "M" | "F";
  has_marketing_email_consent: boolean;
  has_sms_consent: boolean;
  last_name: string;
  parent_id?: string;
  phone?: string;
}

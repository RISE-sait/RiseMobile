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

export interface CourseRequestDto {
  description?: string;
  name: string;
}

export interface CourseResponseDto {
  created_at?: string;
  description?: string;
  id?: string;
  name?: string;
  updated_at?: string;
}

export interface CustomerAthleteRegistrationRequestDto {
  age: number;
  country_code?: string;
  first_name: string;
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
  age: number;
  country_code?: string;
  first_name: string;
  last_name: string;
  waivers?: CustomerWaiverSigningRequestDto[];
}

export interface CustomerMembershipPlansResponseDto {
  created_at?: string;
  customer_id?: string;
  id?: string;
  membership_name?: string;
  membership_plan_id?: string;
  renewal_date?: string;
  start_date?: string;
  status?: string;
  updated_at?: string;
}

export interface CustomerMembershipResponseDto {
  membership_name?: string;
  membership_plan_id?: string;
  membership_plan_name?: string;
  membership_renewal_date?: string;
  membership_start_date?: string;
}

export interface CustomerParentRegistrationRequestDto {
  age: number;
  country_code?: string;
  first_name: string;
  has_consent_to_email_marketing?: boolean;
  has_consent_to_sms?: boolean;
  last_name: string;
  /** @example "+15141234567" */
  phone_number?: string;
}

export interface CustomerResponse {
  age?: number;
  athlete_info?: CustomerAthleteResponseDto;
  country_code?: string;
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

export interface EnrollmentCreateRequestDto {
  customer_id: string;
  event_id: string;
}

export interface EnrollmentResponseDto {
  checked_in_at?: string;
  created_at?: string;
  customer_id?: string;
  event_id?: string;
  id?: string;
  is_cancelled?: boolean;
  updated_at?: string;
}

export interface EventRequestDto {
  /** @example "00000000-0000-0000-0000-000000000000" */
  course_id?: string;
  /** @example "THURSDAY" */
  day: string;
  /** @example "00000000-0000-0000-0000-000000000000" */
  game_id?: string;
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
  location_id?: string;
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
  practice_id?: string;
  /** @example "2023-10-05T07:00:00Z" */
  program_end_at: string;
  /** @example "2023-10-05T07:00:00Z" */
  program_start_at: string;
  /** @example "23:00:00+00:00" */
  session_end_time: string;
  /** @example "23:00:00+00:00" */
  session_start_time: string;
}

export interface EventResponseDto {
  capacity?: number;
  course_id?: string;
  course_name?: string;
  day?: string;
  game_id?: string;
  game_name?: string;
  id?: string;
  location_address?: string;
  location_id?: string;
  location_name?: string;
  practice_id?: string;
  practice_name?: string;
  program_end_at?: string;
  program_start_at?: string;
  session_end_at?: string;
  session_start_at?: string;
}

export interface GameRequestDto {
  name?: string;
}

export interface GameResponseDto {
  id?: string;
  name?: string;
  video_link?: string;
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
}

export interface IdentityMembershipReadResponseDto {
  membership_name?: string;
  plan_name?: string;
  renewal_date?: string;
  start_date?: string;
}

export interface IdentityUserAuthenticationResponseDto {
  age?: number;
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
  payment_frequency: string;
  price: string;
}

export interface MembershipPlanPlanResponse {
  amt_periods?: number;
  created_at?: string;
  id?: string;
  joining_fees?: string;
  membership_id?: string;
  name?: string;
  payment_frequency?: string;
  price?: string;
  updated_at?: string;
}

export interface PracticeLevelsResponse {
  levels?: string[];
}

export interface PracticeRequestDto {
  description?: string;
  level: string;
  name: string;
}

export interface PracticeResponse {
  created_at?: string;
  description?: string;
  id?: string;
  level?: string;
  name?: string;
  updated_at?: string;
}

export interface PurchaseCheckoutResponseDto {
  payment_url?: string;
}

export type PurchaseSquareWebhookEventDto = object;

export interface StaffRegistrationRequestDto {
  age: number;
  country_code?: string;
  first_name: string;
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

export interface TeamRequestDto {
  capacity: number;
  coach_id?: string;
  name: string;
}

export interface TeamResponse {
  capacity?: number;
  coach_id?: string;
  created_at?: string;
  id?: string;
  name?: string;
  updated_at?: string;
}

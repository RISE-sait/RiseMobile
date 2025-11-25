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



    export interface ApiInternalDomainsPlaygroundDtoSessionResponseDto {
    created_at?: string,
    customer_first_name?: string,
    customer_id?: string,
    customer_last_name?: string,
    end_time?: string,
    id?: string,
    start_time?: string,
    system_id?: string,
    system_name?: string,
    updated_at?: string,
}

    export interface ApiInternalDomainsPlaygroundDtoSystemRequestDto {
    name: string,
}

    export interface ApiInternalDomainsPlaygroundDtoSystemResponseDto {
    created_at?: string,
    id?: string,
    name?: string,
    updated_at?: string,
}

    export interface ApiInternalDomainsTeamDtoRosterMemberInfo {
    assists?: number,
    country?: string,
    email?: string,
    id?: string,
    losses?: number,
    name?: string,
    points?: number,
    rebounds?: number,
    steals?: number,
    wins?: number,
}

    export interface AthleteResponseAthlete {
    assists?: number,
    first_name?: string,
    id?: string,
    last_name?: string,
    losses?: number,
    photo_url?: string,
    points?: number,
    rebounds?: number,
    steals?: number,
    team_id?: string,
    wins?: number,
}

    export interface BookingUpcomingBookingsResponse {
    haircuts?: (HaircutEventEventResponseDto)[],
    playground?: (ApiInternalDomainsPlaygroundDtoSessionResponseDto)[],
}

    export interface CourtRequestDto {
    location_id: string,
    name: string,
}

    export interface CourtResponseDto {
    id?: string,
    location_id?: string,
    name?: string,
}

    export interface CreditPackageCreateCreditPackageRequest {
  /** @min 1 */
    credit_allocation: number,
    description?: string,
  /**
   * @minLength 3
   * @maxLength 150
   */
    name: string,
    stripe_price_id: string,
  /** @min 0 */
    weekly_credit_limit?: number,
}

    export interface CreditPackageCreditPackageResponse {
    created_at?: string,
    credit_allocation?: number,
  /** e.g., "CAD" */
    currency?: string,
    description?: string,
    id?: string,
    name?: string,
  /** Price in dollars (e.g., 49.99) */
    price?: number,
    stripe_price_id?: string,
    updated_at?: string,
    weekly_credit_limit?: number,
}

    export interface CreditPackageUpdateCreditPackageRequest {
  /** @min 1 */
    credit_allocation: number,
    description?: string,
  /**
   * @minLength 3
   * @maxLength 150
   */
    name: string,
    stripe_price_id: string,
  /** @min 0 */
    weekly_credit_limit?: number,
}

    export interface CustomerAccountDeletionRequest {
  /** @example true */
    confirm_deletion: boolean,
}

    export interface CustomerAthleteProfileUpdateRequestDto {
    photo_url?: string,
}

    export interface CustomerAthleteRegistrationRequestDto {
    country_code?: string,
  /** @example "2000-01-01" */
    dob: string,
    first_name: string,
    gender?: "M" | "F",
    has_consent_to_email_marketing?: boolean,
    has_consent_to_sms?: boolean,
    last_name: string,
  /** @example "+15141234567" */
    phone_number?: string,
    waivers?: (CustomerWaiverSigningRequestDto)[],
}

    export interface CustomerChildRegistrationRequestDto {
    country_code?: string,
  /** @example "2000-01-01" */
    dob: string,
    first_name: string,
    gender?: "M" | "F",
    last_name: string,
    waivers?: (CustomerWaiverSigningRequestDto)[],
}

    export interface CustomerMembershipHistoryResponse {
    membership_benefits?: string,
    membership_description?: string,
    membership_name?: string,
    membership_plan_name?: string,
    next_payment_date?: string,
    price?: string,
    renewal_date?: string,
    start_date?: string,
    status?: string,
}

    export interface CustomerMembershipResponseDto {
    membership_name?: string,
    membership_plan_id?: string,
    membership_plan_name?: string,
    membership_renewal_date?: string,
    membership_start_date?: string,
}

    export interface CustomerNotesUpdateRequestDto {
  /** @maxLength 5000 */
    notes?: string,
}

    export interface CustomerParentRegistrationRequestDto {
    country_code?: string,
  /** @example "2000-01-01" */
    dob: string,
    first_name: string,
    gender?: "M" | "F",
    has_consent_to_email_marketing?: boolean,
    has_consent_to_sms?: boolean,
    last_name: string,
  /** @example "+15141234567" */
    phone_number?: string,
}

    export interface CustomerResponse {
    country_code?: string,
    dob?: string,
    email?: string,
    first_name?: string,
    hubspot_id?: string,
    is_archived?: boolean,
    last_name?: string,
    membership_info?: CustomerMembershipResponseDto,
    notes?: string,
    phone?: string,
    user_id?: string,
}

    export interface CustomerStatsUpdateRequestDto {
    assists?: number,
    losses?: number,
    points?: number,
    rebounds?: number,
    steals?: number,
    wins?: number,
}

    export interface CustomerWaiverSigningRequestDto {
    is_waiver_signed?: boolean,
    waiver_url: string,
}

    export interface DiscountApplyRequestDto {
    membership_plan_id?: string,
    name: string,
}

    export interface DiscountRequestDto {
    applies_to: "subscription" | "one_time" | "both",
    description?: string,
    discount_amount?: number,
  /**
   * @min 0
   * @max 100
   */
    discount_percent?: number,
    discount_type: "percentage" | "fixed_amount",
    duration_months?: number,
    duration_type: "once" | "repeating" | "forever",
    is_active?: boolean,
    is_use_unlimited?: boolean,
    max_redemptions?: number,
    name: string,
    use_per_client?: number,
    valid_from: string,
    valid_to?: string,
}

    export interface DiscountResponseDto {
    applies_to?: string,
    created_at?: string,
    description?: string,
    discount_amount?: number,
    discount_percent?: number,
    discount_type?: string,
    duration_months?: number,
    duration_type?: string,
    id?: string,
    is_active?: boolean,
    is_use_unlimited?: boolean,
    max_redemptions?: number,
    name?: string,
    stripe_coupon_id?: string,
    stripe_promotion_code_id?: string,
    times_redeemed?: number,
    updated_at?: string,
    use_per_client?: number,
    valid_from?: string,
    valid_to?: string,
}

    export interface DtoChatRequest {
    chat_history?: ((string)[])[],
    context?: string,
    query?: string,
}

    export interface DtoChatResponse {
    reply?: string,
}

    export interface DtoContactRequest {
    email: string,
    message: string,
    name: string,
    phone: string,
  /** reCAPTCHA token */
    token: string,
}

    export interface DtoCreateProviderRequest {
    contact_email?: string,
  /**
   * @minLength 10
   * @maxLength 20
   */
    contact_phone?: string,
  /**
   * @minLength 2
   * @maxLength 200
   */
    name: string,
}

    export interface DtoCreateSubsidyRequest {
  /** @maxLength 1000 */
    admin_notes?: string,
    approved_amount: number,
    customer_id: string,
    provider_id: string,
  /**
   * @minLength 5
   * @maxLength 500
   */
    reason: string,
    valid_until?: string,
}

    export interface DtoDeactivateSubsidyRequest {
  /**
   * @minLength 5
   * @maxLength 500
   */
    reason: string,
}

    export interface DtoNewsletterRequest {
    email?: string,
    tag?: string,
}

    export interface DtoRegisterPushTokenRequestDto {
    device_type: "ios" | "android",
    expo_push_token: string,
}

    export interface DtoSendNotificationRequestDto {
    body: string,
    data?: Record<string,any>,
    team_id: string,
    title: string,
    type: string,
}

    export interface EmailVerificationResendVerificationRequest {
    email: string,
}

    export interface EmailVerificationVerifyEmailRequest {
    token: string,
}

    export interface EventCourtInfo {
    id?: string,
    name?: string,
}

    export interface EventCustomerResponseDto {
    email?: string,
    first_name?: string,
    gender?: string,
    has_cancelled_enrollment?: boolean,
    id?: string,
    last_name?: string,
    phone?: string,
}

    export interface EventDeleteRequestDto {
  /** @minItems 1 */
    ids: (string)[],
}

    export interface EventEventRequestDto {
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a111" */
    court_id?: string,
  /**
   * @min 0
   * @example 5
   */
    credit_cost?: number,
  /** @example "2023-10-05T07:00:00Z" */
    end_at: string,
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
    location_id?: string,
  /** @example "price_123" */
    price_id?: string,
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
    program_id?: string,
  /** @example ["[\"f0e21457-75d4-4de6-b765-5ee13221fd72\"]"] */
    required_membership_plan_ids?: (string)[],
  /** @example "2023-10-05T07:00:00Z" */
    start_at: string,
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
    team_id?: string,
}

    export interface EventEventResponseDto {
    capacity?: number,
    court?: EventCourtInfo,
    created_by?: EventPersonResponseDto,
    credit_cost?: number,
    customers?: (EventCustomerResponseDto)[],
    end_at?: string,
    id?: string,
    location?: EventLocationInfo,
    price_id?: string,
    program?: EventProgramInfo,
    required_membership_plan_ids?: (string)[],
    staff?: (EventStaffResponseDto)[],
    start_at?: string,
    team?: EventTeamInfo,
    updated_by?: EventPersonResponseDto,
}

    export interface EventLocationInfo {
    address?: string,
    id?: string,
    name?: string,
}

    export interface EventPersonResponseDto {
    first_name?: string,
    id?: string,
    last_name?: string,
}

    export interface EventProgramInfo {
    description?: string,
    id?: string,
    name?: string,
    photo_url?: string,
    type?: string,
}

    export interface EventRecurrenceRequestDto {
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
    court_id?: string,
  /**
   * @min 0
   * @example 5
   */
    credit_cost?: number,
  /** @example "THURSDAY" */
    day?: string,
  /** @example "23:00:00+00:00" */
    event_end_at: string,
  /** @example "23:00:00+00:00" */
    event_start_at: string,
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
    location_id?: string,
  /** @example "price_123" */
    price_id?: string,
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
    program_id?: string,
  /** @example "2023-10-05T07:00:00Z" */
    recurrence_end_at: string,
  /** @example "2023-10-05T07:00:00Z" */
    recurrence_start_at: string,
  /** @example ["[\"f0e21457-75d4-4de6-b765-5ee13221fd72\"]"] */
    required_membership_plan_ids?: (string)[],
  /** @example "0bab3927-50eb-42b3-9d6b-2350dd00a100" */
    team_id?: string,
}

    export interface EventStaffResponseDto {
    email?: string,
    first_name?: string,
    gender?: string,
    id?: string,
    last_name?: string,
    phone?: string,
    role_name?: string,
}

    export interface EventTeamInfo {
    id?: string,
    name?: string,
}

    export interface GameRequestDto {
  /** Optional score for the away team */
    away_score?: number,
  /** ID of the away team */
    away_team_id: string,
  /** ID of the court where the game is played */
    court_id?: string,
  /** Optional end time of the game */
    end_time?: string,
  /** Optional score for the home team */
    home_score?: number,
  /** ID of the home team */
    home_team_id: string,
  /** ID of the location where the game is played */
    location_id: string,
  /** Required start time of the game */
    start_time: string,
  /** Game status must be one of the allowed values */
    status?: "scheduled" | "completed" | "canceled",
}

    export interface GameResponseDto {
    away_score?: number,
    away_team_id?: string,
    away_team_logo_url?: string,
    away_team_name?: string,
    court_id?: string,
    court_name?: string,
    created_at?: string,
    created_by?: string,
    created_by_name?: string,
    end_time?: string,
    home_score?: number,
    home_team_id?: string,
    home_team_logo_url?: string,
    home_team_name?: string,
    id?: string,
    location_id?: string,
    location_name?: string,
    start_time?: string,
    status?: string,
    updated_at?: string,
}

    export interface HaircutEventAvailabilityResponseDto {
    created_at?: string,
  /** 0=Sunday, 6=Saturday */
    day_of_week?: number,
  /** HH:MM format */
    end_time?: string,
    id?: string,
    is_active?: boolean,
  /** HH:MM format */
    start_time?: string,
    updated_at?: string,
}

    export interface HaircutEventBulkSetAvailabilityDto {
    availability: (HaircutEventSetAvailabilityDto)[],
}

    export interface HaircutEventEventResponseDto {
    barber_id?: string,
    barber_name?: string,
    created_at?: string,
    customer_id?: string,
    customer_name?: string,
    end_at?: string,
    id?: string,
    start_at?: string,
    updated_at?: string,
}

    export interface HaircutEventRequestDto {
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
    barber_id?: string,
  /** @example "2023-10-05T07:00:00Z" */
    begin_time: string,
  /** @example "2023-10-05T07:00:00Z" */
    end_time: string,
  /** @example "Haircut" */
    service_name: string,
}

    export interface HaircutEventSetAvailabilityDto {
  /**
   * 0=Sunday, 6=Saturday
   * @min 0
   * @max 6
   * @example 1
   */
    day_of_week: number,
  /**
   * HH:MM format
   * @example "17:00"
   */
    end_time: string,
  /**
   * Optional, defaults to true
   * @example true
   */
    is_active?: boolean,
  /**
   * HH:MM format
   * @example "09:00"
   */
    start_time: string,
}

    export interface HaircutEventUpdateAvailabilityDto {
  /** @example "17:00" */
    end_time: string,
  /** @example true */
    is_active?: boolean,
  /** @example "09:00" */
    start_time: string,
}

    export interface HaircutEventWeeklyAvailabilityResponseDto {
    availability?: (HaircutEventAvailabilityResponseDto)[],
    barber_id?: string,
    barber_name?: string,
}

    export interface HaircutServiceBarberServiceResponseDto {
    barber_id?: string,
    barber_name?: string,
    created_at?: string,
    haircut_id?: string,
    haircut_name?: string,
    id?: string,
    updated_at?: string,
}

    export interface HaircutServiceCreateBarberServiceRequestDto {
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
    barber_id?: string,
  /** @example "f0e21457-75d4-4de6-b765-5ee13221fd72" */
    haircut_service_id?: string,
}

    export interface HandlerCheck {
    details?: any,
    duration?: string,
    error?: string,
    status?: string,
}

    export interface HandlerHealthStatus {
    checks?: Record<string,HandlerCheck>,
    duration?: string,
    status?: string,
    timestamp?: string,
    version?: string,
}

    export interface IdentityAthleteResponseDto {
    assists?: number,
    losses?: number,
    points?: number,
    rebounds?: number,
    steals?: number,
    team_id?: string,
    team_logo_url?: string,
    wins?: number,
}

    export interface IdentityMembershipReadResponseDto {
    membership_benefits?: string,
    membership_description?: string,
    membership_name?: string,
    plan_name?: string,
    renewal_date?: string,
    start_date?: string,
}

    export interface IdentityUserAuthenticationResponseDto {
    age?: string,
    athlete_info?: IdentityAthleteResponseDto,
    country_code?: string,
    email?: string,
    first_name?: string,
    gender?: string,
    id?: string,
    is_active_staff?: boolean,
    last_name?: string,
    membership_info?: IdentityMembershipReadResponseDto,
    phone?: string,
    photo_url?: string,
    role?: string,
}

    export interface LocationRequestDto {
    address: string,
    name: string,
}

    export interface LocationResponseDto {
    address?: string,
    id?: string,
    name?: string,
}

    export interface MembershipRequestDto {
  /** @example "Access to all premium features" */
    description?: string,
  /** @example "Premium Membership" */
    name: string,
}

    export interface MembershipResponse {
    benefits?: string,
    created_at?: string,
    description?: string,
    id?: string,
    name?: string,
    updated_at?: string,
}

    export interface MembershipPlanPlanRequestDto {
    amt_periods?: number,
  /** @min 0 */
    credit_allocation?: number,
    membership_id: string,
    name?: string,
    stripe_joining_fees_id?: string,
    stripe_price_id: string,
  /** @min 0 */
    weekly_credit_limit?: number,
}

    export interface MembershipPlanPlanResponse {
    amt_periods?: number,
    created_at?: string,
    credit_allocation?: number,
    currency?: string,
    id?: string,
    interval?: string,
    is_visible?: boolean,
    joining_fee_price?: string,
    membership_id?: string,
    name?: string,
    price?: string,
    stripe_joining_fees_id?: string,
    stripe_price_id?: string,
    unit_amount?: number,
    updated_at?: string,
    weekly_credit_limit?: number,
}

    export interface PaymentCheckoutResponseDto {
    payment_url?: string,
}

    export interface PaymentEventEnrollmentOptions {
    can_enroll_free?: boolean,
    credit_cost?: number,
    has_sufficient_credits?: boolean,
    membership_plan_id?: string,
    stripe_price_id?: string,
}

    export interface PracticeRecurrenceRequestDto {
    court_id: string,
    day?: string,
    location_id: string,
    practice_end_at: string,
    practice_start_at: string,
    recurrence_end_at: string,
    recurrence_start_at: string,
    status?: "scheduled" | "completed" | "canceled",
    team_id: string,
}

    export interface PracticeRequestDto {
    booked_by?: string,
    court_id: string,
    end_time?: string,
    location_id: string,
    start_time: string,
    status?: "scheduled" | "completed" | "canceled",
    team_id: string,
}

    export interface PracticeResponseDto {
    booked_by?: string,
    booked_by_name?: string,
    court_id?: string,
    court_name?: string,
    created_at?: string,
    end_time?: string,
    id?: string,
    location_id?: string,
    location_name?: string,
    start_time?: string,
    status?: string,
    team_id?: string,
    team_logo_url?: string,
    team_name?: string,
    updated_at?: string,
}

    export interface ProgramLevelsResponse {
    levels?: (string)[],
}

    export interface ProgramRequestDto {
    capacity?: number,
    description?: string,
    level: string,
    name: string,
    photo_url?: string,
    type: string,
}

    export interface ProgramResponse {
    capacity?: number,
    created_at?: string,
    description?: string,
    id?: string,
    level?: string,
    name?: string,
    photo_url?: string,
    type?: string,
    updated_at?: string,
}

    export interface ScheduleResponse {
    events?: (EventEventResponseDto)[],
    games?: (GameResponseDto)[],
    practices?: (PracticeResponseDto)[],
}

    export interface StaffCoachStatsResponseDto {
    losses?: number,
    wins?: number,
}

    export interface StaffPendingStaffResponseDto {
    country_code?: string,
    created_at?: string,
    dob?: string,
    email?: string,
    first_name?: string,
    gender?: string,
    id?: string,
    last_name?: string,
    phone?: string,
    role_id?: string,
    updated_at?: string,
}

    export interface StaffRegistrationRequestDto {
    country_code?: string,
  /** @example "2000-01-01" */
    dob: string,
    first_name: string,
    gender?: "M" | "F",
    is_active_staff?: boolean,
    last_name: string,
  /** @example "+15141234567" */
    phone_number?: string,
    role: string,
}

    export interface StaffRequestDto {
    is_active: boolean,
    role_name: string,
}

    export interface StaffResponseDto {
    coach_stats?: StaffCoachStatsResponseDto,
    country_code?: string,
    created_at?: string,
    email?: string,
    first_name?: string,
    hubspot_id?: string,
    id?: string,
    is_active?: boolean,
    last_name?: string,
    phone?: string,
    photo_url?: string,
    role_name?: string,
    updated_at?: string,
}

    export interface StaffStaffProfileUpdateRequestDto {
    photo_url?: string,
}

    export interface StaffActivityLogsStaffActivityLogResponse {
    activity_description?: string,
    created_at?: string,
    email?: string,
    first_name?: string,
    id?: string,
    last_name?: string,
    staff_id?: string,
}

    export interface SuspensionSuspendUserRequestDto {
  /** e.g., "720h" (30 days), "8760h" (1 year), null = indefinite */
    suspension_duration?: string,
  /**
   * @minLength 10
   * @maxLength 500
   */
    suspension_reason: string,
}

    export interface SuspensionSuspensionInfoResponseDto {
    is_suspended?: boolean,
    suspended_at?: string,
    suspended_by?: string,
    suspension_expires_at?: string,
    suspension_reason?: string,
}

    export interface SuspensionUnsuspendUserRequestDto {
  /** whether to create invoice items for missed billing periods */
    collect_arrears?: boolean,
  /** whether to extend renewal_date by suspension duration */
    extend_membership?: boolean,
}

    export interface TeamCoach {
    email?: string,
    id?: string,
    name?: string,
}

    export interface TeamExternalTeamRequestDto {
  /** @max 100 */
    capacity: number,
  /** @maxLength 5000 */
    logo_url?: string,
  /** @maxLength 100 */
    name: string,
}

    export interface TeamRequestDto {
  /** @max 100 */
    capacity: number,
  /** @example "faae4b3a-ad9f-463c-ae4b-3aad9fb63c9b" */
    coach_id?: string,
  /** @maxLength 5000 */
    logo_url?: string,
  /** @maxLength 100 */
    name: string,
}

    export interface TeamResponse {
    capacity?: number,
    coach?: TeamCoach,
    created_at?: string,
    id?: string,
    is_external?: boolean,
    logo_url?: string,
    name?: string,
    roster?: (ApiInternalDomainsTeamDtoRosterMemberInfo)[],
    updated_at?: string,
}

    export interface UserUpdateRequestDto {
  /** @example "US" */
    "country_alpha2_code": string,
  /** @example "2000-01-01" */
    dob: string,
    email?: string,
    first_name: string,
    gender?: "M" | "F",
    has_marketing_email_consent: boolean,
    has_sms_consent: boolean,
    last_name: string,
    parent_id?: string,
    phone?: string,
}



export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">


export interface ApiConfig<SecurityDataType = unknown> {
    baseUrl?: string;
    baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
    securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
    customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
    data: D;
    error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
    Json = "application/json",
    JsonApi = "application/vnd.api+json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded",
    Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
    public baseUrl: string = "";
    private securityData: SecurityDataType | null = null;
    private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
    private abortControllers = new Map<CancelToken, AbortController>();
    private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

    private baseApiParams: RequestParams = {
        credentials: 'same-origin',
        headers: {},
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }

    constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
        Object.assign(this, apiConfig);
    }

    public setSecurityData = (data: SecurityDataType | null) => {
        this.securityData = data;
    }

    protected encodeQueryParam(key: string, value: any) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
    }

    protected addQueryParam(query: QueryParamsType, key: string) {
        return this.encodeQueryParam(key, query[key]);
    }

    protected addArrayQueryParam(query: QueryParamsType, key: string) {
        const value = query[key];
        return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
    }

    protected toQueryString(rawQuery?: QueryParamsType): string {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
        return keys
                .map((key) =>
                    Array.isArray(query[key])
                    ? this.addArrayQueryParam(query, key)
                    : this.addQueryParam(query, key),
                )
                .join("&");
    }

    protected addQueryParams(rawQuery?: QueryParamsType): string {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : "";
    }

    private contentFormatters: Record<ContentType, (input: any) => any> = {
        [ContentType.Json]: (input:any) => input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
        [ContentType.JsonApi]: (input:any) => input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
        [ContentType.Text]: (input:any) => input !== null && typeof input !== "string" ? JSON.stringify(input) : input,
        [ContentType.FormData]: (input: any) => {
            if (input instanceof FormData) {
                return input;
            }

            return Object.keys(input || {}).reduce((formData, key) => {
                const property = input[key];
                formData.append(
                    key,
                    property instanceof Blob ?
                        property :
                    typeof property === "object" && property !== null ?
                        JSON.stringify(property) :
                    `${property}`
                );
                return formData;
            }, new FormData());
        },
        [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
    }

    protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }

    protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                return abortController.signal;
            }
            return void 0;
        }

        const abortController = new AbortController();
        this.abortControllers.set(cancelToken, abortController);
        return abortController.signal;
    }

    public abortRequest = (cancelToken: CancelToken) => {
        const abortController = this.abortControllers.get(cancelToken)

        if (abortController) {
            abortController.abort();
            this.abortControllers.delete(cancelToken);
        }
    }

    public request = async <T = any, E = any>({
        body,
        secure,
        path,
        type,
        query,
        format,
        baseUrl,
        cancelToken,
        ...params
    }: FullRequestParams): Promise<HttpResponse<T, E>> => {
        const secureParams = ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) && this.securityWorker && await this.securityWorker(this.securityData)) || {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const queryString = query && this.toQueryString(query);
        const payloadFormatter = this.contentFormatters[type || ContentType.Json];
        const responseFormat = format || requestParams.format;

        return this.customFetch(
        `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
        {
            ...requestParams,
            headers: {
            ...(requestParams.headers || {}),
            ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
            },
            signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
            body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
        }
        ).then(async (response) => {
            const r = response as HttpResponse<T, E>;
            r.data = (null as unknown) as T;
            r.error = (null as unknown) as E;

            const responseToParse = responseFormat ? response.clone() : response;
            const data = !responseFormat ? r : await responseToParse[responseFormat]()
                .then((data) => {
                    if (r.ok) {
                        r.data = data;
                    } else {
                        r.error = data;
                    }
                    return r;
                })
                .catch((e) => {
                    r.error = e;
                    return r;
                });

            if (cancelToken) {
                this.abortControllers.delete(cancelToken);
            }

            if (!response.ok) throw data;
            return data;
        });
    };
}



/**
* @title Rise API
* @version 1.0
* @contact <klintlee1@gmail.com>
*/
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType>  {



  
    admin = {
  
  /**
 * No description
 *
 * @tags credits
 * @name CustomersCreditsList
 * @request GET:/admin/customers/{id}/credits
 * @secure
 */
customersCreditsList: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/customers/${id}/credits`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CustomersCreditsAddCreate
 * @request POST:/admin/customers/{id}/credits/add
 * @secure
 */
customersCreditsAddCreate: (id: string, request: Record<string,any>, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/customers/${id}/credits/add`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CustomersCreditsDeductCreate
 * @request POST:/admin/customers/{id}/credits/deduct
 * @secure
 */
customersCreditsDeductCreate: (id: string, request: Record<string,any>, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/customers/${id}/credits/deduct`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CustomersCreditsTransactionsList
 * @request GET:/admin/customers/{id}/credits/transactions
 * @secure
 */
customersCreditsTransactionsList: (id: string, query?: {
  /**
   * Number of items per page
   * @min 1
   * @max 100
   * @default 20
   */
    limit?: number,
  /**
   * Number of items to skip
   * @min 0
   * @default 0
   */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/customers/${id}/credits/transactions`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CustomersCreditsWeeklyUsageList
 * @request GET:/admin/customers/{id}/credits/weekly-usage
 * @secure
 */
customersCreditsWeeklyUsageList: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/customers/${id}/credits/weekly-usage`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name EventsCreditCostUpdate
 * @request PUT:/admin/events/{id}/credit-cost
 * @secure
 */
eventsCreditCostUpdate: (id: string, request: Record<string,any>, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/events/${id}/credit-cost`,
        method: 'PUT',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name EventsCreditTransactionsList
 * @request GET:/admin/events/{id}/credit-transactions
 * @secure
 */
eventsCreditTransactionsList: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/admin/events/${id}/credit-transactions`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Export payment transactions to CSV format (admin only)
 *
 * @tags Payments - Admin
 * @name PaymentsExportList
 * @summary Export payment transactions
 * @request GET:/admin/payments/export
 * @secure
 */
paymentsExportList: (query?: {
  /** Start date (RFC3339 format) */
    start_date?: string,
  /** End date (RFC3339 format) */
    end_date?: string,
  /** Filter by transaction type */
    transaction_type?: string,
  /** Filter by payment status */
    payment_status?: string,

}, params: RequestParams = {}) =>
    this.request<File, Record<string,any>>({
        path: `/admin/payments/export`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Get aggregated subsidy usage statistics (admin only)
 *
 * @tags Payments - Admin
 * @name PaymentsSubsidyUsageList
 * @summary Get subsidy usage summary
 * @request GET:/admin/payments/subsidy-usage
 * @secure
 */
paymentsSubsidyUsageList: (query?: {
  /** Start date (RFC3339 format) */
    start_date?: string,
  /** End date (RFC3339 format) */
    end_date?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,string>>({
        path: `/admin/payments/subsidy-usage`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get aggregated payment statistics for a date range (admin only)
 *
 * @tags Payments - Admin
 * @name PaymentsSummaryList
 * @summary Get payment summary
 * @request GET:/admin/payments/summary
 * @secure
 */
paymentsSummaryList: (query?: {
  /** Start date (RFC3339 format) */
    start_date?: string,
  /** End date (RFC3339 format) */
    end_date?: string,
  /** Filter by transaction type */
    transaction_type?: string,
  /** Filter by payment status */
    payment_status?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,string>>({
        path: `/admin/payments/summary`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get payment statistics grouped by transaction type (admin only)
 *
 * @tags Payments - Admin
 * @name PaymentsSummaryByTypeList
 * @summary Get payment summary by type
 * @request GET:/admin/payments/summary/by-type
 * @secure
 */
paymentsSummaryByTypeList: (query?: {
  /** Start date (RFC3339 format) */
    start_date?: string,
  /** End date (RFC3339 format) */
    end_date?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,string>>({
        path: `/admin/payments/summary/by-type`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get paginated list of payment transactions with optional filters (admin only)
 *
 * @tags Payments - Admin
 * @name PaymentsTransactionsList
 * @summary List payment transactions
 * @request GET:/admin/payments/transactions
 * @secure
 */
paymentsTransactionsList: (query?: {
  /** Filter by customer ID */
    customer_id?: string,
  /** Filter by transaction type (membership_subscription, program_enrollment, event_registration, credit_package) */
    transaction_type?: string,
  /** Filter by payment status (pending, completed, failed, refunded, partially_refunded) */
    payment_status?: string,
  /** Start date (RFC3339 format) */
    start_date?: string,
  /** End date (RFC3339 format) */
    end_date?: string,
  /** Filter by subsidy ID */
    subsidy_id?: string,
  /**
   * Page size
   * @default 50
   */
    limit?: number,
  /**
   * Page offset
   * @default 0
   */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,string>>({
        path: `/admin/payments/transactions`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    ai = {
  
  /**
 * No description
 *
 * @tags ai
 * @name ChatCreate
 * @summary Proxy chat message to AI model
 * @request POST:/ai/chat
 */
chatCreate: (payload: DtoChatRequest, params: RequestParams = {}) =>
    this.request<DtoChatResponse, Record<string,string>>({
        path: `/ai/chat`,
        method: 'POST',
                body: payload,                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    athletes = {
  
  /**
 * @description Retrieves a paginated list of athletes with profile details and stats.
 *
 * @tags athletes
 * @name AthletesList
 * @summary Get all athletes
 * @request GET:/athletes
 */
athletesList: (query?: {
  /** Number of athletes to retrieve (default: 10) */
    limit?: number,
  /** Number of athletes to skip (default: 0) */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<(AthleteResponseAthlete)[], void>({
        path: `/athletes`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags athletes
 * @name TeamDelete
 * @request DELETE:/athletes/{athlete_id}/team
 * @secure
 */
teamDelete: (athleteId: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/athletes/${athleteId}/team`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags athletes
 * @name TeamUpdate
 * @request PUT:/athletes/{athlete_id}/team/{team_id}
 * @secure
 */
teamUpdate: (athleteId: string, teamId: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/athletes/${athleteId}/team/${teamId}`,
        method: 'PUT',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags athletes
 * @name ProfilePartialUpdate
 * @request PATCH:/athletes/{id}/profile
 * @secure
 */
profilePartialUpdate: (id: string, update_body: CustomerAthleteProfileUpdateRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/athletes/${id}/profile`,
        method: 'PATCH',
                body: update_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags athletes
 * @name StatsPartialUpdate
 * @request PATCH:/athletes/{id}/stats
 * @secure
 */
statsPartialUpdate: (id: string, update_body: CustomerStatsUpdateRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/athletes/${id}/stats`,
        method: 'PATCH',
                body: update_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    auth = {
  
  /**
 * No description
 *
 * @tags authentication
 * @name AuthCreate
 * @request POST:/auth
 */
authCreate: (params: RequestParams = {}) =>
    this.request<IdentityUserAuthenticationResponseDto, Record<string,any>>({
        path: `/auth`,
        method: 'POST',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Authenticates a user using Firebase token and returns a JWT token for the authenticated user
 *
 * @tags authentication
 * @name ChildCreate
 * @summary Authenticate a user and return a JWT token
 * @request POST:/auth/child/{id}
 * @secure
 */
childCreate: (id: string, params: RequestParams = {}) =>
    this.request<IdentityUserAuthenticationResponseDto, Record<string,any>>({
        path: `/auth/child/${id}`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Generates a new verification token and resends the verification email
 *
 * @tags authentication
 * @name ResendVerificationCreate
 * @summary Resend verification email
 * @request POST:/auth/resend-verification
 */
resendVerificationCreate: (request: EmailVerificationResendVerificationRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/auth/resend-verification`,
        method: 'POST',
                body: request,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Verifies a user's email address using the verification token sent to their email
 *
 * @tags authentication
 * @name VerifyEmailCreate
 * @summary Verify email address
 * @request POST:/auth/verify-email
 */
verifyEmailCreate: (request: EmailVerificationVerifyEmailRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/auth/verify-email`,
        method: 'POST',
                body: request,                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    bookings = {
  
  /**
 * No description
 *
 * @tags bookings
 * @name UpcomingList
 * @request GET:/bookings/upcoming
 * @secure
 */
upcomingList: (params: RequestParams = {}) =>
    this.request<BookingUpcomingBookingsResponse, Record<string,any>>({
        path: `/bookings/upcoming`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
    }
    checkout = {
  
  /**
 * No description
 *
 * @tags payments
 * @name CreditPackagesCreate
 * @request POST:/checkout/credit_packages/{id}
 * @secure
 */
creditPackagesCreate: (id: string, params: RequestParams = {}) =>
    this.request<PaymentCheckoutResponseDto, Record<string,any>>({
        path: `/checkout/credit_packages/${id}`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags payments
 * @name EventsCreate
 * @request POST:/checkout/events/{id}
 * @secure
 */
eventsCreate: (id: string, query?: {
  /** Discount code to apply */
    discount_code?: string,

}, params: RequestParams = {}) =>
    this.request<PaymentCheckoutResponseDto, Record<string,any>>({
        path: `/checkout/events/${id}`,
        method: 'POST',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags payments
 * @name EventsEnhancedCreate
 * @request POST:/checkout/events/{id}/enhanced
 * @secure
 */
eventsEnhancedCreate: (id: string, request: Record<string,any>, query?: {
  /** Discount code to apply */
    discount_code?: string,

}, params: RequestParams = {}) =>
    this.request<PaymentCheckoutResponseDto, Record<string,any>>({
        path: `/checkout/events/${id}/enhanced`,
        method: 'POST',
        query: query,        body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags payments
 * @name EventsOptionsList
 * @request GET:/checkout/events/{id}/options
 * @secure
 */
eventsOptionsList: (id: string, params: RequestParams = {}) =>
    this.request<PaymentEventEnrollmentOptions, Record<string,any>>({
        path: `/checkout/events/${id}/options`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Generates a payment link for purchasing a membership plan.
 *
 * @tags payments
 * @name MembershipPlansCreate
 * @request POST:/checkout/membership_plans/{id}
 * @secure
 */
membershipPlansCreate: (id: string, query?: {
  /** Discount code to apply */
    discount_code?: string,

}, params: RequestParams = {}) =>
    this.request<PaymentCheckoutResponseDto, Record<string,any>>({
        path: `/checkout/membership_plans/${id}`,
        method: 'POST',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags payments
 * @name ProgramsCreate
 * @request POST:/checkout/programs/{id}
 * @secure
 */
programsCreate: (id: string, query?: {
  /** Discount code to apply */
    discount_code?: string,

}, params: RequestParams = {}) =>
    this.request<PaymentCheckoutResponseDto, Record<string,any>>({
        path: `/checkout/programs/${id}`,
        method: 'POST',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    contact = {
  
  /**
 * @description Verifies reCAPTCHA, sanitizes input, and emails the contact form
 *
 * @tags contact
 * @name ContactCreate
 * @summary Send a contact request
 * @request POST:/contact
 */
contactCreate: (payload: DtoContactRequest, params: RequestParams = {}) =>
    this.request<Record<string,string>, Record<string,string>>({
        path: `/contact`,
        method: 'POST',
                body: payload,                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    courts = {
  
  /**
 * @description Retrieves all courts
 *
 * @tags courts
 * @name CourtsList
 * @summary List courts
 * @request GET:/courts
 */
courtsList: (params: RequestParams = {}) =>
    this.request<(CourtResponseDto)[], Record<string,any>>({
        path: `/courts`,
        method: 'GET',
                                        format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new court for a location
 *
 * @tags courts
 * @name CourtsCreate
 * @summary Create a court
 * @request POST:/courts
 * @secure
 */
courtsCreate: (court: CourtRequestDto, params: RequestParams = {}) =>
    this.request<CourtResponseDto, Record<string,any>>({
        path: `/courts`,
        method: 'POST',
                body: court,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves a single court using its UUID
 *
 * @tags courts
 * @name CourtsDetail
 * @summary Get a court by ID
 * @request GET:/courts/{id}
 */
courtsDetail: (id: string, params: RequestParams = {}) =>
    this.request<CourtResponseDto, Record<string,any>>({
        path: `/courts/${id}`,
        method: 'GET',
                                        format: "json",        ...params,
    }),
  
  /**
 * @description Updates a court's details
 *
 * @tags courts
 * @name CourtsUpdate
 * @summary Update a court
 * @request PUT:/courts/{id}
 * @secure
 */
courtsUpdate: (id: string, court: CourtRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/courts/${id}`,
        method: 'PUT',
                body: court,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Deletes a court by its ID
 *
 * @tags courts
 * @name CourtsDelete
 * @summary Delete a court
 * @request DELETE:/courts/{id}
 * @secure
 */
courtsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/courts/${id}`,
        method: 'DELETE',
                        secure: true,                        ...params,
    }),
    }
    creditPackages = {
  
  /**
 * No description
 *
 * @tags credit-packages
 * @name CreditPackagesList
 * @request GET:/credit_packages
 */
creditPackagesList: (params: RequestParams = {}) =>
    this.request<(CreditPackageCreditPackageResponse)[], Record<string,any>>({
        path: `/credit_packages`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags admin-credit-packages
 * @name CreditPackagesCreate
 * @request POST:/credit_packages
 * @secure
 */
creditPackagesCreate: (payload: CreditPackageCreateCreditPackageRequest, params: RequestParams = {}) =>
    this.request<CreditPackageCreditPackageResponse, Record<string,any>>({
        path: `/credit_packages`,
        method: 'POST',
                body: payload,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credit-packages
 * @name CreditPackagesDetail
 * @request GET:/credit_packages/{id}
 */
creditPackagesDetail: (id: string, params: RequestParams = {}) =>
    this.request<CreditPackageCreditPackageResponse, Record<string,any>>({
        path: `/credit_packages/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags admin-credit-packages
 * @name CreditPackagesUpdate
 * @request PUT:/credit_packages/{id}
 * @secure
 */
creditPackagesUpdate: (id: string, payload: CreditPackageUpdateCreditPackageRequest, params: RequestParams = {}) =>
    this.request<CreditPackageCreditPackageResponse, Record<string,any>>({
        path: `/credit_packages/${id}`,
        method: 'PUT',
                body: payload,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags admin-credit-packages
 * @name CreditPackagesDelete
 * @request DELETE:/credit_packages/{id}
 * @secure
 */
creditPackagesDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/credit_packages/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    customers = {
  
  /**
 * @description Retrieves a list of customers, optionally filtered by fields like parent ID, name, email, phone, and ID, with pagination support.
 *
 * @tags customers
 * @name CustomersList
 * @summary Get customers
 * @request GET:/customers
 */
customersList: (query?: {
  /** Number of customers to retrieve (default: 20, max: 20) */
    limit?: number,
  /** Number of customers to skip (default: 0) */
    offset?: number,
  /** Search term to filter customers */
    search?: string,
  /** Parent ID to filter customers (example: 123e4567-e89b-12d3-a456-426614174000) */
    parent_id?: string,

}, params: RequestParams = {}) =>
    this.request<(CustomerResponse)[], void>({
        path: `/customers`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name ArchivedList
 * @request GET:/customers/archived
 */
archivedList: (query?: {
  /** Number of customers to retrieve (default: 20, max: 20) */
    limit?: number,
  /** Number of customers to skip (default: 0) */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<(CustomerResponse)[], void>({
        path: `/customers/archived`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name CheckinDetail
 * @request GET:/customers/checkin/{id}
 */
checkinDetail: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/customers/checkin/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name EmailDetail
 * @request GET:/customers/email/{email}
 */
emailDetail: (email: string, params: RequestParams = {}) =>
    this.request<CustomerResponse, void>({
        path: `/customers/email/${email}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name GetCustomers
 * @request GET:/customers/id/{id}
 */
getCustomers: (id: string, params: RequestParams = {}) =>
    this.request<CustomerResponse, void>({
        path: `/customers/id/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name ArchiveCreate
 * @request POST:/customers/{id}/archive
 */
archiveCreate: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/customers/${id}/archive`,
        method: 'POST',
                                type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Calculates and creates Stripe invoice items for missed billing periods during suspension. Does not unsuspend the user. Requires admin role.
 *
 * @tags customers
 * @name CollectArrearsCreate
 * @summary Manually collect arrears for suspended user
 * @request POST:/customers/{id}/collect-arrears
 * @secure
 */
collectArrearsCreate: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/customers/${id}/collect-arrears`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name MembershipsList
 * @request GET:/customers/{id}/memberships
 */
membershipsList: (id: string, params: RequestParams = {}) =>
    this.request<(CustomerMembershipHistoryResponse)[], Record<string,any>>({
        path: `/customers/${id}/memberships`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name NotesUpdate
 * @request PUT:/customers/{id}/notes
 * @secure
 */
notesUpdate: (id: string, notes_body: CustomerNotesUpdateRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/customers/${id}/notes`,
        method: 'PUT',
                body: notes_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Suspends a user account, pauses their memberships and Stripe subscriptions. Requires admin role.
 *
 * @tags customers
 * @name SuspendCreate
 * @summary Suspend user account
 * @request POST:/customers/{id}/suspend
 * @secure
 */
suspendCreate: (id: string, suspension_body: SuspensionSuspendUserRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/customers/${id}/suspend`,
        method: 'POST',
                body: suspension_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves suspension information for a user including reason, suspended by, and expiration date
 *
 * @tags customers
 * @name SuspensionList
 * @summary Get user suspension status
 * @request GET:/customers/{id}/suspension
 * @secure
 */
suspensionList: (id: string, params: RequestParams = {}) =>
    this.request<SuspensionSuspensionInfoResponseDto, Record<string,any>>({
        path: `/customers/${id}/suspension`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name UnarchiveCreate
 * @request POST:/customers/{id}/unarchive
 */
unarchiveCreate: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/customers/${id}/unarchive`,
        method: 'POST',
                                type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Unsuspends a user account, resumes their memberships and Stripe subscriptions. Optionally extends membership by suspension duration. Requires admin role.
 *
 * @tags customers
 * @name UnsuspendCreate
 * @summary Unsuspend user account
 * @request POST:/customers/{id}/unsuspend
 * @secure
 */
unsuspendCreate: (id: string, unsuspension_body: SuspensionUnsuspendUserRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/customers/${id}/unsuspend`,
        method: 'POST',
                body: unsuspension_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    discounts = {
  
  /**
 * @description Retrieves a list of all discount codes (both active and inactive)
 *
 * @tags discounts
 * @name DiscountsList
 * @summary List all discount codes
 * @request GET:/discounts
 */
discountsList: (params: RequestParams = {}) =>
    this.request<(DiscountResponseDto)[], Record<string,any>>({
        path: `/discounts`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new discount code with Stripe coupon integration. Supports percentage and fixed amount discounts for subscriptions, one-time payments, or both.
 *
 * @tags discounts
 * @name DiscountsCreate
 * @summary Create a new discount code
 * @request POST:/discounts
 * @secure
 */
discountsCreate: (request: DiscountRequestDto, params: RequestParams = {}) =>
    this.request<DiscountResponseDto, Record<string,any>>({
        path: `/discounts`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Validates a discount code for the current customer and records usage. Checks usage limits, membership plan restrictions, and validity dates.
 *
 * @tags discounts
 * @name ApplyCreate
 * @summary Validate and apply a discount code
 * @request POST:/discounts/apply
 * @secure
 */
applyCreate: (request: DiscountApplyRequestDto, params: RequestParams = {}) =>
    this.request<DiscountResponseDto, Record<string,any>>({
        path: `/discounts/apply`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves detailed information about a specific discount code
 *
 * @tags discounts
 * @name DiscountsDetail
 * @summary Get discount by ID
 * @request GET:/discounts/{id}
 */
discountsDetail: (id: string, params: RequestParams = {}) =>
    this.request<DiscountResponseDto, Record<string,any>>({
        path: `/discounts/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Updates an existing discount code. Note: Stripe coupon is not updated, only local database values.
 *
 * @tags discounts
 * @name DiscountsUpdate
 * @summary Update a discount code
 * @request PUT:/discounts/{id}
 * @secure
 */
discountsUpdate: (id: string, request: DiscountRequestDto, params: RequestParams = {}) =>
    this.request<DiscountResponseDto, Record<string,any>>({
        path: `/discounts/${id}`,
        method: 'PUT',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Deletes a discount code from the database. Note: Associated Stripe coupon is not deleted.
 *
 * @tags discounts
 * @name DiscountsDelete
 * @summary Delete a discount code
 * @request DELETE:/discounts/{id}
 * @secure
 */
discountsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/discounts/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    events = {
  
  /**
 * No description
 *
 * @tags events
 * @name EventsList
 * @request GET:/events
 */
eventsList: (query?: {
  /**
   * Start date of the events range (YYYY-MM-DD)
   * @format date
   * @example ""2025-03-01""
   */
    after?: string,
  /**
   * End date of the events range (YYYY-MM-DD)
   * @format date
   * @example ""2025-03-31""
   */
    before?: string,
  /** Convenience month filter in YYYY-MM format */
    month?: string,
  /** Convenience day filter in YYYY-MM-DD format */
    day?: string,
  /**
   * Filter by program ID
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    program_id?: string,
  /**
   * Filter by participant ID
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    participant_id?: string,
  /**
   * Filter by team ID
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    team_id?: string,
  /**
   * Filter by location ID
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    location_id?: string,
  /**
   * Filter by program type
   * @example "practice"
   */
    program_type?: "practice" | "course" | "game" | "other" | "others" | "tournament" | "event" | "tryouts",
  /**
   * Response format type
   * @default "date"
   * @example "date"
   */
    response_type?: "date" | "day",
  /**
   * ID of person who created the event
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    created_by?: string,
  /**
   * ID of person who updated the event
   * @format uuid
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    updated_by?: string,
  /**
   * Number of items per page
   * @min 1
   * @example 10
   */
    limit?: number,
  /**
   * Number of items to skip (for pagination)
   * @min 0
   * @example 20
   */
    offset?: number,
  /**
   * Page number (alternative to offset)
   * @min 1
   * @example 2
   */
    page?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name EventsDelete
 * @request DELETE:/events
 * @secure
 */
eventsDelete: (ids: EventDeleteRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events`,
        method: 'DELETE',
                body: ids,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name OneTimeCreate
 * @request POST:/events/one-time
 * @secure
 */
oneTimeCreate: (event: EventEventRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/one-time`,
        method: 'POST',
                body: event,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name RecurringCreate
 * @request POST:/events/recurring
 * @secure
 */
recurringCreate: (event: EventRecurrenceRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/recurring`,
        method: 'POST',
                body: event,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name RecurringUpdate
 * @request PUT:/events/recurring/{id}
 * @secure
 */
recurringUpdate: (id: string, event: EventRecurrenceRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/recurring/${id}`,
        method: 'PUT',
                body: event,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name RecurringDelete
 * @request DELETE:/events/recurring/{id}
 * @secure
 */
recurringDelete: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/recurring/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Completely removes a customer's enrollment from an event (deletes the record).
 *
 * @tags event_enrollment
 * @name CustomersDelete
 * @summary Remove a customer from an event
 * @request DELETE:/events/{event_id}/customers/{customer_id}
 * @secure
 */
customersDelete: (eventId: string, customerId: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/${eventId}/customers/${customerId}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Assign a staff member to an event using event_id and staff_id in the request body.
 *
 * @tags event_staff
 * @name StaffsCreate
 * @summary Assign a staff member to an event
 * @request POST:/events/{event_id}/staffs/{staff_id}
 */
staffsCreate: (eventId: string, staffId: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/${eventId}/staffs/${staffId}`,
        method: 'POST',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Remove a staff member from an event using event_id and staff_id in the request body.
 *
 * @tags event_staff
 * @name StaffsDelete
 * @summary Unassign a staff member from an event
 * @request DELETE:/events/{event_id}/staffs/{staff_id}
 */
staffsDelete: (eventId: string, staffId: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/${eventId}/staffs/${staffId}`,
        method: 'DELETE',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name EventsDetail
 * @request GET:/events/{id}
 */
eventsDetail: (id: string, params: RequestParams = {}) =>
    this.request<EventEventResponseDto, Record<string,any>>({
        path: `/events/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name EventsUpdate
 * @request PUT:/events/{id}
 * @secure
 */
eventsUpdate: (id: string, event: EventEventRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/events/${id}`,
        method: 'PUT',
                body: event,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    games = {
  
  /**
 * @description Retrieves a list of games with optional time-based filtering and location/court filtering.
 *
 * @tags games
 * @name GamesList
 * @summary List games (all, upcoming, or past)
 * @request GET:/games
 */
gamesList: (query?: {
  /** Filter by time: upcoming or past */
    filter?: string,
  /**
   * Filter by court ID (UUID format)
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    court_id?: string,
  /**
   * Filter by location ID (UUID format)
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    location_id?: string,
  /**
   * Page number for pagination (default: 1)
   * @example 1
   */
    page?: number,
  /**
   * Number of records per page (default: 10, max: 100)
   * @example 10
   */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<(GameResponseDto)[], Record<string,any>>({
        path: `/games`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new game entry in the system.
 *
 * @tags games
 * @name GamesCreate
 * @summary Create a new game
 * @request POST:/games
 * @secure
 */
gamesCreate: (game: GameRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/games`,
        method: 'POST',
                body: game,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Retrieves a single game using its UUID.
 *
 * @tags games
 * @name GamesDetail
 * @summary Get game by ID
 * @request GET:/games/{id}
 */
gamesDetail: (id: string, params: RequestParams = {}) =>
    this.request<GameResponseDto, Record<string,any>>({
        path: `/games/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Updates a game by its ID.
 *
 * @tags games
 * @name GamesUpdate
 * @summary Update a game
 * @request PUT:/games/{id}
 * @secure
 */
gamesUpdate: (id: string, game: GameRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/games/${id}`,
        method: 'PUT',
                body: game,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Deletes a game by its ID.
 *
 * @tags games
 * @name GamesDelete
 * @summary Delete a game
 * @request DELETE:/games/{id}
 * @secure
 */
gamesDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/games/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    haircuts = {
  
  /**
 * @description Retrieves all haircut images from a folder in Google Cloud Storage. Optionally, specify a barber name to get images from that barber's folder.
 *
 * @tags haircuts
 * @name HaircutsList
 * @request GET:/haircuts
 */
haircutsList: (query?: {
  /** Barber ID to filter images */
    barber_id?: string,

}, params: RequestParams = {}) =>
    this.request<(string)[], Record<string,string>>({
        path: `/haircuts`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Uploads a haircut image to Google Cloud Storage and returns the object URL.
 *
 * @tags haircuts
 * @name HaircutsCreate
 * @request POST:/haircuts
 * @secure
 */
haircutsCreate: (data: {
  /**
   * Haircut image to upload
   * @format binary
   */
    file: File,

}, params: RequestParams = {}) =>
    this.request<Record<string,string>, Record<string,string>>({
        path: `/haircuts`,
        method: 'POST',
                body: data,        secure: true,        type: ContentType.FormData,        format: "json",        ...params,
    }),
  
  /**
 * @description Get all availability records for the authenticated barber
 *
 * @tags barber-availability
 * @name BarbersMeAvailabilityList
 * @summary Get my availability schedule
 * @request GET:/haircuts/barbers/me/availability
 * @secure
 */
barbersMeAvailabilityList: (params: RequestParams = {}) =>
    this.request<HaircutEventWeeklyAvailabilityResponseDto, Record<string,any>>({
        path: `/haircuts/barbers/me/availability`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Set working hours for a specific day of the week
 *
 * @tags barber-availability
 * @name BarbersMeAvailabilityCreate
 * @summary Set availability for a day
 * @request POST:/haircuts/barbers/me/availability
 * @secure
 */
barbersMeAvailabilityCreate: (availability: HaircutEventSetAvailabilityDto, params: RequestParams = {}) =>
    this.request<HaircutEventAvailabilityResponseDto, Record<string,any>>({
        path: `/haircuts/barbers/me/availability`,
        method: 'POST',
                body: availability,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Set working hours for multiple days of the week in one request
 *
 * @tags barber-availability
 * @name BarbersMeAvailabilityBulkCreate
 * @summary Set availability for multiple days
 * @request POST:/haircuts/barbers/me/availability/bulk
 * @secure
 */
barbersMeAvailabilityBulkCreate: (availability: HaircutEventBulkSetAvailabilityDto, params: RequestParams = {}) =>
    this.request<HaircutEventWeeklyAvailabilityResponseDto, Record<string,any>>({
        path: `/haircuts/barbers/me/availability/bulk`,
        method: 'POST',
                body: availability,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Update an existing availability record by ID
 *
 * @tags barber-availability
 * @name BarbersMeAvailabilityUpdate
 * @summary Update availability record
 * @request PUT:/haircuts/barbers/me/availability/{id}
 * @secure
 */
barbersMeAvailabilityUpdate: (id: string, availability: HaircutEventUpdateAvailabilityDto, params: RequestParams = {}) =>
    this.request<HaircutEventAvailabilityResponseDto, Record<string,any>>({
        path: `/haircuts/barbers/me/availability/${id}`,
        method: 'PUT',
                body: availability,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Delete an existing availability record by ID
 *
 * @tags barber-availability
 * @name BarbersMeAvailabilityDelete
 * @summary Delete availability record
 * @request DELETE:/haircuts/barbers/me/availability/{id}
 * @secure
 */
barbersMeAvailabilityDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/haircuts/barbers/me/availability/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Get available booking slots for a specific barber on a given date, considering their working hours and existing bookings.
 *
 * @tags haircuts
 * @name BarbersAvailabilityList
 * @summary Get available time slots for a barber
 * @request GET:/haircuts/barbers/{barber_id}/availability
 */
barbersAvailabilityList: (barberId: string, query: {
  /**
   * Date in YYYY-MM-DD format
   * @example ""2025-09-20""
   */
    date: string,
  /**
   * Service duration in minutes (default: 30)
   * @example 30
   */
    service_duration?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/haircuts/barbers/${barberId}/availability`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieve all haircut events, with optional filters by barber ID and customer ID.
 *
 * @tags haircuts
 * @name EventsList
 * @summary Get all haircut events
 * @request GET:/haircuts/events
 */
eventsList: (query?: {
  /**
   * Start date of the events range (YYYY-MM-DD)
   * @example ""2025-03-01""
   */
    after?: string,
  /**
   * End date of the events range (YYYY-MM-DD)
   * @example ""2025-03-31""
   */
    before?: string,
  /** Filter by barber ID */
    barber_id?: string,
  /** Filter by customer ID */
    customer_id?: string,

}, params: RequestParams = {}) =>
    this.request<(HaircutEventEventResponseDto)[], Record<string,any>>({
        path: `/haircuts/events`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Registers a new haircut event with the provided details from request body. Requires an Authorization header containing the customer's JWT, ensuring only logged-in customers can make the request.
 *
 * @tags haircuts
 * @name EventsCreate
 * @request POST:/haircuts/events
 * @secure
 */
eventsCreate: (event: HaircutEventRequestDto, params: RequestParams = {}) =>
    this.request<HaircutEventEventResponseDto, Record<string,any>>({
        path: `/haircuts/events`,
        method: 'POST',
                body: event,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves details of a specific haircut event based on its ID.
 *
 * @tags haircuts
 * @name EventsDetail
 * @request GET:/haircuts/events/{id}
 */
eventsDetail: (id: string, params: RequestParams = {}) =>
    this.request<HaircutEventEventResponseDto, Record<string,any>>({
        path: `/haircuts/events/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Deletes a haircut event by its ID.
 *
 * @tags haircuts
 * @name EventsDelete
 * @request DELETE:/haircuts/events/{id}
 */
eventsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/haircuts/events/${id}`,
        method: 'DELETE',
                                type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags haircuts
 * @name ServicesList
 * @request GET:/haircuts/services
 */
servicesList: (params: RequestParams = {}) =>
    this.request<(HaircutServiceBarberServiceResponseDto)[], Record<string,any>>({
        path: `/haircuts/services`,
        method: 'GET',
                                        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags haircuts
 * @name ServicesCreate
 * @request POST:/haircuts/services
 */
servicesCreate: (request: HaircutServiceCreateBarberServiceRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/haircuts/services`,
        method: 'POST',
                body: request,                type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags haircuts
 * @name ServicesDelete
 * @request DELETE:/haircuts/services/{id}
 */
servicesDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/haircuts/services/${id}`,
        method: 'DELETE',
                                                ...params,
    }),
    }
    health = {
  
  /**
 * @description Returns the health status of the application and its dependencies
 *
 * @tags health
 * @name HealthList
 * @summary Health check endpoint for load balancer integration
 * @request GET:/health
 */
healthList: (params: RequestParams = {}) =>
    this.request<HandlerHealthStatus, HandlerHealthStatus>({
        path: `/health`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Performs comprehensive security audit and returns results
 *
 * @tags security
 * @name SecurityAuditList
 * @summary Security audit
 * @request GET:/health/security-audit
 */
securityAuditList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, any>({
        path: `/health/security-audit`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Returns statistics about webhook retry attempts
 *
 * @tags health
 * @name WebhookRetriesList
 * @summary Webhook retry statistics
 * @request GET:/health/webhook-retries
 */
webhookRetriesList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, any>({
        path: `/health/webhook-retries`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    live = {
  
  /**
 * @description Returns whether the service is alive
 *
 * @tags health
 * @name LiveList
 * @summary Liveness check endpoint
 * @request GET:/live
 */
liveList: (params: RequestParams = {}) =>
    this.request<Record<string,string>, any>({
        path: `/live`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    locations = {
  
  /**
 * No description
 *
 * @tags locations
 * @name LocationsList
 * @request GET:/locations
 */
locationsList: (params: RequestParams = {}) =>
    this.request<(LocationResponseDto)[], Record<string,any>>({
        path: `/locations`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags locations
 * @name LocationsCreate
 * @request POST:/locations
 */
locationsCreate: (body: LocationRequestDto, params: RequestParams = {}) =>
    this.request<LocationResponseDto, Record<string,any>>({
        path: `/locations`,
        method: 'POST',
                body: body,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags locations
 * @name LocationsDetail
 * @request GET:/locations/{id}
 */
locationsDetail: (id: string, params: RequestParams = {}) =>
    this.request<LocationResponseDto, Record<string,any>>({
        path: `/locations/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags locations
 * @name LocationsUpdate
 * @request PUT:/locations/{id}
 */
locationsUpdate: (id: string, body: LocationRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/locations/${id}`,
        method: 'PUT',
                body: body,                type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags locations
 * @name LocationsDelete
 * @request DELETE:/locations/{id}
 */
locationsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/locations/${id}`,
        method: 'DELETE',
                                type: ContentType.Json,                ...params,
    }),
    }
    memberships = {
  
  /**
 * No description
 *
 * @tags memberships
 * @name MembershipsList
 * @request GET:/memberships
 */
membershipsList: (params: RequestParams = {}) =>
    this.request<(MembershipResponse)[], Record<string,any>>({
        path: `/memberships`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags memberships
 * @name MembershipsCreate
 * @request POST:/memberships
 * @secure
 */
membershipsCreate: (membership: MembershipRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships`,
        method: 'POST',
                body: membership,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags membership-plans
 * @name PlansCreate
 * @request POST:/memberships/plans
 * @secure
 */
plansCreate: (plan: MembershipPlanPlanRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships/plans`,
        method: 'POST',
                body: plan,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags membership-plans
 * @name PlansUpdate
 * @request PUT:/memberships/plans/{id}
 * @secure
 */
plansUpdate: (id: string, plan: MembershipPlanPlanRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships/plans/${id}`,
        method: 'PUT',
                body: plan,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags membership-plans
 * @name PlansDelete
 * @request DELETE:/memberships/plans/{id}
 * @secure
 */
plansDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships/plans/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags admin-membership-plans
 * @name PlansVisibilityPartialUpdate
 * @request PATCH:/memberships/plans/{id}/visibility
 * @secure
 */
plansVisibilityPartialUpdate: (id: string, visibility: Record<string,boolean>, params: RequestParams = {}) =>
    this.request<MembershipPlanPlanResponse, Record<string,any>>({
        path: `/memberships/plans/${id}/visibility`,
        method: 'PATCH',
                body: visibility,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags memberships
 * @name MembershipsDetail
 * @request GET:/memberships/{id}
 */
membershipsDetail: (id: string, params: RequestParams = {}) =>
    this.request<MembershipResponse, Record<string,any>>({
        path: `/memberships/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags memberships
 * @name MembershipsUpdate
 * @request PUT:/memberships/{id}
 * @secure
 */
membershipsUpdate: (id: string, membership: MembershipRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships/${id}`,
        method: 'PUT',
                body: membership,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags memberships
 * @name MembershipsDelete
 * @request DELETE:/memberships/{id}
 * @secure
 */
membershipsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/memberships/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags membership-plans
 * @name PlansList
 * @request GET:/memberships/{id}/plans
 */
plansList: (id: string, query?: {
  /**
   * Include hidden plans (admin only)
   * @default false
   */
    include_hidden?: boolean,

}, params: RequestParams = {}) =>
    this.request<(MembershipPlanPlanResponse)[], Record<string,any>>({
        path: `/memberships/${id}/plans`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    newsletter = {
  
  /**
 * @description Adds or updates a contact with a HubSpot newsletter tag
 *
 * @tags newsletter
 * @name NewsletterCreate
 * @summary Subscribe to newsletter
 * @request POST:/newsletter
 */
newsletterCreate: (payload: DtoNewsletterRequest, params: RequestParams = {}) =>
    this.request<Record<string,string>, Record<string,string>>({
        path: `/newsletter`,
        method: 'POST',
                body: payload,                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    playground = {
  
  /**
 * No description
 *
 * @tags playground-systems
 * @name SystemsList
 * @request GET:/playground/systems
 */
systemsList: (params: RequestParams = {}) =>
    this.request<(ApiInternalDomainsPlaygroundDtoSystemResponseDto)[], any>({
        path: `/playground/systems`,
        method: 'GET',
                                        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags playground-systems
 * @name SystemsCreate
 * @request POST:/playground/systems
 * @secure
 */
systemsCreate: (system: ApiInternalDomainsPlaygroundDtoSystemRequestDto, params: RequestParams = {}) =>
    this.request<ApiInternalDomainsPlaygroundDtoSystemResponseDto, Record<string,any>>({
        path: `/playground/systems`,
        method: 'POST',
                body: system,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags playground-systems
 * @name SystemsUpdate
 * @request PUT:/playground/systems/{id}
 * @secure
 */
systemsUpdate: (id: string, system: ApiInternalDomainsPlaygroundDtoSystemRequestDto, params: RequestParams = {}) =>
    this.request<ApiInternalDomainsPlaygroundDtoSystemResponseDto, Record<string,any>>({
        path: `/playground/systems/${id}`,
        method: 'PUT',
                body: system,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags playground-systems
 * @name SystemsDelete
 * @request DELETE:/playground/systems/{id}
 * @secure
 */
systemsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/playground/systems/${id}`,
        method: 'DELETE',
                        secure: true,                        ...params,
    }),
    }
    practices = {
  
  /**
 * @description Retrieves a list of practices, optionally filtered by team.
 *
 * @tags practices
 * @name PracticesList
 * @summary List practices
 * @request GET:/practices
 */
practicesList: (query?: {
  /** Team UUID */
    team_id?: string,
  /** Page number */
    page?: number,
  /** Items per page (max 100) */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<(PracticeResponseDto)[], Record<string,any>>({
        path: `/practices`,
        method: 'GET',
        query: query,                                format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new practice session.
 *
 * @tags practices
 * @name PracticesCreate
 * @summary Create a practice
 * @request POST:/practices
 * @secure
 */
practicesCreate: (practice: PracticeRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/practices`,
        method: 'POST',
                body: practice,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Creates multiple recurring practices using recurrence rules.
 *
 * @tags practices
 * @name RecurringCreate
 * @summary Create recurring practices
 * @request POST:/practices/recurring
 * @secure
 */
recurringCreate: (recurrence: PracticeRecurrenceRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/practices/recurring`,
        method: 'POST',
                body: recurrence,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Fetches a single practice session using its UUID.
 *
 * @tags practices
 * @name PracticesDetail
 * @summary Get a practice by ID
 * @request GET:/practices/{id}
 */
practicesDetail: (id: string, params: RequestParams = {}) =>
    this.request<PracticeResponseDto, Record<string,any>>({
        path: `/practices/${id}`,
        method: 'GET',
                                        format: "json",        ...params,
    }),
  
  /**
 * @description Updates the details of a specific practice.
 *
 * @tags practices
 * @name PracticesUpdate
 * @summary Update a practice
 * @request PUT:/practices/{id}
 * @secure
 */
practicesUpdate: (id: string, practice: PracticeRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/practices/${id}`,
        method: 'PUT',
                body: practice,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * @description Deletes a specific practice session.
 *
 * @tags practices
 * @name PracticesDelete
 * @summary Delete a practice
 * @request DELETE:/practices/{id}
 * @secure
 */
practicesDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/practices/${id}`,
        method: 'DELETE',
                        secure: true,                        ...params,
    }),
    }
    programs = {
  
  /**
 * No description
 *
 * @tags programs
 * @name ProgramsList
 * @request GET:/programs
 */
programsList: (query?: {
  /** Program Type (practice, course, game, other, others, tournament, event, tryouts) */
    type?: string,

}, params: RequestParams = {}) =>
    this.request<(ProgramResponse)[], Record<string,any>>({
        path: `/programs`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags programs
 * @name ProgramsCreate
 * @request POST:/programs
 * @secure
 */
programsCreate: (program: ProgramRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/programs`,
        method: 'POST',
                body: program,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags programs
 * @name LevelsList
 * @request GET:/programs/levels
 */
levelsList: (params: RequestParams = {}) =>
    this.request<(ProgramLevelsResponse)[], Record<string,any>>({
        path: `/programs/levels`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags programs
 * @name ProgramsDetail
 * @request GET:/programs/{id}
 */
programsDetail: (id: string, params: RequestParams = {}) =>
    this.request<(ProgramResponse)[], Record<string,any>>({
        path: `/programs/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags programs
 * @name ProgramsUpdate
 * @request PUT:/programs/{id}
 */
programsUpdate: (id: string, program: ProgramRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/programs/${id}`,
        method: 'PUT',
                body: program,                type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags programs
 * @name ProgramsDelete
 * @request DELETE:/programs/{id}
 * @secure
 */
programsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/programs/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    ready = {
  
  /**
 * @description Returns whether the service is ready to accept traffic
 *
 * @tags health
 * @name ReadyList
 * @summary Readiness check endpoint
 * @request GET:/ready
 */
readyList: (params: RequestParams = {}) =>
    this.request<Record<string,string>, Record<string,string>>({
        path: `/ready`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    register = {
  
  /**
 * @description Registers a new athlete by verifying the Firebase token and creating an account based on the provided details.
 *
 * @tags registration
 * @name AthleteCreate
 * @summary Register a new athlete
 * @request POST:/register/athlete
 */
athleteCreate: (athlete: CustomerAthleteRegistrationRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/athlete`,
        method: 'POST',
                body: athlete,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Registers a new child account using the provided details and associates it with the parent based on the Firebase authentication token.
 *
 * @tags registration
 * @name ChildCreate
 * @summary Register a new child account and associate it with the parent
 * @request POST:/register/child
 */
childCreate: (customer: CustomerChildRegistrationRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/child`,
        method: 'POST',
                body: customer,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Registers a new parent by verifying the Firebase token and creating an account based on the provided details.
 *
 * @tags registration
 * @name ParentCreate
 * @summary Register a new parent
 * @request POST:/register/parent
 */
parentCreate: (parent: CustomerParentRegistrationRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/parent`,
        method: 'POST',
                body: parent,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new staff account in the system using the provided registration details.
 *
 * @tags registration
 * @name StaffCreate
 * @summary Register a new staff member
 * @request POST:/register/staff
 */
staffCreate: (staff: StaffRegistrationRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/staff`,
        method: 'POST',
                body: staff,                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Approves a pending staff member's account in the system
 *
 * @tags registration
 * @name StaffApproveCreate
 * @summary Approve a pending staff member
 * @request POST:/register/staff/approve/{id}
 * @secure
 */
staffApproveCreate: (staffId: string, id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/staff/approve/${id}`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags registration
 * @name StaffPendingList
 * @summary Get pending staff member details
 * @request GET:/register/staff/pending
 * @secure
 */
staffPendingList: (params: RequestParams = {}) =>
    this.request<StaffPendingStaffResponseDto, Record<string,any>>({
        path: `/register/staff/pending`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Deletes a pending staff member's application from the system
 *
 * @tags registration
 * @name StaffRejectDelete
 * @summary Delete/Reject a pending staff member
 * @request DELETE:/register/staff/reject/{id}
 * @secure
 */
staffRejectDelete: (staffId: string, id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/register/staff/reject/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    secure = {
  
  /**
 * No description
 *
 * @tags credits
 * @name CreditsList
 * @request GET:/secure/credits
 * @secure
 */
creditsList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/credits`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CreditsTransactionsList
 * @request GET:/secure/credits/transactions
 * @secure
 */
creditsTransactionsList: (query?: {
  /**
   * Number of items per page
   * @min 1
   * @max 100
   * @default 20
   */
    limit?: number,
  /**
   * Number of items to skip
   * @min 0
   * @default 0
   */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/credits/transactions`,
        method: 'GET',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags credits
 * @name CreditsWeeklyUsageList
 * @request GET:/secure/credits/weekly-usage
 * @secure
 */
creditsWeeklyUsageList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/credits/weekly-usage`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Permanently deletes the authenticated customer's account including all data from database, Firebase, and cancels Stripe subscriptions
 *
 * @tags customers
 * @name CustomersDeleteAccountDelete
 * @summary Delete customer account
 * @request DELETE:/secure/customers/delete-account
 * @secure
 */
customersDeleteAccountDelete: (confirmation: CustomerAccountDeletionRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/customers/delete-account`,
        method: 'DELETE',
                body: confirmation,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags customers
 * @name CustomersMembershipsList
 * @request GET:/secure/customers/memberships
 * @secure
 */
customersMembershipsList: (params: RequestParams = {}) =>
    this.request<(CustomerMembershipHistoryResponse)[], Record<string,any>>({
        path: `/secure/customers/memberships`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Recovers a soft-deleted account within the 30-day grace period
 *
 * @tags customers
 * @name CustomersRecoverAccountCreate
 * @summary Recover deleted account
 * @request POST:/secure/customers/recover-account
 * @secure
 */
customersRecoverAccountCreate: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/customers/recover-account`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags events
 * @name EventsList
 * @request GET:/secure/events
 * @secure
 */
eventsList: (query?: {
  /**
   * Number of results per page
   * @default 20
   */
    limit?: number,
  /**
   * Page number
   * @default 1
   */
    page?: number,
  /** Filter events after this date (YYYY-MM-DD) */
    after?: string,
  /** Filter events before this date (YYYY-MM-DD) */
    before?: string,
  /** Filter events by month (YYYY-MM) */
    month?: string,
  /** Filter events by day (YYYY-MM-DD) */
    day?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/events`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags games, games
 * @name GamesList
 * @request GET:/secure/games
 * @secure
 */
gamesList: (query?: {
  /** Filter by time: upcoming, past, or live */
    filter?: string,

}, params: RequestParams = {}) =>
    this.request<(GameResponseDto)[], Record<string,any>>({
        path: `/secure/games`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Register an Expo push token for receiving notifications
 *
 * @tags notifications
 * @name NotificationsRegisterCreate
 * @summary Register push notification token
 * @request POST:/secure/notifications/register
 * @secure
 */
notificationsRegisterCreate: (request: DtoRegisterPushTokenRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/notifications/register`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Send a push notification to all members of a specific team
 *
 * @tags notifications
 * @name NotificationsSendCreate
 * @summary Send team notification
 * @request POST:/secure/notifications/send
 * @secure
 */
notificationsSendCreate: (request: DtoSendNotificationRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/secure/notifications/send`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves a consolidated schedule of events, games, and practices based on user role and associations.
 *
 * @tags schedule
 * @name ScheduleList
 * @summary Get my schedule
 * @request GET:/secure/schedule
 * @secure
 */
scheduleList: (params: RequestParams = {}) =>
    this.request<ScheduleResponse, Record<string,any>>({
        path: `/secure/schedule`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves teams based on user role. Coaches see only teams they coach, admins see all teams.
 *
 * @tags teams
 * @name TeamsList
 * @summary Get my teams (role-based)
 * @request GET:/secure/teams
 * @secure
 */
teamsList: (params: RequestParams = {}) =>
    this.request<(TeamResponse)[], Record<string,any>>({
        path: `/secure/teams`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    staff = {
  
  /**
 * No description
 *
 * @tags staffs
 * @name ProfilePartialUpdate
 * @request PATCH:/staff/{id}/profile
 * @secure
 */
profilePartialUpdate: (id: string, update_body: StaffStaffProfileUpdateRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/staff/${id}/profile`,
        method: 'PATCH',
                body: update_body,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    staffs = {
  
  /**
 * No description
 *
 * @tags staffs
 * @name StaffsList
 * @request GET:/staffs
 */
staffsList: (query?: {
  /**
   * Role name to filter staff
   * @example ""Coach""
   */
    role?: string,

}, params: RequestParams = {}) =>
    this.request<(StaffResponseDto)[], Record<string,any>>({
        path: `/staffs`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves a paginated list of staff activity logs with optional filtering
 *
 * @tags staff_activity_logs
 * @name LogsList
 * @summary Get staff activity logs
 * @request GET:/staffs/logs
 */
logsList: (query?: {
  /**
   * Filter by staff member ID (UUID format)
   * @example ""550e8400-e29b-41d4-a716-446655440000""
   */
    staff_id?: string,
  /** Search term to filter activity descriptions (case-insensitive partial match) */
    search_description?: string,
  /**
   * Number of records to return (default: 10)
   * @example 10
   */
    limit?: number,
  /**
   * Number of records to skip for pagination (default: 0)
   * @example 0
   */
    offset?: number,

}, params: RequestParams = {}) =>
    this.request<(StaffActivityLogsStaffActivityLogResponse)[], Record<string,any>>({
        path: `/staffs/logs`,
        method: 'GET',
        query: query,                                format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags staffs
 * @name StaffsUpdate
 * @request PUT:/staffs/{id}
 * @secure
 */
staffsUpdate: (id: string, staff: StaffRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/staffs/${id}`,
        method: 'PUT',
                body: staff,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags staffs
 * @name StaffsDelete
 * @request DELETE:/staffs/{id}
 * @secure
 */
staffsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/staffs/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    subscriptions = {
  
  /**
 * @description Get all subscriptions for the authenticated customer
 *
 * @tags subscriptions
 * @name SubscriptionsList
 * @request GET:/subscriptions
 * @secure
 */
subscriptionsList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Create a Stripe Customer Portal session for subscription management
 *
 * @tags subscriptions
 * @name PortalCreate
 * @request POST:/subscriptions/portal
 * @secure
 */
portalCreate: (query: {
  /** Return URL after portal session */
    return_url: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions/portal`,
        method: 'POST',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get subscription details with ownership verification
 *
 * @tags subscriptions
 * @name SubscriptionsDetail
 * @request GET:/subscriptions/{id}
 * @secure
 */
subscriptionsDetail: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions/${id}`,
        method: 'GET',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Cancel a subscription at the end of the current billing period. Immediate cancellation is not allowed to protect both customer and business.
 *
 * @tags subscriptions
 * @name CancelCreate
 * @request POST:/subscriptions/{id}/cancel
 * @secure
 */
cancelCreate: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions/${id}/cancel`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Pause a subscription with optional resume date
 *
 * @tags subscriptions
 * @name PauseCreate
 * @request POST:/subscriptions/{id}/pause
 * @secure
 */
pauseCreate: (id: string, query?: {
  /** Resume date (RFC3339 format) */
    resume_at?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions/${id}/pause`,
        method: 'POST',
        query: query,                secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Resume a paused subscription
 *
 * @tags subscriptions
 * @name ResumeCreate
 * @request POST:/subscriptions/{id}/resume
 * @secure
 */
resumeCreate: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subscriptions/${id}/resume`,
        method: 'POST',
                        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    subsidies = {
  
  /**
 * @description Get list of subsidies with optional filters (admin only)
 *
 * @tags Subsidies - Admin
 * @name SubsidiesList
 * @summary List subsidies
 * @request GET:/subsidies
 * @secure
 */
subsidiesList: (query?: {
  /** Filter by customer ID */
    customer_id?: string,
  /** Filter by provider ID */
    provider_id?: string,
  /** Filter by status (pending, approved, active, depleted, expired, revoked) */
    status?: string,
  /**
   * Page number
   * @default 1
   */
    page?: number,
  /**
   * Items per page
   * @default 50
   */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Create a new subsidy for a customer (admin only)
 *
 * @tags Subsidies - Admin
 * @name SubsidiesCreate
 * @summary Create subsidy
 * @request POST:/subsidies
 * @secure
 */
subsidiesCreate: (subsidy: DtoCreateSubsidyRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies`,
        method: 'POST',
                body: subsidy,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get list of subsidies for the authenticated customer
 *
 * @tags Subsidies - Customer
 * @name GetSubsidies
 * @summary Get my subsidies
 * @request GET:/subsidies/me
 * @secure
 */
getSubsidies: (query?: {
  /**
   * Page number
   * @default 1
   */
    page?: number,
  /**
   * Items per page
   * @default 10
   */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/me`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get current subsidy balance for the authenticated customer
 *
 * @tags Subsidies - Customer
 * @name MeBalanceList
 * @summary Get my balance
 * @request GET:/subsidies/me/balance
 * @secure
 */
meBalanceList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/me/balance`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get subsidy usage history for the authenticated customer
 *
 * @tags Subsidies - Customer
 * @name MeUsageList
 * @summary Get my usage history
 * @request GET:/subsidies/me/usage
 * @secure
 */
meUsageList: (query?: {
  /**
   * Page number
   * @default 1
   */
    page?: number,
  /**
   * Items per page
   * @default 20
   */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/me/usage`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get list of all subsidy providers with optional filters (admin only)
 *
 * @tags Subsidies - Admin
 * @name ProvidersList
 * @summary List subsidy providers
 * @request GET:/subsidies/providers
 * @secure
 */
providersList: (query?: {
  /** Filter by active status */
    is_active?: boolean,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/providers`,
        method: 'GET',
        query: query,                secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Create a new subsidy provider organization (admin only)
 *
 * @tags Subsidies - Admin
 * @name ProvidersCreate
 * @summary Create subsidy provider
 * @request POST:/subsidies/providers
 * @secure
 */
providersCreate: (provider: DtoCreateProviderRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/providers`,
        method: 'POST',
                body: provider,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Get details of a specific subsidy provider (admin only)
 *
 * @tags Subsidies - Admin
 * @name ProvidersDetail
 * @summary Get subsidy provider
 * @request GET:/subsidies/providers/{id}
 * @secure
 */
providersDetail: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/providers/${id}`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get usage statistics for a specific provider (admin only)
 *
 * @tags Subsidies - Admin
 * @name ProvidersStatsList
 * @summary Get provider statistics
 * @request GET:/subsidies/providers/{id}/stats
 * @secure
 */
providersStatsList: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/providers/${id}/stats`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get overall subsidy statistics and reports (admin only)
 *
 * @tags Subsidies - Admin
 * @name SummaryList
 * @summary Get subsidy summary
 * @request GET:/subsidies/summary
 * @secure
 */
summaryList: (params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/summary`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Get details of a specific subsidy (admin only)
 *
 * @tags Subsidies - Admin
 * @name SubsidiesDetail
 * @summary Get subsidy
 * @request GET:/subsidies/{id}
 * @secure
 */
subsidiesDetail: (id: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/${id}`,
        method: 'GET',
                        secure: true,                format: "json",        ...params,
    }),
  
  /**
 * @description Deactivate/revoke a subsidy (admin only)
 *
 * @tags Subsidies - Admin
 * @name DeactivateCreate
 * @summary Deactivate subsidy
 * @request POST:/subsidies/{id}/deactivate
 * @secure
 */
deactivateCreate: (id: string, request: DtoDeactivateSubsidyRequest, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/subsidies/${id}/deactivate`,
        method: 'POST',
                body: request,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    teams = {
  
  /**
 * No description
 *
 * @tags teams
 * @name TeamsList
 * @request GET:/teams
 */
teamsList: (params: RequestParams = {}) =>
    this.request<(TeamResponse)[], Record<string,any>>({
        path: `/teams`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags teams
 * @name TeamsCreate
 * @request POST:/teams
 * @secure
 */
teamsCreate: (team: TeamRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/teams`,
        method: 'POST',
                body: team,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Retrieves all external teams (opponent teams). Useful for selecting opponents when creating games.
 *
 * @tags teams
 * @name ExternalList
 * @summary Get external teams
 * @request GET:/teams/external
 */
externalList: (params: RequestParams = {}) =>
    this.request<(TeamResponse)[], Record<string,any>>({
        path: `/teams/external`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Creates a new external team (opponent team not belonging to RISE). These teams are shared across all coaches.
 *
 * @tags teams
 * @name ExternalCreate
 * @summary Create external team
 * @request POST:/teams/external
 * @secure
 */
externalCreate: (team: TeamExternalTeamRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/teams/external`,
        method: 'POST',
                body: team,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * @description Searches for teams (both RISE and external) by name. Useful for autocomplete when creating games.
 *
 * @tags teams
 * @name SearchList
 * @summary Search teams
 * @request GET:/teams/search
 */
searchList: (query: {
  /** Search query */
    q: string,
  /** Max results (default 20, max 50) */
    limit?: number,

}, params: RequestParams = {}) =>
    this.request<(TeamResponse)[], Record<string,any>>({
        path: `/teams/search`,
        method: 'GET',
        query: query,                        type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags teams
 * @name TeamsDetail
 * @request GET:/teams/{id}
 */
teamsDetail: (id: string, params: RequestParams = {}) =>
    this.request<TeamResponse, Record<string,any>>({
        path: `/teams/${id}`,
        method: 'GET',
                                type: ContentType.Json,        format: "json",        ...params,
    }),
  
  /**
 * No description
 *
 * @tags teams
 * @name TeamsUpdate
 * @request PUT:/teams/{id}
 * @secure
 */
teamsUpdate: (id: string, team: TeamRequestDto, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/teams/${id}`,
        method: 'PUT',
                body: team,        secure: true,        type: ContentType.Json,                ...params,
    }),
  
  /**
 * No description
 *
 * @tags teams
 * @name TeamsDelete
 * @request DELETE:/teams/{id}
 * @secure
 */
teamsDelete: (id: string, params: RequestParams = {}) =>
    this.request<void, Record<string,any>>({
        path: `/teams/${id}`,
        method: 'DELETE',
                        secure: true,        type: ContentType.Json,                ...params,
    }),
    }
    upload = {
  
  /**
 * @description Accepts an image file and uploads it to Google Cloud Storage, returning the public URL
 *
 * @tags upload
 * @name ImageCreate
 * @summary Upload image to cloud storage
 * @request POST:/upload/image
 * @secure
 */
imageCreate: (data: {
  /** Image file to upload (jpg, jpeg, png, gif, webp) */
    image: File,

}, query?: {
  /**
   * Folder name in storage bucket
   * @default ""images""
   */
    folder?: string,
  /** Target user ID for admin uploads (admins only) */
    target_user_id?: string,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/upload/image`,
        method: 'POST',
        query: query,        body: data,        secure: true,        type: ContentType.FormData,        format: "json",        ...params,
    }),
  
  /**
 * @description Accepts an image file and uploads it to Google Cloud Storage in the programs folder, returning the public URL
 *
 * @tags upload
 * @name ProgramPhotoCreate
 * @summary Upload program photo to cloud storage
 * @request POST:/upload/program-photo
 * @secure
 */
programPhotoCreate: (query: {
  /** Program ID for which the photo is being uploaded */
    program_id: string,

}, data: {
  /** Image file to upload (jpg, jpeg, png, gif, webp) */
    image: File,

}, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/upload/program-photo`,
        method: 'POST',
        query: query,        body: data,        secure: true,        type: ContentType.FormData,        format: "json",        ...params,
    }),
    }
    users = {
  
  /**
 * No description
 *
 * @tags users
 * @name UsersUpdate
 * @request PUT:/users/{id}
 * @secure
 */
usersUpdate: (id: string, user: UserUpdateRequestDto, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/users/${id}`,
        method: 'PUT',
                body: user,        secure: true,        type: ContentType.Json,        format: "json",        ...params,
    }),
    }
    webhooks = {
  
  /**
 * @description - checkout.session.completed: Logs completed checkout sessions
 *
 * @tags payments
 * @name StripeCreate
 * @request POST:/webhooks/stripe
 */
stripeCreate: (request: string, params: RequestParams = {}) =>
    this.request<Record<string,any>, Record<string,any>>({
        path: `/webhooks/stripe`,
        method: 'POST',
                body: request,                type: ContentType.Json,        format: "json",        ...params,
    }),
    }
  }

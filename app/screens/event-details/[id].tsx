"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, usePathname, useRouter, useSegments, useNavigation } from "expo-router"
import dayjs from "dayjs"
import axios from "axios"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchEventById as fetchEventByIdRedux, selectDetailedEventById } from "@/store/slices/eventsSlice"
import { RootState } from "@/store"
import { FontAwesome5 } from "@expo/vector-icons"
import EventImageHeader from "@/components/events/EventImageHeader"
import BackButton from "@/components/buttons/BackButton"
import EventInfoRow from "@/components/events/EventInfoRow"
import { API_URL, getMembershipByCustomerId, getEventEnrollmentOptions, enrollEventWithCredits } from "@/utils/api"
import { setMembership } from "@/store/slices/membershipSlice"
import { COLORS } from "@/constants/colors"
import * as WebBrowser from 'expo-web-browser'
import { CalendarItem } from "@/types"
import { ErrorToast } from "@/components/auth/ErrorToast"

const { width } = Dimensions.get("window")

// Define interfaces for our data
interface Location {
  id: string
  name: string
  address: string
}

interface User {
  id: string
  first_name: string
  last_name: string
}

interface EventDetails {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  locationAddress: string
  image: string
  organizer: string
  category: string
  status: string
  capacity: number
}

interface ApiEventResponse {
  id: string
  name?: string
  description?: string
  type?: string
  status?: string // Add status field from API
  created_at?: string
  updated_at?: string
  // Add these only if they exist
  location?: Location
  created_by?: User
  start_at?: string
  end_at?: string
  capacity?: number
  registration_required?: boolean // Whether registration is required/allowed for this event
  // Practice-specific fields from /secure/events endpoint
  program?: {
    id: string
    name: string
    type?: string
    description?: string
    photo_url?: string
  }
  // Enrollment information
  customers?: Array<{
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string
    gender?: string
    has_cancelled_enrollment?: boolean
  }>
}

const EventDetails: React.FC = () => {
  const { id, type, source } = useLocalSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.data)
  const membershipData = useAppSelector((state) => state.membership.data)

  // Try to get cached event from Redux first
  const cachedEvent = useAppSelector((state) => selectDetailedEventById(state, id as string))
  const eventsState = useAppSelector((state) => state.events)
  
  // Get practices from Redux store
  const practicesItems = useAppSelector((state: RootState) => state.practices.items)
  const practicesById = useAppSelector((state: RootState) => state.practices.byId)
  
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [credits, setCredits] = useState<number>(0)
  const [creditsLoaded, setCreditsLoaded] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [enrollmentOptions, setEnrollmentOptions] = useState<any>(null)
  const [loadingEnrollmentOptions, setLoadingEnrollmentOptions] = useState(false)
  const [enrollmentOptionsLoaded, setEnrollmentOptionsLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [membershipLoaded, setMembershipLoaded] = useState(false)
  const [registrationRequired, setRegistrationRequired] = useState<boolean | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const paymentCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 🔍 Step 3: Log detailed router state when component mounts using useNavigation()
    const navState = navigation.getState();
    if (__DEV__) console.log(`[Event ${id}] 📍 Component MOUNTED - navigation snapshot`, {
      pathname,
      segments: segments.join("/") || "(root)",
      canGoBack: router.canGoBack?.() ?? null,
      navState: navState ? {
        type: navState.type,
        index: navState.index,
        routes: navState.routes?.map((r: any) => ({
          name: r.name,
          key: r.key,
          params: r.params,
        })),
        routeCount: navState.routes?.length,
        currentRoute: navState.routes?.[navState.index],
        hasEventDetailsInStack: navState.routes?.some((r: any) =>
          r.name?.includes('event-details') || r.key?.includes('event-details')
        ),
      } : "unavailable",
    })
    if (__DEV__) console.log(`[Event ${id}] 📍 Full navState:`, JSON.stringify(navState, null, 2));
  }, [id, pathname, segments, router, navigation])

  // Function to fetch user credits
  const fetchUserCredits = async (force = false) => {
    const startTime = Date.now()
    if (__DEV__) console.log(`⏱️ [Event ${id}] Starting fetchUserCredits...`)

    if (creditsLoaded && !force) {
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserCredits: Skipped (already loaded) - ${Date.now() - startTime}ms`)
      return
    }

    try {
      const token = userData?.token
      if (!token) {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserCredits: No token - ${Date.now() - startTime}ms`)
        return
      }

      const apiStartTime = Date.now()
      const response = await axios.get<{ credits?: number; customer_id?: string }>(`${API_URL}/secure/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const apiDuration = Date.now() - apiStartTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserCredits: API call completed - ${apiDuration}ms`)

      setCredits(response.data.credits || 0)
      setCreditsLoaded(true)

      const totalDuration = Date.now() - startTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserCredits: Completed - ${totalDuration}ms total`)
    } catch (error) {
      const totalDuration = Date.now() - startTime
      if (__DEV__) console.warn(`❌ [Event ${id}] fetchUserCredits: Error after ${totalDuration}ms`, error)
    }
  }

  // Function to fetch event enrollment options
  const fetchEnrollmentOptions = async (eventId: string) => {
    const startTime = Date.now()
    if (__DEV__) console.log(`⏱️ [Event ${id}] Starting fetchEnrollmentOptions for event ${eventId}...`)

    try {
      const token = userData?.token
      if (!token) {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEnrollmentOptions: No token - ${Date.now() - startTime}ms`)
        return
      }

      if (loadingEnrollmentOptions) {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEnrollmentOptions: Already loading, skipping - ${Date.now() - startTime}ms`)
        return
      }

      setLoadingEnrollmentOptions(true)

      const apiStartTime = Date.now()
      const options = await getEventEnrollmentOptions(eventId, token)
      const apiDuration = Date.now() - apiStartTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEnrollmentOptions: API call completed - ${apiDuration}ms`)

      setEnrollmentOptions(options)
      setEnrollmentOptionsLoaded(true)

      const totalDuration = Date.now() - startTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEnrollmentOptions: Completed - ${totalDuration}ms total`, options)
    } catch (error) {
      const totalDuration = Date.now() - startTime
      if (__DEV__) console.warn(`❌ [Event ${id}] fetchEnrollmentOptions: Error after ${totalDuration}ms`, error)
      setEnrollmentOptions(null)
      setEnrollmentOptionsLoaded(true) // Mark as loaded even on error so we know we tried
    } finally {
      setLoadingEnrollmentOptions(false)
    }
  }

  // Function to fetch user membership
  const fetchUserMembership = async () => {
    const startTime = Date.now()
    if (__DEV__) console.log(`⏱️ [Event ${id}] Starting fetchUserMembership...`)

    if (membershipLoaded) {
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: Skipped (already loaded) - ${Date.now() - startTime}ms`)
      return
    }

    try {
      if (!userData?.id) {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: No user ID - ${Date.now() - startTime}ms`)
        return
      }

      const apiStartTime = Date.now()
      const memberships = await getMembershipByCustomerId(userData.id)
      const apiDuration = Date.now() - apiStartTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: API call completed - ${apiDuration}ms`)

      if (memberships?.length > 0) {
        dispatch(setMembership(memberships[0]))
        setMembershipLoaded(true)
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: Found ${memberships.length} membership(s)`)
      } else {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: No memberships found`)
      }

      const totalDuration = Date.now() - startTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchUserMembership: Completed - ${totalDuration}ms total`)
    } catch (error) {
      const totalDuration = Date.now() - startTime
      if (__DEV__) console.warn(`❌ [Event ${id}] fetchUserMembership: Error after ${totalDuration}ms`, error)
    }
  }

  // Function to get practice data from Redux store
  const getPracticeDataFromStore = (practiceId: string): EventDetails | null => {
    // First try to get from byId mapping
    let practice: CalendarItem | undefined = practicesById[practiceId] as CalendarItem | undefined;
    
    // If not found, try to find in items array
    if (!practice) {
      practice = practicesItems.find(item => item.id === practiceId) || undefined
    }
    
    if (!practice) {
      return null
    }
    
    
    // Transform practice data to EventDetails format
    const eventDetails: EventDetails = {
      id: practice.id,
      title: practice.title || "Practice Session",
      description: practice.description || "Practice session focused on skill development and team coordination.",
      date: practice.date || dayjs().format("YYYY-MM-DD"),
      time: practice.time || "TBD",
      location: practice.location || "RISE Basketball Facility",
      locationAddress: "401, 33 St. NE, Calgary AB", // Default address since not in CalendarItem
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      organizer: "RISE Basketball",
      category: "Practice",
      status: "Upcoming",
      capacity: 0, // Default capacity since not in CalendarItem
    }
    
    return eventDetails
  }

  useEffect(() => {
    const pageLoadStart = Date.now()
    if (__DEV__) console.log(`⏱️ [Event ${id}] ========== PAGE LOAD STARTED ==========`)

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Only fetch essential event details on page load
    // Other data (credits, membership, enrollment options) will be loaded lazily
    // when user clicks the register button (see handleRegister function)
    fetchEventDetails().then(() => {
      const totalPageLoadTime = Date.now() - pageLoadStart
      if (__DEV__) console.log(`⏱️ [Event ${id}] ========== EVENT DETAILS LOADED - ${totalPageLoadTime}ms total ==========`)
    })
  }, [id])

  // Handle app state changes to detect return from Stripe checkout
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isCheckingPayment) {
        // User returned to app, start checking enrollment status
        startPaymentVerification()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription?.remove()
      if (paymentCheckInterval.current) {
        clearInterval(paymentCheckInterval.current)
      }
    }
  }, [isCheckingPayment])

  // Function to check enrollment status after fetch
  const checkEnrollmentStatus = async () => {
    try {
      const token = userData?.token
      if (!token) return false

      const cleanedId = cleanId(id as string)
      const response = await axios.get<ApiEventResponse>(`${API_URL}/events/${cleanedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const eventData: ApiEventResponse = response.data
      const isUserEnrolled = eventData.customers?.some(customer =>
        customer.id === userData.id || customer.email === userData.email
      ) || false

      if (isUserEnrolled) {
        setRegistered(true)
        // Also update the main event details to reflect enrollment
        await fetchEventDetails()
      }

      return isUserEnrolled
    } catch (error) {
      if (__DEV__) console.warn("Error checking enrollment status:", error)
      return false
    }
  }
  

  // Function to start payment verification polling
  const startPaymentVerification = async () => {
    // Clear any existing interval
    if (paymentCheckInterval.current) {
      clearInterval(paymentCheckInterval.current)
    }

    // Check immediately first - don't wait for the first interval
    try {
      const isEnrolled = await checkEnrollmentStatus()
      if (isEnrolled) {
        setIsCheckingPayment(false)
        Alert.alert(
          "Payment Successful!",
          "You've been successfully enrolled in this event.",
          [{ text: "OK" }]
        )
        return
      }
    } catch (error) {
      if (__DEV__) console.warn("Error checking enrollment status (initial):", error)
    }

    // If not enrolled yet, start polling with shorter intervals
    let attempts = 0
    const maxAttempts = 30 // Check for 1 minute (2s * 30 = 60s)

    paymentCheckInterval.current = setInterval(async () => {
      attempts++

      try {
        const isEnrolled = await checkEnrollmentStatus()

        // If user is now registered, stop checking
        if (isEnrolled) {
          setIsCheckingPayment(false)
          if (paymentCheckInterval.current) {
            clearInterval(paymentCheckInterval.current)
          }
          Alert.alert(
            "Payment Successful!",
            "You've been successfully enrolled in this event.",
            [{ text: "OK" }]
          )
          return
        }
      } catch (error) {
        if (__DEV__) console.warn("Error checking enrollment status:", error)
      }

      // Stop after max attempts
      if (attempts >= maxAttempts) {
        setIsCheckingPayment(false)
        if (paymentCheckInterval.current) {
          clearInterval(paymentCheckInterval.current)
        }
        Alert.alert(
          "Payment Status",
          "Please check your enrollment status manually or contact support if your payment was successful.",
          [{ text: "OK", onPress: () => fetchEventDetails() }]
        )
      }
    }, 2000) // Check every 2 seconds for faster feedback
  }

  // Function to clean the ID by removing any suffix (e.g., "-7")
  const cleanId = (id: string): string => {
    // UUID format is typically 36 characters with hyphens
    // If the ID is longer and has an extra hyphen, strip everything after the last hyphen
    if (id.length > 36 && id.lastIndexOf("-") > 23) {
      return id.substring(0, id.lastIndexOf("-"))
    }
    return id
  }

  const fetchEventDetails = async () => {
    const startTime = Date.now()
    if (__DEV__) console.log(`⏱️ [Event ${id}] Starting fetchEventDetails...`)

    setLoading(true)
    setError(null)

    try {
      // Check if event is already cached
      if (cachedEvent) {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Using cached event data`)

        // Safely read text fields
        const ce = cachedEvent as any;
        const ceDescription: string | undefined =
          typeof ce?.description === "string" ? ce.description : undefined;
        const ceName: string | undefined =
          typeof ce?.name === "string" ? ce.name : undefined;
        const ceType: string | undefined =
          typeof ce?.type === "string" ? ce.type : undefined;

        // Parse description for date/time info from cached event
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (typeof ceDescription === "string" && ceDescription.length > 0) {
          const parsed = parseEventFromDescription(ceDescription, new Date());
          startDate = parsed.startTime || parsed.eventDate;
          endDate = parsed.endTime;
        }

        const processedEvent: EventDetails = {
          id: cachedEvent.id,
          title: ceName || "RISE Event",
          description: ceDescription || "No description provided.",
          date: formatDateRange(startDate, endDate),
          time: formatTimeRange(startDate, endDate),
          location: "RISE Facility",
          locationAddress: "",
          image:
            "https://images.unsplash.com/photo-504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          organizer: "RISE Basketball",
          category: ceType || "Event",
          status: (ce?.status as string) || getEventStatus(startDate, endDate),
          capacity: (typeof ce?.capacity === "number" ? ce.capacity : 0),
        };

        setEvent(processedEvent);
        setLoading(false);
        // Cached events don't have registration_required, keep as null (button won't show)
        setRegistrationRequired(null);

        const totalDuration = Date.now() - startTime
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Completed (cached) - ${totalDuration}ms total`)
        return;
      }


      // Use the userData from component level
      if (!userData) {
        const errorDuration = Date.now() - startTime
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: No user data - ${errorDuration}ms`)
        setError("Authentication error. Please log in again.")
        setLoading(false)
        return
      }

      const token = userData.token

      if (!token) {
        const errorDuration = Date.now() - startTime
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: No token - ${errorDuration}ms`)
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      // Clean the ID to remove any suffix
      const cleanedId = cleanId(id as string)
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Cleaned ID = ${cleanedId}, type = ${type}`)

      // Skip Redux for events and use direct API call with public endpoint

      // Fallback to direct API call for programs or if Redux fails
      if (type === "practice") {
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Practice type - checking Redux store`)

        // For practices, try to get data from Redux store first

        // Try to get practice data from Redux store using the ID
        const practiceFromStore = getPracticeDataFromStore(cleanedId)
        if (practiceFromStore) {
          setEvent(practiceFromStore)
          setLoading(false)
          // Practices don't require registration button (filtered by title check anyway)
          setRegistrationRequired(false)
          const totalDuration = Date.now() - startTime
          if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Completed (practice from store) - ${totalDuration}ms total`)
          return
        }

        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Practice not in store, using mock data`)
        fallbackToMockData()
        const totalDuration = Date.now() - startTime
        if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Completed (mock data) - ${totalDuration}ms total`)
        return
      }

      // Use appropriate endpoint based on source
      let response;
      let url;

      // Always use public endpoint for event details - it contains full event info
      // The secure endpoint only returns enrolled events without full details
      url = `${API_URL}/events/${cleanedId}`;
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Starting API call to ${url}`)

      const apiStartTime = Date.now()
      response = await axios.get<ApiEventResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiDuration = Date.now() - apiStartTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: API call completed - ${apiDuration}ms`)
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Response size = ${JSON.stringify(response.data).length} bytes`)


      // Process the data from the API response
      const eventData: ApiEventResponse = response.data

      // First try to get dates from API fields
      let startDate = eventData.start_at ? parseDateTime(eventData.start_at) : null
      let endDate = eventData.end_at ? parseDateTime(eventData.end_at) : null
      
      // If no start_at/end_at, parse from description
      if (!startDate && eventData.description) {
        const fallbackDate = eventData.created_at ? parseDateTime(eventData.created_at) : new Date()
        const parsed = parseEventFromDescription(eventData.description, fallbackDate)
        startDate = parsed.startTime || parsed.eventDate
        endDate = parsed.endTime
        
      }
      
      // Final fallback to created_at if still no dates
      if (!startDate && eventData.created_at) {
        startDate = parseDateTime(eventData.created_at)
      }
      if (!endDate && eventData.created_at) {
        endDate = parseDateTime(eventData.created_at)
      }
    

      // Get the organizer name
      const organizerName = eventData.created_by
        ? `${eventData.created_by.first_name} ${eventData.created_by.last_name}`
        : "RISE Basketball"

      // Get image URL with fallback
      const imageUrl = eventData.program?.photo_url ||
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"

      if (__DEV__) console.log(`🖼️ [Event ${id}] Image URL:`, {
        hasPhotoUrl: !!eventData.program?.photo_url,
        photoUrl: eventData.program?.photo_url || 'none',
        usingFallback: !eventData.program?.photo_url,
        finalUrl: imageUrl.substring(0, 100) + '...'
      })

      // Transform API data to our EventDetails format
      const processedEvent: EventDetails = {
        id: eventData.id,
        title: eventData.name || eventData.program?.name || (type === "practice" ? "Practice Session" : "RISE Event"),
        description: eventData.program?.description || eventData.description || (type === "practice" ? `${eventData.program?.name || "Practice"} session` : "No description provided."),
        date: formatDateRange(startDate, endDate),
        time: formatTimeRange(startDate, endDate),
        location: eventData.location?.name || "RISE Facility",
        locationAddress: eventData.location?.address || "",
        image: imageUrl,
        organizer: organizerName,
        category: eventData.type || "Event",
        status: eventData.status || getEventStatus(startDate, endDate), // Prioritize API status
        capacity: eventData.capacity || 0,
      }

      setEvent(processedEvent)

      // Check if user is already enrolled by looking in customers array
      const isUserEnrolled = eventData.customers?.some(customer =>
        customer.id === userData.id || customer.email === userData.email
      ) || false

      if (__DEV__) console.log("🔍 Event Details Debug:", {
        eventId: processedEvent.id,
        title: processedEvent.title,
        includesPractice: processedEvent.title.toLowerCase().includes('practice'),
        status: processedEvent.status,
        isUserEnrolled: isUserEnrolled,
        willShowRegisterButton: !processedEvent.title.toLowerCase().includes('practice')
      })

      setRegistered(isUserEnrolled)

      // Save registration_required from API response
      setRegistrationRequired(eventData.registration_required ?? null)

      // Fetch enrollment options to determine if registration is available (for non-practice events)
      if (!processedEvent.title.toLowerCase().includes('practice')) {
        fetchEnrollmentOptions(cleanedId)
      }

      const totalDuration = Date.now() - startTime
      if (__DEV__) console.log(`⏱️ [Event ${id}] fetchEventDetails: Completed successfully - ${totalDuration}ms total`)
    } catch (err: any) {
      const errorDuration = Date.now() - startTime
      if (__DEV__) console.warn(`❌ [Event ${id}] fetchEventDetails: Error after ${errorDuration}ms`, err.response?.data || err.message)
      setError("Failed to load event details. Please try again.")

      // Use mock data as fallback
      fallbackToMockData()
    } finally {
      setLoading(false)
    }
  }

  // Parse date time string from API
  const parseDateTime = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null

    try {
      // First try parsing as-is (handles ISO 8601 format like "2025-12-19T09:00:00-07:00")
      let parsedDate = new Date(dateTimeStr)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }

      // Handle the double timezone format: "2025-09-05 17:30:00 -0600 -0600"
      // Remove the duplicate timezone and convert to ISO format
      let cleanedDateStr = dateTimeStr.replace(/(-\d{4})\s+(-\d{4})$/, '$1')

      // Convert "2025-09-05 17:30:00 -0600" to ISO format "2025-09-05T17:30:00-06:00"
      cleanedDateStr = cleanedDateStr.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(-\d{2})(\d{2})/, '$1T$2$3:$4')

      parsedDate = new Date(cleanedDateStr)
      if (isNaN(parsedDate.getTime())) {
        return null
      }

      return parsedDate
    } catch (error) {
      return null
    }
  }

  // Extract event details from description text
  const parseEventFromDescription = (description: string, fallbackDate: Date | null) => {
    // Extract date - look for patterns like "September 5", "Sept 5", etc.
    const dateMatch = description.match(/(?:on\s+)?(\w+(?:ember|ary|ch|il|ay|ust|ober|vember|cember)?\s+\d{1,2})/i)
    let eventDate = fallbackDate
    
    if (dateMatch) {
      try {
        // Try to parse the date with current year
        const dateStr = `${dateMatch[1]} ${new Date().getFullYear()}`
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed
        }
      } catch (e) {
      }
    } else {
    }

    // Extract time range - look for patterns like "7:30-9:30pm", "5:30-7:30pm", "from 7:30-9:30pm"
    const timeMatch = description.match(/(?:from\s+)?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(pm|am)?/i)
    let startTime = null
    let endTime = null
    
    if (timeMatch && eventDate) {
      try {
        const startTimeStr = timeMatch[1]
        const endTimeStr = timeMatch[2] 
        const period = timeMatch[3]?.toLowerCase() || 'pm' // Default to PM for tryouts
        
        // Parse start time
        const [startHour, startMin] = startTimeStr.split(':').map(Number)
        let adjustedStartHour = startHour
        if (period === 'pm' && startHour < 12) adjustedStartHour += 12
        if (period === 'am' && startHour === 12) adjustedStartHour = 0
        
        startTime = new Date(eventDate)
        startTime.setHours(adjustedStartHour, startMin, 0, 0)
        
        // Parse end time  
        const [endHour, endMin] = endTimeStr.split(':').map(Number)
        let adjustedEndHour = endHour
        if (period === 'pm' && endHour < 12) adjustedEndHour += 12
        if (period === 'am' && endHour === 12) adjustedEndHour = 0
        
        endTime = new Date(eventDate)
        endTime.setHours(adjustedEndHour, endMin, 0, 0)
        
      } catch (e) {
      }
    }
    
    return { eventDate, startTime, endTime }
  }
  

  // Format time range from start and end dates
  const formatTimeRange = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate) return "TBD"

    const startTime = formatTime(startDate)

    if (!endDate) return startTime

    const endTime = formatTime(endDate)
    return `${startTime} - ${endTime}`
  }

  // Format time to 12-hour format
  const formatTime = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const ampm = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  // Format date range for multi-day events
  const formatDateRange = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate) return dayjs().format("YYYY-MM-DD")

    const start = dayjs(startDate)

    if (!endDate) return start.format("YYYY-MM-DD")

    const end = dayjs(endDate)

    // Check if same day
    if (start.isSame(end, 'day')) {
      return start.format("YYYY-MM-DD")
    }

    // Multi-day event - return range format
    // Format: "Dec 19 - Dec 21, 2025"
    return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`
  }

  // Get event title based on available data
  const getEventTitle = (data: ApiEventResponse, eventType: string): string => {
    // For now, we'll use a generic title since the API response doesn't include a title
    return eventType === "practice"
      ? "Basketball Practice Session"
      : eventType === "course"
        ? "Basketball Skills Course"
        : "Basketball Event"
  }

  // Get event description based on available data
  const getEventDescription = (data: ApiEventResponse, eventType: string): string => {
    // For now, we'll use a generic description since the API response doesn't include a description
    if (eventType === "practice") {
      return "Join us for this practice session focused on fundamentals and team play. Please arrive 15 minutes early and bring appropriate gear."
    } else if (eventType === "course") {
      return "This comprehensive course is designed to help players of all levels improve their basketball skills through structured training and personalized feedback."
    } else {
      return "Join us for our basketball event featuring teams from across the region. Compete for prizes and recognition!"
    }
  }

  // Get category from event type
  const getCategoryFromType = (eventType: string): string => {
    switch (eventType) {
      case "practice":
        return "Practice"
      case "course":
        return "Course"
      case "game":
      case "match":
        return "Game"
      default:
        return "Event"
    }
  }

  // Determine event status based on start and end dates - returns standardized status values
  const getEventStatus = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate) return "Upcoming"

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

    if (endDate && now > endDate) return "Completed"
    if (startDay.getTime() === today.getTime()) return "Today"
    if (startDate <= now && (!endDate || now <= endDate)) return "In Progress"
    return "Upcoming"
  }

  // Fallback to mock data if API fails
  const fallbackToMockData = () => {

    let title, description, category

    switch (type) {
      case "practice":
        title = "Basketball Practice Session"
        description =
          "Join us for this practice session focused on fundamentals and team play. Please arrive 15 minutes early and bring appropriate gear."
        category = "Practice"
        break
      case "course":
        title = "Basketball Skills Course"
        description =
          "This comprehensive course is designed to help players of all levels improve their basketball skills through structured training and personalized feedback."
        category = "Course"
        break
      default:
        title = "Summer Basketball Tournament"
        description =
          "Join us for our basketball event featuring teams from across the region. Compete for prizes and recognition!"
        category = "Tournament"
    }

    const mockEvent: EventDetails = {
      id: id as string,
      title,
      description,
      date: dayjs().add(3, "day").format("YYYY-MM-DD"),
      time: "9:00 AM - 6:00 PM",
      location: "Main Arena, RISE Facility",
      locationAddress: "401, 33 St. NE, Calgary AB",
      image:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      organizer: "RISE Basketball",
      category,
      status: "Upcoming",
      capacity: 100,
    }

    setEvent(mockEvent)
    // Mock/fallback events should not show registration button
    setRegistrationRequired(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
      case "scheduled":
        return COLORS.primary
      case "today":
      case "in progress":
      case "in_progress":
        return COLORS.success
      case "completed":
      case "past":
        return COLORS.textSecondary
      case "canceled":
        return COLORS.textSecondary
      default:
        return COLORS.primary
    }
  }

  const handleShare = async () => {
    if (!event) return

    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${dayjs(event.date).format("MMMM D, YYYY")} at ${event.location}. ${event.description}`,
        title: event.title,
      })
    } catch (error) {
      if (__DEV__) console.warn("Error sharing event:", error)
    }
  }

  // Enhanced enrollment function with robust error handling
  const enrollInEvent = async (paymentMethod: 'stripe' | 'credits' = 'stripe') => {
    if (!event || !userData?.token) return

    if (event.status.toLowerCase() === "completed" || event.status.toLowerCase() === "past") {
      setErrorMessage("This event has already ended.")
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    // Clear any previous error messages
    setErrorMessage(null)
    setEnrolling(true)

    try {
      // Use credit-specific API function for credit payments
      if (paymentMethod === 'credits') {
        const data = await enrollEventWithCredits(event.id, userData.token)

        // Credit payment successful
        setRegistered(true)
        Alert.alert(
          "Registration Successful!",
          data.message || "You've been successfully enrolled using credits.",
          [{ text: "OK", onPress: () => fetchEventDetails() }]
        )
        // Refresh credit balance after successful enrollment
        fetchUserCredits(true)
        setShowPaymentOptions(false)
      } else {
        // Stripe or free enrollment - use enhanced endpoint
        const response = await fetch(
          `${API_URL}/checkout/events/${event.id}/enhanced`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payment_method: paymentMethod })
          }
        )

        const data = await response.json()

        if (response.ok) {
          if (data.payment_link || data.payment_url) {
            // Outcome 2: Stripe payment required
            const paymentUrl = data.payment_link || data.payment_url

            // Show warning dialog before opening payment
            Alert.alert(
              "⚠️ Complete Your Payment",
              "You will now be redirected to complete your payment.\n\n" +
              "IMPORTANT: Please complete the payment before closing the browser. " +
              "Closing without paying may result in issues with your registration.\n\n" +
              "Do not close the payment page until you see a confirmation.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    setEnrolling(false)
                    setShowPaymentOptions(false)
                  }
                },
                {
                  text: "Continue to Payment",
                  style: "default",
                  onPress: async () => {
                    setIsCheckingPayment(true)
                    // Open browser and wait for it to close
                    await WebBrowser.openBrowserAsync(paymentUrl)
                    // Browser closed - start verification immediately
                    startPaymentVerification()
                  }
                }
              ]
            )
            // Don't show alert immediately - let app state handling take care of verification
          } else {
            // Outcome 1: Free enrollment successful
            setRegistered(true)
            Alert.alert(
              "Registration Successful!",
              data.message || "You've been successfully enrolled in this event.",
              [{ text: "OK", onPress: () => fetchEventDetails() }]
            )
          }
          setShowPaymentOptions(false)
        } else {
          // Handle API errors based on status code
          const errorMsg = data?.error?.message || data?.message || "Registration failed. Please try again."

          if (response.status >= 500) {
            // Server error - show friendly message
            setErrorMessage("An unexpected server error occurred. Please try again later.")
          } else if (response.status === 400) {
            // Client error - show specific message
            setErrorMessage(errorMsg)
          } else {
            // Other errors
            setErrorMessage("Registration failed. Please try again.")
          }

          // Auto-dismiss error after 5 seconds
          setTimeout(() => setErrorMessage(null), 5000)
        }
      }
    } catch (error: any) {
      if (__DEV__) console.warn("Enrollment error:", error)

      // Distinguish between different error types
      if (error.response) {
        // Server responded with error status
        const statusCode = error.response.status
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message

        if (statusCode >= 500) {
          // Server error (500, 502, 503, etc.)
          setErrorMessage("An unexpected server error occurred. Please try again later.")
        } else if (statusCode === 429) {
          // Too many requests - rate limiting
          setErrorMessage("Too many requests. Please wait a moment and try again.")
        } else if (statusCode === 404) {
          // Resource not found - show specific backend message
          setErrorMessage(errorMsg || "This event is not available for enrollment.")
        } else if (statusCode === 400) {
          // Bad request - show specific error message from backend
          // Special handling for common backend error messages
          if (errorMsg?.toLowerCase().includes('capacity')) {
            setErrorMessage("This event is not properly configured. Please contact support or try a different event.")
          } else if (errorMsg?.toLowerCase().includes('credit')) {
            setErrorMessage(errorMsg) // Show credit-specific errors as-is
          } else {
            setErrorMessage(errorMsg || "Invalid enrollment request. Please try again.")
          }
        } else if (statusCode === 401 || statusCode === 403) {
          // Authentication/Authorization error
          setErrorMessage("Authentication failed. Please log in again.")
        } else {
          // Other client errors (4xx)
          setErrorMessage(errorMsg || "Registration failed. Please try again.")
        }
      } else if (error.request) {
        // Network error - no response received
        setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.")
      } else {
        // Other errors (e.g., configuration errors)
        setErrorMessage("An unexpected error occurred. Please try again.")
      }

      // Auto-dismiss error after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setEnrolling(false)
    }
  }

  const handleRegister = () => {
    if (!event) return

    if (registered) {
      // User is already enrolled - show confirmation message
      Alert.alert(
        "Already Enrolled",
        "You are already registered for this event. We look forward to seeing you there!",
        [{ text: "OK" }]
      )
      return
    }

    if (!creditsLoaded) {
      fetchUserCredits()
    }

    if (!membershipLoaded) {
      fetchUserMembership()
    }

    if (event?.id && !enrollmentOptions) {
      const cleanedId = cleanId(event.id)
      fetchEnrollmentOptions(cleanedId)
    }

    // Show payment options if event might require payment
    setShowPaymentOptions(true)
  }

  const handleRetry = () => {
    fetchEventDetails()
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    )
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar translucent style="light" />
        <Text style={styles.errorText}>
          {error?.includes("Event not found")
            ? "This item doesn't have detailed information available.\nTry booking through the main service pages."
            : error || "Unable to load details"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: COLORS.primary, marginTop: 10 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.retryButtonText, { color: COLORS.background }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusColor = getStatusColor(event.status)
  const isPastEvent = event.status.toLowerCase() === "completed" || event.status.toLowerCase() === "past"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent style="light" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Event Image Header */}
          <EventImageHeader image={event.image} />
          {/* Back Button Container */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{event.status}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>

            <View style={styles.infoSection}>
              <EventInfoRow
                icon="calendar"
                text={event.date.includes('-') && event.date.includes(',')
                  ? event.date  // Already formatted range like "Dec 19 - Dec 21, 2025"
                  : dayjs(event.date).format("dddd, MMMM D, YYYY")  // Single date
                }
              />
              <EventInfoRow icon="clock" text={event.time} />
              <EventInfoRow
                icon="map-marker-alt"
                text={event.location}
                subText={event.locationAddress ? event.locationAddress : undefined}
              />
              <EventInfoRow icon="user" text={`Organized by: ${event.organizer}`} />
              {event.capacity > 0 && !event.title.toLowerCase().includes('practice') && <EventInfoRow icon="users" text={`Capacity: ${event.capacity} participants`} />}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>About {event.category}</Text>
            <Text style={styles.description}>{event.description}</Text>


            {/* Spacer for bottom buttons */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <FontAwesome5 name="share-alt" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Show "Open to All" message for events that don't require registration */}
          {!event.title.toLowerCase().includes('practice') &&
           registrationRequired === false && (
            <View style={styles.noRegistrationBadge}>
              <FontAwesome5 name="users" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.noRegistrationText}>
                {isPastEvent ? "Event Ended" : "Open to All - Come Watch!"}
              </Text>
            </View>
          )}

          {/* Only show register button if:
              1. Not a practice
              2. registration_required is true (from API)
              3. Enrollment options loaded
              4. Registration is available (can_enroll_free OR credit_cost > 0 OR stripe_price_id OR membership_plan_id)
          */}
          {!event.title.toLowerCase().includes('practice') &&
           registrationRequired === true &&
           enrollmentOptionsLoaded &&
           enrollmentOptions &&
           (enrollmentOptions.can_enroll_free || enrollmentOptions.credit_cost > 0 || enrollmentOptions.stripe_price_id || enrollmentOptions.membership_plan_id) && (
            <TouchableOpacity
              style={[styles.registerButton, registered && styles.registeredButton, isPastEvent && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isPastEvent || enrolling || isCheckingPayment}
            >
              {enrolling || isCheckingPayment ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator color="#000000" />
                  <Text style={styles.loadingButtonText}>
                    {isCheckingPayment ? "Verifying Payment..." : "Processing..."}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.registerButtonText,
                    registered && styles.registeredButtonText,
                    isPastEvent && styles.disabledButtonText,
                  ]}
                >
                  {isPastEvent ? "Event Ended" : registered ? "You're Already Enrolled" : "Register for Event"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enroll in Event</Text>
            <Text style={styles.modalSubtitle}>Choose your payment method</Text>

            {/* Display Enrollment Options Info */}
            {loadingEnrollmentOptions ? (
              <View style={styles.loadingOptionContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingOptionText}>Loading options...</Text>
              </View>
            ) : enrollmentOptions ? (
              <View style={styles.enrollmentInfoContainer}>
                {enrollmentOptions.can_enroll_free && (
                  <Text style={styles.enrollmentInfoText}>✓ Free enrollment available</Text>
                )}
                {enrollmentOptions.credit_cost > 0 && (
                  <Text style={styles.enrollmentInfoText}>
                    Credit cost: {enrollmentOptions.credit_cost} credits
                  </Text>
                )}
                <Text style={styles.enrollmentInfoText}>
                  Your balance: {credits} credits
                </Text>
              </View>
            ) : null}

            {/* Stripe Payment Option (Default) */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => enrollInEvent('stripe')}
              disabled={enrolling}
            >
              <FontAwesome5
                name={enrollmentOptions?.can_enroll_free ? "check-circle" : "credit-card"}
                size={20}
                color={COLORS.primary}
              />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>
                  {enrollmentOptions?.can_enroll_free
                    ? "Enroll for Free"
                    : "Enroll & Pay"}
                </Text>
                <Text style={styles.paymentOptionSubtitle}>
                  {enrollmentOptions?.can_enroll_free
                    ? (enrollmentOptions?.membership_plan_id && membershipData?.membership_plan_id === enrollmentOptions?.membership_plan_id
                        ? "Included with your membership"
                        : "No payment required")
                    : "Pay with card"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Credits Option - Show if enrollment options indicate credit payment is possible */}
            {enrollmentOptions && enrollmentOptions.credit_cost > 0 && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  !enrollmentOptions.has_sufficient_credits && styles.disabledPaymentOption
                ]}
                onPress={() => enrollInEvent('credits')}
                disabled={enrolling || !enrollmentOptions.has_sufficient_credits}
              >
                <FontAwesome5
                  name="star"
                  size={20}
                  color={enrollmentOptions.has_sufficient_credits ? COLORS.primary : COLORS.textSecondary}
                />
                <View style={styles.paymentOptionText}>
                  <Text style={[
                    styles.paymentOptionTitle,
                    !enrollmentOptions.has_sufficient_credits && styles.disabledPaymentOptionText
                  ]}>
                    Use Credits ({enrollmentOptions.credit_cost} credits)
                  </Text>
                  <Text style={[
                    styles.paymentOptionSubtitle,
                    !enrollmentOptions.has_sufficient_credits && styles.insufficientCreditsText
                  ]}>
                    {enrollmentOptions.has_sufficient_credits
                      ? `Balance: ${credits} credits`
                      : `Insufficient credits (need ${enrollmentOptions.credit_cost}, have ${credits})`}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaymentOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error Toast */}
      {errorMessage && <ErrorToast message={errorMessage} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    position: "absolute",
    top: 100,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  additionalInfo: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.background}E6`,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  registeredButton: {
    backgroundColor: `${COLORS.primary}30`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.card,
  },
  registerButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  registeredButtonText: {
    color: COLORS.primary,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: width - 40,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    color: "#000000",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  loadingOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  loadingOptionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  enrollmentInfoContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  enrollmentInfoText: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 4,
  },
  disabledPaymentOption: {
    opacity: 0.5,
  },
  disabledPaymentOptionText: {
    color: COLORS.textSecondary,
  },
  insufficientCreditsText: {
    color: '#FF5252',
  },
  noRegistrationBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  noRegistrationText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
})

export default EventDetails

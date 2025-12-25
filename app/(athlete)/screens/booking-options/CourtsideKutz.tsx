import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { FontAwesome6 } from "@expo/vector-icons"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import * as Haptics from "expo-haptics"
import { useAppSelector } from "@/store/hooks"
import images from "@/constants/images"
import { resolveImageSource } from "@/utils/imageSource"

import CalendarCard from "@/components/calendar/CalendarCard"
import BackButton from "@/components/buttons/BackButton"
import { getHaircutAndBarberServices, createHaircutBooking, getBarberAvailability } from "@/utils/api"
import { useAuth } from "@/utils/auth"

dayjs.extend(utc)
dayjs.extend(timezone)

const BOOKING_TIMEZONE = "America/Edmonton"

// Define types for our data
interface Barber {
  id: string
  name: string
  image: string
  rating: number
  specialties: string[]
  availability: string[]
}

interface Service {
  id: string
  name: string
  icon: string
  price: number
  duration: number
  description: string
}



const BarberBookingScreen = () => {
  const insets = useSafeAreaInsets()
  // State variables
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day').format("YYYY-MM-DD"))
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  
  // Real data state
  const [barbersData, setBarbersData] = useState<Barber[]>([])
  const [servicesData, setServicesData] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // API-based time slots state
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isTimeSlotsLoading, setTimeSlotsLoading] = useState<boolean>(false)
  const [showLoadingIndicator, setShowLoadingIndicator] = useState<boolean>(false)
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  
  // Get user token from Redux store
  const user = useAppSelector((state) => state.user.data)
  
  // Get auth functions
  const { forceReLogin } = useAuth()

  // Get specific error message based on error type
  const getErrorMessage = (error: any): string => {
    // Network connectivity issues
    if (!navigator.onLine) {
      return "Network connection lost. Please check your internet connection and try again."
    }

    // API response errors
    if (error?.response?.status) {
      switch (error.response.status) {
        case 401:
          return "Authentication expired. Please log in again to continue."
        case 403:
          return "Access denied. Please check your account permissions."
        case 404:
          return "Barber availability service not found. Please contact support."
        case 429:
          return "Too many requests. Please wait a moment and try again."
        case 500:
        case 502:
        case 503:
          return "Server temporarily unavailable. Please try again in a few minutes."
        case 504:
          return "Request timeout. Please check your connection and try again."
        default:
          return `Service error (${error.response.status}). Please try again or contact support.`
      }
    }

    // Network timeout or connection errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return "Network connection problem. Please check your internet and try again."
    }

    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return "Request timed out. Please check your connection and try again."
    }

    // Generic fallback
    return "Unable to load available times. Please try again or contact support if the problem persists."
  }

  // Fetch available time slots from API
  const fetchAvailableTimeSlots = useCallback(async (barberId: string, date: string, serviceDuration: number) => {
    if (!barberId || !date || !serviceDuration || !user?.token) {
      setAvailableTimes([])
      return
    }

    try {
      setTimeSlotsLoading(true)
      setTimeSlotsError(null)

      // Add a debounced loading indicator to prevent flicker for fast requests
      const loadingTimeout = setTimeout(() => {
        setShowLoadingIndicator(true)
      }, 300) // Show loading indicator only if request takes longer than 300ms

      const times = await getBarberAvailability(barberId, date, serviceDuration, user.token)

      // Clear the timeout if request completes quickly
      clearTimeout(loadingTimeout)

      setAvailableTimes(times)
      setTimeSlotsLoading(false)
      setShowLoadingIndicator(false)
    } catch (error) {
      console.error("❌ Error fetching available time slots:", error)
      const errorMessage = getErrorMessage(error)
      setTimeSlotsError(errorMessage)
      setAvailableTimes([])
      setTimeSlotsLoading(false)
      setShowLoadingIndicator(false)
    }
  }, [user?.token])

  // Fetch real data from API
  useEffect(() => {
    const fetchHaircutData = async () => {
      try {
        setIsLoading(true)
        setApiError(null)
        
        const data = await getHaircutAndBarberServices()
        if (Array.isArray(data) && data.length > 0) {
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          const barbersMap = new Map<string, Barber>()
          const servicesMap = new Map<string, Service>()

          data.forEach((item: any, index: number) => {
            // De-duplicate barbers with stricter validation
            const barberId = item.barber_id?.toString()
            const barberName = item.barber_name?.trim()
            
            if (barberId && barberName && !barbersMap.has(barberId)) {
              barbersMap.set(barberId, {
                id: barberId,
                name: barberName,
                image: item.barber_image || "https://images.squarespace-cdn.com/content/v1/5c4d7e227e3c3a6ec70a5ac7/1596359610389-QDVB9CXJRSWGSPPNUES6/IMG_8599.jpg",
                rating: item.rating || 4.5,
                specialties: Array.isArray(item.specialties) ? item.specialties : ["General Services"],
                // Corrected fallback availability to include half-hour slots
                availability: Array.isArray(item.availability) && item.availability.length > 0 
                  ? item.availability 
                  : [
                      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
                      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"
                    ],
              })
            } else if (!barberId) {
            } else if (!barberName) {
            } else {
            }

            // De-duplicate services - using haircut_id and haircut_name from API
            const serviceId = item.haircut_id?.toString()
            const serviceName = item.haircut_name?.trim()
            
            if (serviceId && serviceName && !servicesMap.has(serviceId)) {
              servicesMap.set(serviceId, {
                id: serviceId,
                name: serviceName,
                icon: item.icon || "scissors",
                price: typeof item.price === 'number' ? item.price : 25,
                duration: typeof item.duration === 'number' ? item.duration : 30,
                description: item.description?.trim() || "Professional service",
              })
            } else if (!serviceId) {
            } else if (!serviceName) {
            } else {
            }
          })

          const uniqueBarbers = Array.from(barbersMap.values())
          const uniqueServices = Array.from(servicesMap.values())
          

          setBarbersData(uniqueBarbers)
          setServicesData(uniqueServices)

        } else {
          // No data from API - show empty state
          setBarbersData([])
          setServicesData([])
        }
      } catch (error) {
        console.error("❌ Error fetching haircut data:", error)
        setApiError("Failed to load barber services. Please try again later.")
        // Show empty state on error
        setBarbersData([])
        setServicesData([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHaircutData()
  }, [])

  // Fetch time slots when barber, date, or service changes, but only on the scheduling step
  useEffect(() => {
    if (selectedBarber && selectedDate && selectedService && currentStep === 2) {
      fetchAvailableTimeSlots(selectedBarber.id, selectedDate, selectedService.duration)
    } else {
      // Clear available times if not on the right step or dependencies are missing
      setAvailableTimes([])
    }
  }, [selectedBarber, selectedDate, selectedService, currentStep])

  // Reset time selection only when barber, date, or service changes (not when step changes)
  useEffect(() => {
    setSelectedTime(null)
  }, [selectedBarber, selectedDate, selectedService])

  // Handle date selection
  const handleDateSelect = (day: { dateString: string }) => {
    // Prevent selecting past dates
    const today = new Date().toISOString().split('T')[0]
    if (day.dateString < today) {
      return // Don't allow past date selection
    }

    setSelectedDate(day.dateString)
    // Reset time selection when date changes
    setSelectedTime(null)
  }

  // Handle barber selection
  const handleBarberSelect = (barber: Barber) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedBarber(barber)
  }

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedService(service)
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedTime(time)
  }

  // Toggle modal with animation
  const toggleModal = (show: boolean) => {
    if (show) {
      setModalVisible(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 40,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false)
        if (bookingSuccess) {
          // Reset form after successful booking
          setSelectedBarber(null)
          setSelectedService(null)
          setSelectedTime(null)
          setCustomerName("")
          setCustomerPhone("")
          setCurrentStep(1)
          setBookingSuccess(false)
        }
      })
    }
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedService || !selectedTime || !selectedDate || !user?.token) {
      console.error("❌ Missing required data for booking", {
        selectedBarber: !!selectedBarber,
        selectedService: !!selectedService,
        selectedTime: !!selectedTime,
        selectedDate: !!selectedDate,
        userToken: !!user?.token
      })
      return
    }

    setIsBooking(true)

    try {
      const parseTimeToMinutes = (raw: string): number | null => {
        if (!raw) return null
        const normalized = raw.trim().toUpperCase().replace(/\s+/g, " ")

        const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/)
        if (match12) {
          let hour = parseInt(match12[1], 10)
          const minute = parseInt(match12[2], 10)
          const period = match12[3]
          if (Number.isNaN(hour) || Number.isNaN(minute)) return null
          if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null
          if (period === "AM" && hour === 12) {
            hour = 0
          } else if (period === "PM" && hour !== 12) {
            hour += 12
          }
          return hour * 60 + minute
        }

        const match24 = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
        if (match24) {
          const hour = parseInt(match24[1], 10)
          const minute = parseInt(match24[2], 10)
          if (Number.isNaN(hour) || Number.isNaN(minute)) return null
          if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
          return hour * 60 + minute
        }

        return null
      }

      const buildDateTimeInZone = (dateValue: string, minutesFromMidnight: number) => {
        if (minutesFromMidnight == null) return null
        let base = dayjs.tz(dateValue, "YYYY-MM-DD", BOOKING_TIMEZONE, true)
        if (!base.isValid()) {
          base = dayjs.tz(dateValue, BOOKING_TIMEZONE)
        }
        if (!base.isValid()) {
          return null
        }
        return base.startOf("day").add(minutesFromMidnight, "minute")
      }

      const startMinutes = parseTimeToMinutes(selectedTime)
      if (startMinutes === null) {
        throw new Error("Invalid start time")
      }

      const start = buildDateTimeInZone(selectedDate, startMinutes)
      if (!start) {
        throw new Error("Invalid start date")
      }

      const serviceDuration = typeof selectedService.duration === "number"
        ? selectedService.duration
        : Number(selectedService.duration) || 30

      if (serviceDuration <= 0) {
        throw new Error("Invalid service duration")
      }

      const end = start.add(serviceDuration, "minute")

      const bookingDetails = {
        barber_id: selectedBarber.id,
        service_name: selectedService.name,
        begin_time: start.format(),
        end_time: end.format()
      }


      // Call the real API (pass user email for JWT refresh if needed)
      await createHaircutBooking(bookingDetails, user.token)
      
      setIsBooking(false)
      setBookingSuccess(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error("❌ Error creating booking:", error)
      setIsBooking(false)
      
      const status = (error as any).response?.status
      const errorMessage = (error as any).response?.data?.error?.message || "Unknown error"
      
      // Check if it's an authentication error (401)
      if (status === 401) {
        if (errorMessage.includes("Invalid or expired token")) {
          setApiError("Booking service is temporarily unavailable due to authentication issues. Please try again later or contact support.")
        } else {
          setApiError("Your session has expired. Please log in again to continue.")
          // Optional: Automatically redirect to login after a delay
          setTimeout(() => {
            forceReLogin("Session expired. Please log in again to make bookings.")
          }, 3000)
        }
      } 
      // Check if it's a conflict error (409) - time slot already booked
      else if (status === 409) {
        setApiError("This time slot is no longer available. Please select a different time and try again.")
      }
      // Other errors
      else {
        setApiError("Failed to create booking. Please try again.")
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  // Handle next step
  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      toggleModal(true)
    }
  }

  // Handle back step
  const handleBackStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Check if current step is complete
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return selectedBarber !== null && selectedService !== null
      case 2:
        return selectedDate !== null && selectedTime !== null
      case 3:
        return customerName.trim() !== "" && customerPhone.trim() !== ""
      default:
        return false
    }
  }

  // Render barber item
  const renderBarberItem = ({ item }: { item: Barber }) => (
    <TouchableOpacity
      onPress={() => handleBarberSelect(item)}
      className={`flex-row p-4 rounded-xl mb-3 ${selectedBarber?.id === item.id ? "bg-gold-100" : "bg-[#222]"}`}
    >
      <Image source={resolveImageSource(item.image, images.headshot)} className="w-16 h-16 rounded-full" />
      <View className="ml-4 flex-1">
        <Text className={`text-lg font-bold ${selectedBarber?.id === item.id ? "text-black" : "text-white-100"}`}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome6 name="star" size={14} color={selectedBarber?.id === item.id ? "#000" : "#FCA311"} solid />
          <Text className={`ml-1 ${selectedBarber?.id === item.id ? "text-black" : "text-gray-300"}`}>
            {item.rating}
          </Text>
        </View>
        <View className="flex-row flex-wrap mt-1">
          {item.specialties.map((specialty, index) => (
            <Text
              key={index}
              className={`text-xs mr-2 ${selectedBarber?.id === item.id ? "text-black" : "text-gray-400"}`}
            >
              • {specialty}
            </Text>
          ))}
        </View>
      </View>
      {selectedBarber?.id === item.id && (
        <View className="justify-center">
          <FontAwesome6 name="check-circle" size={24} color="#000" solid />
        </View>
      )}
    </TouchableOpacity>
  )

  // Render service item
  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      onPress={() => handleServiceSelect(item)}
      className={`p-4 rounded-xl mb-3 ${selectedService?.id === item.id ? "bg-gold-100" : "bg-[#222]"}`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              selectedService?.id === item.id ? "bg-black-100/20" : "bg-gold-100/20"
            }`}
          >
            <FontAwesome6
              name={item.icon as any}
              size={18}
              color={selectedService?.id === item.id ? "#000" : "#FCA311"}
            />
          </View>
          <Text className={`ml-3 text-lg font-bold ${selectedService?.id === item.id ? "text-black-100" : "text-white-100"}`}>
            {item.name}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-bold ${selectedService?.id === item.id ? "text-black-100" : "text-gold-100"}`}>
            ${item.price}
          </Text>
          <Text className={`text-xs ${selectedService?.id === item.id ? "text-black-100/70" : "text-gray-400"}`}>
            {item.duration} min
          </Text>
        </View>
      </View>

      <Text className={`mt-2 text-sm ${selectedService?.id === item.id ? "text-black-100/80" : "text-gray-400"}`}>
        {item.description}
      </Text>

      {selectedService?.id === item.id && (
        <View className="absolute top-16 right-4">
          <FontAwesome6 name="check-circle" size={24} color="#000" solid />
        </View>
      )}
    </TouchableOpacity>
  )

  // Render time slot item for API-based times
  const renderTimeSlot = ({ item }: { item: string }) => {
    const isToday = selectedDate === dayjs().format("YYYY-MM-DD")
    const currentTime = dayjs()
    const slotTime = dayjs(`${selectedDate} ${item}`, "YYYY-MM-DD HH:mm")
    const isPastTime = isToday && slotTime.isBefore(currentTime)
    const isSelected = selectedTime === item

    // Create accessibility label
    const accessibilityLabel = `${item}${isPastTime ? ', unavailable, past time' : ', available'}${isSelected ? ', currently selected' : ''}`
    const accessibilityHint = isPastTime
      ? "This time slot is no longer available"
      : isSelected
        ? "Double tap to deselect this time slot"
        : "Double tap to select this time slot"

    return (
      <TouchableOpacity
        disabled={isPastTime}
        onPress={() => handleTimeSelect(item)}
        className={`px-6 py-3 rounded-full mr-3 ${
          isSelected ? "bg-gold-100" : !isPastTime ? "bg-[#222]" : "bg-[#222]/30"
        }`}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          selected: isSelected,
          disabled: isPastTime
        }}
      >
        <Text
          className={`text-base font-medium ${
            isSelected ? "text-black" : !isPastTime ? "text-white-100" : "text-gray-500"
          }`}
        >
          {item}
        </Text>
      </TouchableOpacity>
    )
  }

  // Render step indicator
  const renderStepIndicator = () => (
    <View className="flex-row justify-between items-center mb-6 px-2">
      {[1, 2, 3].map((step) => (
        <View key={step} className="items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentStep === step ? "bg-gold-100" : currentStep > step ? "bg-green-500" : "bg-[#333]"
            }`}
          >
            {currentStep > step ? (
              <FontAwesome6 name="check" size={16} color="#fff" />
            ) : (
              <Text className={`font-bold ${currentStep === step ? "text-yellow-" : "text-white-100"}`}>{step}</Text>
            )}
          </View>
          <Text
            className={`text-xs mt-1 font-medium ${
              currentStep === step 
                ? "text-gold-100" 
                : currentStep > step 
                  ? "text-white-100"  // White instead of green
                  : "text-gray-400"
            }`}
          >
            {step === 1 ? "Select" : step === 2 ? "Schedule" : "Details"}
          </Text>
        </View>
      ))}

      {/* Connector lines */}
      <View className="h-[1px] bg-[#333] absolute w-[30%] left-[18%] top-5" />
      <View
        className={`h-[1px] absolute w-[30%] right-[18%] top-5 ${currentStep > 1 ? "bg-green-500" : "bg-[#333]"}`}
      />
    </View>
  )

  // Render step 1: Select barber and service
  const renderStep1 = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FCA311" />
          <Text className="text-white-100 mt-4">Loading barber services...</Text>
        </View>
      )
    }

    // Empty state when no barbers or services are available
    if (barbersData.length === 0 && servicesData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <FontAwesome6 name="scissors" size={48} color="#666" />
          <Text className="text-white-100 text-xl font-bold mt-6 text-center">Coming Soon</Text>
          <Text className="text-gray-400 text-center mt-2 px-8">
            {apiError || "Barber services are not available yet. Please check back later."}
          </Text>
        </View>
      )
    }

    return (
      <View className="flex-1">
        {apiError && (
          <View className="bg-yellow-100/20 p-3 rounded-lg mb-4">
            <Text className="text-yellow-400 text-sm">{apiError}</Text>
          </View>
        )}

        <Text className="text-white-100 text-xl font-bold mb-4">Choose Your Barber</Text>
        <FlatList
          data={barbersData}
          renderItem={renderBarberItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Text className="text-white-100 text-xl font-bold mb-4">Select Service</Text>
        <FlatList
          data={servicesData}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  // Render step 2: Select date and time
  const renderStep2 = () => (
    <View className="flex-1">
      <Text className="text-white-100 text-xl font-bold mb-4">Select Date</Text>
      <CalendarCard
        selectedDate={selectedDate}
        onDayPress={handleDateSelect}
        events={{}}
        minDate={new Date().toISOString().split('T')[0]}
      />

      <Text className="text-white-100 text-xl font-bold mt-6 mb-4">Select Time</Text>

      {/* Service duration indicator */}
      {selectedService && (
        <Text className="text-gray-400 text-sm mb-4 px-1 -mt-2">
          Showing available slots for a {selectedService.duration}-minute "{selectedService.name}".
        </Text>
      )}

      {/* Loading state for time slots - only show after 300ms delay */}
      {isTimeSlotsLoading && showLoadingIndicator && (
        <View className="flex-row items-center justify-center py-6">
          <ActivityIndicator size="small" color="#FCA311" />
          <Text className="text-white-100 ml-2">Fetching available times...</Text>
        </View>
      )}

      {/* Error state for time slots */}
      {timeSlotsError && (
        <View className="bg-red-100/20 p-4 rounded-lg mb-4">
          <Text className="text-red-400 text-sm text-center mb-3">{timeSlotsError}</Text>
          <TouchableOpacity
            onPress={() => selectedBarber && selectedService && fetchAvailableTimeSlots(selectedBarber.id, selectedDate, selectedService.duration)}
            className="bg-red-500/20 py-2 px-4 rounded-lg"
            accessibilityRole="button"
            accessibilityLabel="Retry loading available time slots"
            accessibilityHint="Double tap to try loading the available time slots again"
          >
            <Text className="text-red-400 text-center font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state for time slots */}
      {!isTimeSlotsLoading && !timeSlotsError && availableTimes.length === 0 && selectedBarber && (
        <View className="bg-yellow-100/20 p-4 rounded-lg mb-4">
          <Text className="text-yellow-400 text-center">No available slots for this day. Please select another date.</Text>
        </View>
      )}

      {/* Time slots list */}
      {!isTimeSlotsLoading && !timeSlotsError && availableTimes.length > 0 && (
        <FlatList
          data={availableTimes}
          renderItem={renderTimeSlot}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          className="mb-6"
          accessibilityRole="list"
          accessibilityLabel={`Available time slots for ${selectedDate}. ${availableTimes.length} slots available.`}
          accessibilityHint="Scroll horizontally to see all available time slots"
        />
      )}

      {selectedBarber && (
        <View className="bg-[#222] p-4 rounded-xl mt-4">
          <Text className="text-white-100 font-bold mb-2">Your Selection</Text>
          <View className="flex-row items-center">
            <Image
              source={resolveImageSource(selectedBarber.image, images.headshot)}
              className="w-10 h-10 rounded-full"
            />
            <Text className="text-white-100 ml-2">{selectedBarber.name}</Text>
          </View>
          {selectedService && (
            <View className="flex-row justify-between mt-3">
              <Text className="text-gray-300">{selectedService.name}</Text>
              <Text className="text-gold-100">${selectedService.price}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )

  // Render step 3: Enter customer details
  const renderStep3 = () => (
    <View className="flex-1">
      <Text className="text-white-100 text-xl font-bold mb-4">Your Information</Text>

      <View className="bg-[#222] p-5 rounded-xl mb-6">
        <Text className="text-white-100 font-medium mb-2">Full Name</Text>
        <TextInput
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter your full name"
          placeholderTextColor="#666"
          className="bg-[#333] text-white-100 p-3 rounded-lg mb-4"
        />

        <Text className="text-white-100 font-medium mb-2">Phone Number</Text>
        <TextInput
          value={customerPhone}
          onChangeText={setCustomerPhone}
          placeholder="Enter your phone number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          className="bg-[#333] text-white-100 p-3 rounded-lg"
        />
      </View>

      <Text className="text-white-100 text-xl font-bold mb-4">Booking Summary</Text>
      <View className="bg-[#222] p-5 rounded-xl">
        {selectedBarber && selectedService && selectedDate && selectedTime && (
          <>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-300">Barber:</Text>
              <Text className="text-white-100 font-medium">{selectedBarber.name}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-300">Service:</Text>
              <Text className="text-white-100 font-medium">{selectedService.name}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-300">Date:</Text>
              <Text className="text-white-100 font-medium">{dayjs(selectedDate).format("MMM D, YYYY")}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-300">Time:</Text>
              <Text className="text-white-100 font-medium">{selectedTime}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-300">Duration:</Text>
              <Text className="text-white-100 font-medium">{selectedService.duration} minutes</Text>
            </View>
            <View className="h-[1px] bg-[#333] my-3" />
            <View className="flex-row justify-between">
              <Text className="text-white-100 font-bold">Total:</Text>
              <Text className="text-gold-100 font-bold text-lg">${selectedService.price}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )

  // Render confirmation modal
const renderConfirmationModal = () => (
  <Modal transparent visible={isModalVisible} animationType="none" onRequestClose={() => toggleModal(false)}>
    <View className="flex-1 bg-black/70 justify-center items-center px-5">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="bg-[#1A1A1A] rounded-2xl w-full overflow-hidden"
      >
        {bookingSuccess ? (
          <View className="p-6 items-center">
            <View className="w-20 h-20 rounded-full bg-green-500 items-center justify-center mb-4">
              <FontAwesome6 name="check" size={40} color="#fff" />
            </View>
            <Text className="text-white-100 text-2xl font-bold text-center mb-2">Appointment Confirmed!</Text>
            <Text className="text-gray-300 text-center mb-6">
              Your appointment has been successfully booked. Please arrive 5 minutes early and bring payment.
            </Text>

            <View className="bg-[#222] p-4 rounded-xl w-full mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400">Appointment:</Text>
                <Text className="text-white-100 font-medium">
                  {dayjs(selectedDate).format("MMM D")} at {selectedTime}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400">Service:</Text>
                <Text className="text-white-100 font-medium">{selectedService?.name}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400">Barber:</Text>
                <Text className="text-white-100 font-medium">{selectedBarber?.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Cost:</Text>
                <Text className="text-gold-100 font-medium">${selectedService?.price}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => toggleModal(false)} className="bg-gold-100 py-3 px-6 rounded-xl w-full">
              <Text className="text-black-100 text-center font-bold text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white-100 text-xl font-bold">Confirm Appointment</Text>
                <TouchableOpacity onPress={() => toggleModal(false)}>
                  <FontAwesome6 name="circle-xmark" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <View className="bg-[#222] p-4 rounded-xl mb-4">
                <Text className="text-white-100 font-bold mb-3">Appointment Details</Text>
                <View className="flex-row items-center mb-3">
                  <FontAwesome6 name="calendar" size={16} color="#FCA311" className="w-6" />
                  <Text className="text-white-100 ml-2">{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <FontAwesome6 name="clock" size={16} color="#FCA311" className="w-6" />
                  <Text className="text-white-100 ml-2">{selectedTime}</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <FontAwesome6 name="user" size={16} color="#FCA311" className="w-6" />
                  <Text className="text-white-100 ml-2">{selectedBarber?.name}</Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome6 name="cut" size={16} color="#FCA311" className="w-6" />
                  <Text className="text-white-100 ml-2">{selectedService?.name}</Text>
                </View>
              </View>

              <View className="bg-[#222] p-4 rounded-xl mb-6">
                <Text className="text-white-100 font-bold mb-3">Appointment Summary</Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-300">{selectedService?.name}</Text>
                  <Text className="text-white-100">{selectedService?.duration} min</Text>
                </View>
                <View className="h-[1px] bg-[#333] my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-white-100 font-bold">Service Cost</Text>
                  <Text className="text-gold-100 font-bold">${selectedService?.price}</Text>
                </View>
                <Text className="text-gray-400 text-xs mt-2 text-center">
                  Payment due at appointment
                </Text>
              </View>

              {apiError && (
                <View className="bg-red-100/20 p-3 rounded-lg mb-4">
                  <Text className="text-red-400 text-sm text-center">{apiError}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleConfirmBooking}
                disabled={isBooking}
                className="bg-gold-100 py-4 rounded-xl items-center"
              >
                {isBooking ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold text-lg">Confirm Appointment</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleModal(false)}
                disabled={isBooking}
                className="py-3 items-center mt-3"
              >
                <Text className="text-gray-400">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-[#111] px-6 py-3">
              <Text className="text-gray-400 text-xs text-center">
                By confirming, you agree to our cancellation policy. You can cancel up to 24 hours before your
                appointment by calling us directly. Payment will be collected in person at your appointment.
              </Text>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  </Modal>
)

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <BackButton />
        <Text className="text-white-100 text-2xl font-bold">Book Appointment</Text>
        <View className="w-10" />
      </View>

      {/* Step Indicator */}
      <View className="px-5">{renderStepIndicator()}</View>

      {/* Use a single FlatList to avoid nesting issues */}
      <FlatList
        data={[{ key: "content" }]} // Dummy data to trigger render
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View className="px-5">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Navigation Buttons - with Safe Area bottom padding */}
      <View
        className="flex-row justify-between items-center px-5 absolute bottom-0 left-0 right-0 bg-[#0C0B0B] border-t border-[#222]"
        style={{ paddingTop: 16, paddingBottom: Math.max(insets.bottom + 8, 20) }}
      >
        <TouchableOpacity onPress={handleBackStep} className="px-5 py-3 rounded-xl bg-[#222]">
          <Text className="text-white-100 font-medium">{currentStep === 1 ? "Cancel" : "Back"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextStep}
          disabled={!isStepComplete()}
          className={`px-6 py-3 rounded-xl flex-row items-center ${
            isStepComplete() ? "bg-gold-100" : "bg-[#333]"
          }`}
        >
          <Text className={`font-bold ${isStepComplete() ? "text-black" : "text-gray-500"}`}>
            {currentStep < 3 ? "Continue" : "Review & Book"}
          </Text>
          {isStepComplete() && <FontAwesome6 name="arrow-right" size={14} color="#000" className="ml-2" />}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      {renderConfirmationModal()}
    </SafeAreaView>
  );
};

export default BarberBookingScreen

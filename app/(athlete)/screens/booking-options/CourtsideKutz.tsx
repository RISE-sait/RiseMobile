import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { FontAwesome6 } from "@expo/vector-icons"
import dayjs from "dayjs"
import * as Haptics from "expo-haptics"

import CalendarCard from "@/components/calendar/CalendarCard"
import BackButton from "@/components/buttons/BackButton"

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

interface TimeSlot {
  time: string
  available: boolean
}

// Mock data for barbers
const barbers: Barber[] = [
  {
    id: "b1",
    name: "James Wilson",
    image: "https://media.licdn.com/dms/image/v2/D5603AQGTkkomz0jo4g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1711569544222?e=1747872000&v=beta&t=eXGPCIGMHVJJlnTEfc4Ohqthoz9gChy96fPM6BNDXqU",
    rating: 4.9,
    specialties: ["Fades", "Beard Styling"],
    availability: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"],
  },
  {
    id: "b2",
    name: "Michael Rodriguez",
    image: "https://alsd.com/sites/default/files//2022-06/barber-tiki_500px.jpg",
    rating: 4.8,
    specialties: ["Classic Cuts", "Hot Shaves"],
    availability: ["9:30 AM", "10:30 AM", "11:30 AM", "1:30 PM", "2:30 PM", "4:30 PM"],
  },
  {
    id: "b3",
    name: "David Thompson",
    image: "https://images.squarespace-cdn.com/content/v1/5c4d7e227e3c3a6ec70a5ac7/1596359610389-QDVB9CXJRSWGSPPNUES6/IMG_8599.jpg",
    rating: 4.7,
    specialties: ["Designs", "Color"],
    availability: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"],
  },
  {
    id: "b4",
    name: "Robert Johnson",
    image: "https://images.squarespace-cdn.com/content/v1/5c4d7e227e3c3a6ec70a5ac7/1564047138008-YQA9PEBO4MURKNPW8J9W/IMG_9342.jpg",
    rating: 4.6,
    specialties: ["Buzz Cuts", "Line Ups"],
    availability: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
  },
]

// Mock data for services
const services: Service[] = [
  {
    id: "s1",
    name: "Classic Haircut",
    icon: "scissors",
    price: 25,
    duration: 30,
    description: "Traditional haircut with scissors, includes wash and style",
  },
  {
    id: "s2",
    name: "Fade",
    icon: "cut",
    price: 30,
    duration: 45,
    description: "Gradual blend from skin to desired length, perfect for a clean look",
  },
  {
    id: "s3",
    name: "Buzz Cut",
    icon: "user-tie",
    price: 20,
    duration: 20,
    description: "Quick, uniform short cut with clippers",
  },
  {
    id: "s4",
    name: "Beard Trim",
    icon: "scissors",
    price: 15,
    duration: 15,
    description: "Shape and trim your beard to perfection",
  },
  {
    id: "s5",
    name: "Hot Shave",
    icon: "fire",
    price: 35,
    duration: 30,
    description: "Traditional hot towel straight razor shave",
  },
  {
    id: "s6",
    name: "Hair + Beard Combo",
    icon: "user-plus",
    price: 45,
    duration: 60,
    description: "Complete haircut and beard trim package",
  },
  {
    id: "s7",
    name: "Line Up",
    icon: "border-style",
    price: 15,
    duration: 15,
    description: "Clean up your hairline, neck, and beard",
  },
  {
    id: "s8",
    name: "Kids Cut",
    icon: "child",
    price: 20,
    duration: 30,
    description: "Haircut for children under 12",
  },
]

// Generate time slots
const generateTimeSlots = (selectedBarber: Barber | null): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const times = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
  ]

  times.forEach((time) => {
    slots.push({
      time,
      available: selectedBarber ? selectedBarber.availability.includes(time) : true,
    })
  })

  return slots
}

const BarberBookingScreen = () => {
  // State variables
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isModalVisible, setModalVisible] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current

  // Update time slots when barber changes
  useEffect(() => {
    setTimeSlots(generateTimeSlots(selectedBarber))
    // Reset time selection when barber changes
    setSelectedTime(null)
  }, [selectedBarber])

  // Handle date selection
  const handleDateSelect = (day: { dateString: string }) => {
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
  const handleConfirmBooking = () => {
    if (!selectedBarber || !selectedService || !selectedTime) return

    setIsBooking(true)

    // Simulate API call
    setTimeout(() => {
      setIsBooking(false)
      setBookingSuccess(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1500)
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
      <Image source={{ uri: item.image }} className="w-16 h-16 rounded-full" />
      <View className="ml-4 flex-1">
        <Text className={`text-lg font-bold ${selectedBarber?.id === item.id ? "text-black" : "text-white-100"}`}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome6 name="star" size={14} color={selectedBarber?.id === item.id ? "#000" : "#FFD700"} solid />
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
              color={selectedService?.id === item.id ? "#000" : "#FFD700"}
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

  // Render time slot item
  const renderTimeSlot = ({ item }: { item: TimeSlot }) => (
    <TouchableOpacity
      disabled={!item.available}
      onPress={() => handleTimeSelect(item.time)}
      className={`px-6 py-3 rounded-full mr-3 ${
        selectedTime === item.time ? "bg-gold-100" : item.available ? "bg-[#222]" : "bg-[#222]/30"
      }`}
    >
      <Text
        className={`text-base font-medium ${
          selectedTime === item.time ? "text-black" : item.available ? "text-white-100" : "text-gray-500"
        }`}
      >
        {item.time}
      </Text>
    </TouchableOpacity>
  )

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
              <Text className={`font-bold ${currentStep === step ? "text-black" : "text-white-100"}`}>{step}</Text>
            )}
          </View>
          <Text
            className={`text-xs mt-1 ${
              currentStep === step ? "text-gold-100" : currentStep > step ? "text-green-500" : "text-gray-400"
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
  const renderStep1 = () => (
    <View className="flex-1">
      <Text className="text-white-100 text-xl font-bold mb-4">Choose Your Barber</Text>
      <FlatList
        data={barbers}
        renderItem={renderBarberItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }} // ✅ Prevents overlap issues
      />

      <Text className="text-white-100 text-xl font-bold mb-4">Select Service</Text>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}

      />
    </View>
  )

  // Render step 2: Select date and time
  const renderStep2 = () => (
    <View className="flex-1">
      <Text className="text-white-100 text-xl font-bold mb-4">Select Date</Text>
      <CalendarCard selectedDate={selectedDate} onDayPress={handleDateSelect} events={{}} />

      <Text className="text-white-100 text-xl font-bold mt-6 mb-4">Select Time</Text>
      <FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item.time}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true} // ✅ Fixes nested scrolling issue
        className="mb-6"
      />

      {selectedBarber && (
        <View className="bg-[#222] p-4 rounded-xl mt-4">
          <Text className="text-white-100 font-bold mb-2">Your Selection</Text>
          <View className="flex-row items-center">
            <Image source={{ uri: selectedBarber.image }} className="w-10 h-10 rounded-full" />
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
              <Text className="text-white-100 text-2xl font-bold text-center mb-2">Booking Confirmed!</Text>
              <Text className="text-gray-300 text-center mb-6">
                Your appointment has been successfully booked. We've sent a confirmation to your phone.
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
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Barber:</Text>
                  <Text className="text-white-100 font-medium">{selectedBarber?.name}</Text>
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
                  <Text className="text-white-100 text-xl font-bold">Confirm Booking</Text>
                  <TouchableOpacity onPress={() => toggleModal(false)}>
                    <FontAwesome6 name="times" size={20} color="#999" />
                  </TouchableOpacity>
                </View>

                <View className="bg-[#222] p-4 rounded-xl mb-4">
                  <Text className="text-white-100 font-bold mb-3">Appointment Details</Text>
                  <View className="flex-row items-center mb-3">
                    <FontAwesome6 name="calendar" size={16} color="#FFD700" className="w-6" />
                    <Text className="text-white-100 ml-2">{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <FontAwesome6 name="clock" size={16} color="#FFD700" className="w-6" />
                    <Text className="text-white-100 ml-2">{selectedTime}</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <FontAwesome6 name="user" size={16} color="#FFD700" className="w-6" />
                    <Text className="text-white-100 ml-2">{selectedBarber?.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome6 name="cut" size={16} color="#FFD700" className="w-6" />
                    <Text className="text-white-100 ml-2">{selectedService?.name}</Text>
                  </View>
                </View>

                <View className="bg-[#222] p-4 rounded-xl mb-6">
                  <Text className="text-white-100 font-bold mb-3">Payment Summary</Text>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-300">{selectedService?.name}</Text>
                    <Text className="text-white-100">${selectedService?.price}</Text>
                  </View>
                  <View className="h-[1px] bg-[#333] my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-white-100 font-bold">Total</Text>
                    <Text className="text-gold-100 font-bold">${selectedService?.price}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleConfirmBooking}
                  disabled={isBooking}
                  className="bg-gold-100 py-4 rounded-xl items-center"
                >
                  {isBooking ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black font-bold text-lg">Confirm & Pay</Text>
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
                  By confirming, you agree to our cancellation policy. You can cancel up to 2 hours before your
                  appointment.
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

      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center px-5 py-4 absolute bottom-0 left-0 right-0 bg-[#0C0B0B] border-t border-[#222]">
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


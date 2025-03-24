import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/buttons/BackButton";

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections = [
  {
    title: "Getting Started",
    items: [
        {
            "question": "How do I access my account?",
            "answer": "To access your account, open the app and log in using your registered email and password. If you haven’t set up an account yet, please sign up first."
          },
          {
            "question": "Can I view membership options before logging in?",
            "answer": "No, membership details are only available to logged-in users. Please log in or create an account to explore our available plans and benefits."
          }
    ],
  },
  {
    title: "Bookings & Scheduling",
    items: [
      {
        question: "How do I book a court?",
        answer:
          'You can book a court through the app by navigating to the "Book" section, selecting your preferred date and time, and confirming your reservation.',
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "Bookings can be cancelled up to 24 hours before the scheduled time for a full refund. Late cancellations may incur a fee.",
      },
    ],
  },
  {
    title: "Facility Services",
    items: [
      {
        question: "How do I book a haircut?",
        answer:
          "You can book a haircut through the app by visiting the Services section and selecting Barber. Choose your preferred barber, date, and time to schedule your appointment.",
      },
      {
        question: "What other services does the facility offer?",
        answer:
          "Our facility offers a range of services including court rentals, personal training, team practices, equipment rental, barber services, and more. Check the Services section for a complete list.",
      },
    ],
  },
  {
    title: "Teams & Coaching",
    items: [
      {
        question: "How do coaches manage their teams?",
        answer:
          "Coaches can manage their teams through the app by accessing the Teams section. They can set practice schedules, manage rosters, communicate with players, and track team performance.",
      },
      {
        question: "How do I join a team?",
        answer:
          "To join a team, you need to be invited by a coach or team administrator. Once invited, you'll receive a notification to accept the invitation.",
      },
    ],
  },
];

function FAQSection({ title, items }: { title: string; items: FAQItem[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <View className="mb-6">
      <Text className="text-[#F0F0F0] text-xl font-semibold mb-4">{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          className="bg-[#1A1A1A] rounded-lg p-4 mb-2"
          onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-[#F0F0F0] text-base flex-1 mr-4">{item.question}</Text>
            <FontAwesomeIcon 
              icon={expandedIndex === index ? faChevronUp : faChevronDown} 
              color="#F0F0F0" 
              size={16} 
            />
          </View>
          {expandedIndex === index && (
            <Text className="text-[#999999] text-sm mt-3 leading-5">{item.answer}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function HelpCenter() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="px-5" 
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <BackButton/>
        <View className="pt-4 pb-6">
          <Text className="text-[#F0F0F0] text-2xl font-bold mb-2">Help Center</Text>
          <Text className="text-[#999999] text-base mb-6">
            Find answers to frequently asked questions
          </Text>
        </View>


        {faqSections.map((section, index) => (
          <FAQSection key={index} title={section.title} items={section.items} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

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
        question: "How do I access my account?",
        answer: "To access your account, open the app and log in using your registered email and password. If you haven't set up an account yet, please sign up first."
      },
      {
        question: "What's the difference between athlete and coach accounts?",
        answer: "Athlete accounts can view events, practices, and personal stats. Coach accounts have additional features like creating practices, managing team rosters, and viewing detailed team analytics."
      },
      {
        question: "How do I switch between different views in the app?",
        answer: "Use the tab bar at the bottom of the screen to navigate between Home, Events, and Profile sections. The interface may vary slightly depending on whether you're logged in as an athlete or coach."
      }
    ],
  },
  {
    title: "Events & Practices",
    items: [
      {
        question: "What's the difference between events and practices?",
        answer: "Events are general activities you can view and get details about. Practices are team-specific training sessions that coaches can create and manage for their teams."
      },
      {
        question: "Why can't I join some events?",
        answer: "Some events may have restrictions based on your account type, team membership, or capacity limits. Practice sessions are typically managed by coaches and may require team membership."
      },
      {
        question: "How do I view event or practice details?",
        answer: "Tap on any event or practice card to view detailed information including time, location, description, and other relevant details."
      }
    ],
  },
  {
    title: "Profile & Settings",
    items: [
      {
        question: "How do I edit my profile information?",
        answer: "Go to your Profile tab and tap 'Edit Profile' to update your personal information, profile picture, and other account details."
      },
      {
        question: "How do I manage my notification preferences?",
        answer: "In your Profile, tap 'Notifications' to control which types of notifications you receive, including event reminders, practice updates, and team announcements."
      },
      {
        question: "What are credits and how do I use them?",
        answer: "Credits are used for various app features and services. You can view your current credit balance in the Profile section under 'Credits'."
      }
    ],
  },
  {
    title: "Technical Issues",
    items: [
      {
        question: "The app is running slowly or crashing. What should I do?",
        answer: "Try closing and reopening the app. If issues persist, restart your device or check for app updates in your device's app store."
      },
      {
        question: "I'm not receiving notifications. How can I fix this?",
        answer: "Check your notification settings in the app and ensure notifications are enabled in your device settings. You may need to allow notification permissions when prompted."
      },
      {
        question: "My data isn't syncing properly. What's wrong?",
        answer: "Ensure you have a stable internet connection. Try logging out and logging back in. If problems continue, contact support."
      }
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

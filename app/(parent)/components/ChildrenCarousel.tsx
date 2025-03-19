import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import images from "@/constants/images"

type Child = {
  id: string
  firstName: string
  lastName: string
  age: number
  sport: string
  profileImage: string | null
  jerseyNumber: string
}

type ChildrenCarouselProps = {
  children: Child[]
  onSelectChild: (childId: string) => void
}

const ChildrenCarousel = ({ children, onSelectChild }: ChildrenCarouselProps) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
      {children.map((child) => (
        <TouchableOpacity key={child.id} className="mr-4 items-center" onPress={() => onSelectChild(child.id)}>
          <View className="relative">
            <Image
              source={child.profileImage ? { uri: child.profileImage } : images.headshot}
              className="w-20 h-20 rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-[#1A1A1A] rounded-full border-2 border-black w-8 h-8 items-center justify-center">
              <Text className="text-gold-100 text-xs font-bold">#{child.jerseyNumber}</Text>
            </View>
          </View>
          <Text className="text-white text-center mt-2 font-medium">{child.firstName}</Text>
          <Text className="text-gray-400 text-xs text-center">{child.sport}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity className="mr-4 items-center justify-center" onPress={() => onSelectChild("add")}>
        <View className="w-20 h-20 rounded-full bg-[#1A1A1A] items-center justify-center border-2 border-dashed border-gold-100">
          <Text className="text-gold-100 text-3xl">+</Text>
        </View>
        <Text className="text-white text-center mt-2 font-medium">Add Child</Text>
        <Text className="text-gray-400 text-xs text-center">Register</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ChildrenCarousel


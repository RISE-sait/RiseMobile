import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/utils/auth";
import {
  getAllHeroPromos,
  getAllFeatureCards,
  getAllPromoVideos,
  updateHeroPromo,
  updateFeatureCard,
  updatePromoVideo,
  type HeroPromo,
  type FeatureCard,
  type PromoVideo,
} from "@/utils/api/admin";

// Tab Button
const TabButton = ({
  title,
  isActive,
  count,
  onPress,
}: {
  title: string;
  isActive: boolean;
  count: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 py-3 items-center rounded-xl"
    style={{
      backgroundColor: isActive ? "#FCA311" : "#1A1A1A",
      borderWidth: isActive ? 0 : 1,
      borderColor: "rgba(255,255,255,0.06)",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center">
      <Text
        className={`font-Oswald-Medium ${isActive ? "text-black-100" : "text-gray-400"}`}
        style={{ fontSize: 15 }}
      >
        {title}
      </Text>
      {count > 0 && (
        <View
          className="ml-1.5 px-1.5 py-0.5 rounded-full min-w-[20px] items-center"
          style={{ backgroundColor: isActive ? "#000" : "rgba(252, 163, 17, 0.3)" }}
        >
          <Text
            className="font-Oswald-Bold"
            style={{ color: isActive ? "#FCA311" : "#FCA311", fontSize: 13 }}
          >
            {count}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// Status Badge
const StatusBadge = ({ item }: { item: { is_active: boolean; start_date?: string; end_date?: string } }) => {
  const getStatus = () => {
    if (!item.is_active) return { label: "Inactive", color: "#666" };

    const now = new Date();
    if (item.start_date && new Date(item.start_date) > now) {
      return { label: "Scheduled", color: "#FCA311" };
    }
    if (item.end_date && new Date(item.end_date) < now) {
      return { label: "Expired", color: "#FF6B6B" };
    }
    return { label: "Active", color: "#4CAF50" };
  };

  const status = getStatus();
  return (
    <View
      className="px-3 py-1.5 rounded-full"
      style={{ backgroundColor: `${status.color}20` }}
    >
      <Text className="font-Outfit-Medium" style={{ color: status.color, fontSize: 13 }}>
        {status.label}
      </Text>
    </View>
  );
};

// Hero Promo Card
const HeroPromoCard = ({
  promo,
  onToggle,
  isUpdating,
}: {
  promo: HeroPromo;
  onToggle: () => void;
  isUpdating: boolean;
}) => (
  <View
    className="bg-[#1A1A1A] rounded-2xl mb-3 overflow-hidden"
    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
  >
    {promo.media_type === "image" && promo.media_url && (
      <Image
        source={{ uri: promo.media_url }}
        className="w-full h-32"
        resizeMode="cover"
      />
    )}
    <View className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white-100 font-Oswald-Bold text-xl">{promo.title}</Text>
          {promo.subtitle && (
            <Text className="text-gray-400 font-Outfit-Regular mt-1" style={{ fontSize: 15 }}>{promo.subtitle}</Text>
          )}
        </View>
        <StatusBadge item={promo} />
      </View>

      {promo.description && (
        <Text className="text-gray-500 font-Outfit-Regular mt-2" style={{ fontSize: 14 }} numberOfLines={2}>
          {promo.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-[#333]">
        <View className="flex-row items-center">
          <FontAwesome6
            name={promo.media_type === "video" ? "video" : "image"}
            size={14}
            color="#666"
          />
          <Text className="text-gray-500 font-Outfit-Regular ml-1.5 capitalize" style={{ fontSize: 13 }}>
            {promo.media_type}
          </Text>
          <Text className="text-gray-600 mx-2">|</Text>
          <Text className="text-gray-500 font-Outfit-Regular" style={{ fontSize: 13 }}>Order: {promo.display_order}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-400 font-Outfit-Regular mr-2" style={{ fontSize: 13 }}>
            {promo.is_active ? "Active" : "Inactive"}
          </Text>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#FCA311" />
          ) : (
            <Switch
              value={promo.is_active}
              onValueChange={onToggle}
              trackColor={{ false: "#333", true: "rgba(252, 163, 17, 0.3)" }}
              thumbColor={promo.is_active ? "#FCA311" : "#666"}
            />
          )}
        </View>
      </View>
    </View>
  </View>
);

// Feature Card Component
const FeatureCardItem = ({
  card,
  onToggle,
  isUpdating,
}: {
  card: FeatureCard;
  onToggle: () => void;
  isUpdating: boolean;
}) => (
  <View
    className="bg-[#1A1A1A] rounded-2xl mb-3 overflow-hidden"
    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
  >
    {card.image_url && (
      <Image
        source={{ uri: card.image_url }}
        className="w-full h-28"
        resizeMode="cover"
      />
    )}
    <View className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white-100 font-Oswald-Bold text-lg">{card.title}</Text>
        </View>
        <StatusBadge item={card} />
      </View>

      {card.description && (
        <Text className="text-gray-500 font-Outfit-Regular mt-2" style={{ fontSize: 14 }} numberOfLines={2}>
          {card.description}
        </Text>
      )}

      {card.button_text && (
        <View className="flex-row items-center mt-2">
          <FontAwesome6 name="link" size={12} color="#FCA311" />
          <Text className="text-[#FCA311] font-Outfit-Medium ml-1.5" style={{ fontSize: 13 }}>{card.button_text}</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#333]">
        <Text className="text-gray-500 font-Outfit-Regular" style={{ fontSize: 13 }}>Order: {card.display_order}</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-400 font-Outfit-Regular mr-2" style={{ fontSize: 13 }}>
            {card.is_active ? "Active" : "Inactive"}
          </Text>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#FCA311" />
          ) : (
            <Switch
              value={card.is_active}
              onValueChange={onToggle}
              trackColor={{ false: "#333", true: "rgba(252, 163, 17, 0.3)" }}
              thumbColor={card.is_active ? "#FCA311" : "#666"}
            />
          )}
        </View>
      </View>
    </View>
  </View>
);

// Promo Video Card
const PromoVideoCard = ({
  video,
  onToggle,
  isUpdating,
}: {
  video: PromoVideo;
  onToggle: () => void;
  isUpdating: boolean;
}) => (
  <View
    className="bg-[#1A1A1A] rounded-2xl mb-3 overflow-hidden"
    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
  >
    <View className="relative">
      {video.thumbnail_url ? (
        <Image
          source={{ uri: video.thumbnail_url }}
          className="w-full h-28"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-28 bg-[#252525] items-center justify-center">
          <FontAwesome6 name="video" size={32} color="#666" />
        </View>
      )}
      <View className="absolute inset-0 items-center justify-center">
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <FontAwesome6 name="play" size={20} color="#FCA311" />
        </View>
      </View>
    </View>
    <View className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white-100 font-Oswald-Bold text-lg">{video.title}</Text>
          {video.category && (
            <Text className="text-[#FCA311] font-Outfit-Medium mt-1 capitalize" style={{ fontSize: 13 }}>
              {video.category}
            </Text>
          )}
        </View>
        <StatusBadge item={video} />
      </View>

      {video.description && (
        <Text className="text-gray-500 font-Outfit-Regular mt-2" style={{ fontSize: 14 }} numberOfLines={2}>
          {video.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#333]">
        <Text className="text-gray-500 font-Outfit-Regular" style={{ fontSize: 13 }}>Order: {video.display_order}</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-400 font-Outfit-Regular mr-2" style={{ fontSize: 13 }}>
            {video.is_active ? "Active" : "Inactive"}
          </Text>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#FCA311" />
          ) : (
            <Switch
              value={video.is_active}
              onValueChange={onToggle}
              trackColor={{ false: "#333", true: "rgba(252, 163, 17, 0.3)" }}
              thumbColor={video.is_active ? "#FCA311" : "#666"}
            />
          )}
        </View>
      </View>
    </View>
  </View>
);

// Empty State
const EmptyState = ({ type }: { type: string }) => (
  <View className="py-10 items-center">
    <View
      className="w-20 h-20 rounded-full items-center justify-center mb-4"
      style={{ backgroundColor: "rgba(252, 163, 17, 0.15)" }}
    >
      <FontAwesome6 name="globe" size={32} color="#FCA311" />
    </View>
    <Text className="text-white-100 font-Oswald-Medium text-lg">No Content</Text>
    <Text className="text-gray-400 font-Outfit-Regular text-center mt-2 px-10">
      No {type} found
    </Text>
  </View>
);

export default function WebsiteContentScreen() {
  const router = useRouter();
  const { getValidToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"hero" | "features" | "videos">("hero");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heroPromos, setHeroPromos] = useState<HeroPromo[]>([]);
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([]);
  const [promoVideos, setPromoVideos] = useState<PromoVideo[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const fetchContent = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const [heroData, featureData, videoData] = await Promise.all([
        getAllHeroPromos(token),
        getAllFeatureCards(token),
        getAllPromoVideos(token),
      ]);

      setHeroPromos(heroData.sort((a, b) => a.display_order - b.display_order));
      setFeatureCards(featureData.sort((a, b) => a.display_order - b.display_order));
      setPromoVideos(videoData.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [getValidToken]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContent();
  }, [fetchContent]);

  const handleToggleHeroPromo = async (promo: HeroPromo) => {
    setUpdatingIds((prev) => new Set(prev).add(promo.id));
    try {
      const token = await getValidToken();
      if (!token) return;

      // Send full object with all required fields
      const success = await updateHeroPromo(token, promo.id, {
        title: promo.title,
        subtitle: promo.subtitle,
        description: promo.description,
        media_url: promo.media_url,
        media_type: promo.media_type,
        button_text: promo.button_text,
        button_link: promo.button_link,
        display_order: promo.display_order,
        start_date: promo.start_date,
        end_date: promo.end_date,
        is_active: !promo.is_active,
      });

      if (success) {
        setHeroPromos((prev) =>
          prev.map((p) =>
            p.id === promo.id ? { ...p, is_active: !p.is_active } : p
          )
        );
      } else {
        Alert.alert("Error", "Failed to update hero promo");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(promo.id);
        return newSet;
      });
    }
  };

  const handleToggleFeatureCard = async (card: FeatureCard) => {
    setUpdatingIds((prev) => new Set(prev).add(card.id));
    try {
      const token = await getValidToken();
      if (!token) return;

      // Send full object with all required fields
      const success = await updateFeatureCard(token, card.id, {
        title: card.title,
        description: card.description,
        image_url: card.image_url,
        button_text: card.button_text,
        button_link: card.button_link,
        display_order: card.display_order,
        start_date: card.start_date,
        end_date: card.end_date,
        is_active: !card.is_active,
      });

      if (success) {
        setFeatureCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? { ...c, is_active: !c.is_active } : c
          )
        );
      } else {
        Alert.alert("Error", "Failed to update feature card");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(card.id);
        return newSet;
      });
    }
  };

  const handleTogglePromoVideo = async (video: PromoVideo) => {
    setUpdatingIds((prev) => new Set(prev).add(video.id));
    try {
      const token = await getValidToken();
      if (!token) return;

      // Send full object with all required fields
      const success = await updatePromoVideo(token, video.id, {
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        category: video.category,
        display_order: video.display_order,
        start_date: video.start_date,
        end_date: video.end_date,
        is_active: !video.is_active,
      });

      if (success) {
        setPromoVideos((prev) =>
          prev.map((v) =>
            v.id === video.id ? { ...v, is_active: !v.is_active } : v
          )
        );
      } else {
        Alert.alert("Error", "Failed to update promo video");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(video.id);
        return newSet;
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "hero":
        if (heroPromos.length === 0) return <EmptyState type="hero promos" />;
        return heroPromos.map((promo) => (
          <HeroPromoCard
            key={promo.id}
            promo={promo}
            onToggle={() => handleToggleHeroPromo(promo)}
            isUpdating={updatingIds.has(promo.id)}
          />
        ));
      case "features":
        if (featureCards.length === 0) return <EmptyState type="feature cards" />;
        return featureCards.map((card) => (
          <FeatureCardItem
            key={card.id}
            card={card}
            onToggle={() => handleToggleFeatureCard(card)}
            isUpdating={updatingIds.has(card.id)}
          />
        ));
      case "videos":
        if (promoVideos.length === 0) return <EmptyState type="promo videos" />;
        return promoVideos.map((video) => (
          <PromoVideoCard
            key={video.id}
            video={video}
            onToggle={() => handleTogglePromoVideo(video)}
            isUpdating={updatingIds.has(video.id)}
          />
        ));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-[#1A1A1A] rounded-full items-center justify-center mr-3"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-Oswald-Bold">WEBSITE CONTENT</Text>
          <Text className="text-gray-400 font-Outfit-Regular text-sm">
            Manage promos and features
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View
        className="mx-5 mt-3 p-4 flex-row items-center"
        style={{
          backgroundColor: "rgba(252, 163, 17, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(252, 163, 17, 0.3)",
          borderRadius: 16,
        }}
      >
        <View
          className="w-10 h-10 items-center justify-center mr-3"
          style={{
            backgroundColor: "rgba(252, 163, 17, 0.2)",
            borderRadius: 12,
          }}
        >
          <Ionicons name="information-circle" size={20} color="#FCA311" />
        </View>
        <Text className="text-gray-300 font-Outfit-Regular flex-1" style={{ fontSize: 13, lineHeight: 18 }}>
          Toggle items on/off to show or hide them on the website. For full editing, use the admin panel on desktop.
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-5 mt-4 flex-row gap-2">
        <TabButton
          title="Hero"
          isActive={activeTab === "hero"}
          count={heroPromos.length}
          onPress={() => setActiveTab("hero")}
        />
        <TabButton
          title="Features"
          isActive={activeTab === "features"}
          count={featureCards.length}
          onPress={() => setActiveTab("features")}
        />
        <TabButton
          title="Videos"
          isActive={activeTab === "videos"}
          count={promoVideos.length}
          onPress={() => setActiveTab("videos")}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FCA311"
              colors={["#FCA311"]}
            />
          }
        >
          {renderContent()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

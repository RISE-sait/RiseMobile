import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCourts, selectAllCourts, selectCourtsLoading, selectCourtsError } from '@/store/slices/courtsSlice';
import BackButton from '@/components/buttons/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FFD700',
  primaryDark: '#E6C200',
  background: '#0C0B0B',
  card: '#1A1A1A',
  cardDark: '#141414',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#FF5252',
  info: '#2196F3',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return COLORS.success;
    case 'in_use':
      return COLORS.danger;
    case 'maintenance':
      return COLORS.warning;
    case 'reserved':
      return COLORS.info;
    default:
      return COLORS.textSecondary;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'in_use':
      return 'In Use';
    case 'maintenance':
      return 'Maintenance';
    case 'reserved':
      return 'Reserved';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available':
      return 'check-circle';
    case 'in_use':
      return 'users';
    case 'maintenance':
      return 'tools';
    case 'reserved':
      return 'lock';
    default:
      return 'question-circle';
  }
};

const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const CoachCourtsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const courts = useAppSelector(selectAllCourts);
  const loading = useAppSelector(selectCourtsLoading);
  const error = useAppSelector(selectCourtsError);
  const user = useAppSelector((state) => state.user.data);

  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const loadCourts = async () => {
    if (user?.token) {
      try {
        await dispatch(fetchCourts(user.token)).unwrap();
      } catch (err) {
        Alert.alert('Error', 'Failed to load courts. Please try again.');
      }
    }
  };

  useEffect(() => {
    loadCourts();
  }, [user?.token]);

  useEffect(() => {
    // Start animations only after courts are loaded
    if (courts.length > 0 || loading === 'succeeded') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600, // Reduced duration
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600, // Reduced duration
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [courts.length, loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCourts();
    setRefreshing(false);
  };

  const handleCourtPress = (court: any) => {
    if (court.status === 'available') {
      // Navigate to practice booking with pre-selected court
      Alert.alert(
        'Schedule Practice',
        `Would you like to schedule a practice on ${court.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Schedule Practice',
            onPress: () => {
              // Navigate to practice booking with court pre-selected
              router.push('/screens/coach-booking/practiceBooking');
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Court Information',
        `${court.name} is currently ${getStatusText(court.status).toLowerCase()}.${
          court.current_event
            ? `\n\nCurrent activity: ${court.current_event.title}\nEnds at: ${formatTime(court.current_event.end_time)}`
            : ''
        }`
      );
    }
  };

  const renderCourtCard = (court: any, index: number) => {
    const statusColor = getStatusColor(court.status);
    const isAvailable = court.status === 'available';

    return (
      <View key={court.id}>
        <TouchableOpacity
          style={{
            marginBottom: 20,
            borderRadius: 20,
            overflow: 'hidden',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          activeOpacity={0.9}
          onPress={() => handleCourtPress(court)}
        >
          {/* Card Background with Gradient */}
          <LinearGradient
            colors={isAvailable
              ? ['#1A1A1A', '#2D2D2D']
              : ['#2A1A1A', '#3D2D2D']
            }
            style={{
              padding: 20,
              borderWidth: 2,
              borderColor: isAvailable ? COLORS.success + '40' : statusColor + '20',
            }}
          >
            {/* Coach Badge */}
            <View style={{
              position: 'absolute',
              top: 15,
              right: 15,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: COLORS.primary + '20',
            }}>
              <FontAwesome5 name="chalkboard-teacher" size={12} color={COLORS.primary} />
              <Text style={{
                color: COLORS.primary,
                fontSize: 10,
                fontWeight: '600',
                marginLeft: 4,
              }}>
                COACH VIEW
              </Text>
            </View>

            {/* Availability Indicator */}
            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              backgroundColor: statusColor + '20',
              borderBottomLeftRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FontAwesome5 name={getStatusIcon(court.status)} size={16} color={statusColor} />
            </View>

            {/* Court Header */}
            <View style={{ marginBottom: 16, marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <FontAwesome5 name="basketball-ball" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: COLORS.text,
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 2,
                  }}>
                    {court.name}
                  </Text>
                  {court.location_name && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={14} color={COLORS.textSecondary} />
                      <Text style={{
                        color: COLORS.textSecondary,
                        fontSize: 14,
                        marginLeft: 4,
                      }}>
                        {court.location_name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Status Badge */}
              <View
                style={{
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: statusColor + '20',
                  borderWidth: 1,
                  borderColor: statusColor + '40',
                }}
              >
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: statusColor,
                  marginRight: 8,
                }} />
                <Text style={{
                  color: statusColor,
                  fontSize: 13,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {getStatusText(court.status)}
                </Text>
              </View>
            </View>

            {/* Current Event Info */}
            {court.current_event && (
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.primary,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <FontAwesome5
                      name={court.current_event.type === 'practice' ? 'basketball-ball' : 'trophy'}
                      size={14}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: COLORS.text,
                      fontSize: 15,
                      fontWeight: '600',
                      marginBottom: 2,
                    }}>
                      {court.current_event.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time" size={14} color={COLORS.textSecondary} />
                      <Text style={{
                        color: COLORS.textSecondary,
                        fontSize: 13,
                        marginLeft: 6,
                      }}>
                        Ends at {formatTime(court.current_event.end_time)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Coach Action Section */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}>
              <Text style={{
                color: COLORS.textSecondary,
                fontSize: 14,
                fontWeight: '500',
              }}>
                {isAvailable ? 'Schedule practice here' : 'View activity details'}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isAvailable ? COLORS.primary + '20' : COLORS.textSecondary + '20',
              }}>
                <Ionicons
                  name={isAvailable ? 'calendar' : 'information-circle'}
                  size={16}
                  color={isAvailable ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={{
                  color: isAvailable ? COLORS.primary : COLORS.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                  marginLeft: 6,
                }}>
                  {isAvailable ? 'SCHEDULE' : 'INFO'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const SkeletonCard = () => (
    <View style={{
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      height: 180,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: COLORS.cardDark,
          marginRight: 12,
        }} />
        <View style={{ flex: 1 }}>
          <View style={{
            height: 20,
            backgroundColor: COLORS.cardDark,
            borderRadius: 4,
            marginBottom: 8,
            width: '70%',
          }} />
          <View style={{
            height: 16,
            backgroundColor: COLORS.cardDark,
            borderRadius: 4,
            width: '50%',
          }} />
        </View>
      </View>
    </View>
  );

  if (loading === 'pending' && courts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.cardDark,
          }}
        >
          <BackButton />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: 'bold' }}>
              RISE Courts
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 2 }}>
              Loading courts...
            </Text>
          </View>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.cardDark,
        }}
      >
        <BackButton />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: 'bold' }}>
            RISE Courts
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 2 }}>
            Coach view - Schedule practices & monitor activities
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Ionicons
            name="refresh"
            size={24}
            color={refreshing ? COLORS.textSecondary : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Coach Summary Stats */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={['#1A1A1A', '#2D2D2D']}
            style={{
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <FontAwesome5 name="chalkboard-teacher" size={20} color={COLORS.primary} />
              <Text style={{
                color: COLORS.text,
                fontSize: 18,
                fontWeight: 'bold',
                marginLeft: 12,
              }}>
                Coach Dashboard
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.success + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{
                    color: COLORS.success,
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                    {courts.filter(c => c.status === 'available').length}
                  </Text>
                </View>
                <Text style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  Available
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.danger + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{
                    color: COLORS.danger,
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                    {courts.filter(c => c.status === 'in_use').length}
                  </Text>
                </View>
                <Text style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  In Use
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{
                    color: COLORS.primary,
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                    {courts.length}
                  </Text>
                </View>
                <Text style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  Total Courts
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Error State */}
        {error && (
          <View
            style={{
              backgroundColor: COLORS.danger + '20',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <FontAwesome5 name="exclamation-triangle" size={20} color={COLORS.danger} />
            <Text style={{ color: COLORS.danger, marginLeft: 12, flex: 1 }}>
              {error}
            </Text>
          </View>
        )}

        {/* Courts List */}
        {courts.length === 0 && loading !== 'pending' ? (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <LinearGradient
              colors={['#1A1A1A', '#2D2D2D']}
              style={{
                borderRadius: 20,
                padding: 40,
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <FontAwesome5 name="basketball-ball" size={36} color={COLORS.primary} />
              </View>
              <Text style={{
                color: COLORS.text,
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                No Courts Available
              </Text>
              <Text style={{
                color: COLORS.textSecondary,
                fontSize: 15,
                textAlign: 'center',
                lineHeight: 22,
              }}>
                We couldn't find any courts at the moment.{'\n'}Pull down to refresh and try again.
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {courts.map((court, index) => renderCourtCard(court, index))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoachCourtsScreen;
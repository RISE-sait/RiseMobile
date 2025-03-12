import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');


const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const router = useRouter();
  const { loginWithGoogle } = useAuth(); // ✅ Get loginWithGoogle from useAuth

  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoSize = useRef(new Animated.Value(1)).current;
  
  // Refs for inputs
  const passwordRef = useRef(null);
  
  useEffect(() => {
    // Animate elements when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoSize, {
          toValue: 1.2, // Make the animation slightly larger
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoSize, {
          toValue: 1, // Bring it back to normal size
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const user = await loginWithGoogle();
      Alert.alert("Login Successful", `Welcome, ${user.displayName}`);
    } catch (error) {
      setErrors({ general: "Google login failed. Please try again." });
      // Trigger haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Login Handler
  const handleLogin = async () => {
    const newErrors = {};
    
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Trigger haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    try {
      setIsLoading(true);
      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const user = await login(email, password);
      console.log("User logged in:", user);
    } catch (error) {
      console.error("Failed to login:", error);
      setErrors({ general: "Invalid email or password. Please try again." });
      // Trigger haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={["#000", "#000", "rgba(0,0,0,0.9)", "#121212"]} // Extra black layer
              style={styles.gradientBackground}
            >
              
              {/* Logo and Header */}
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { 
                    transform: [
                      { scale: logoSize }
                    ] 
                  }
                ]}
              >
                <Image
                  source={images.onboarding}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
              
              <View style={styles.headerContainer}>
                <Animated.Text 
                  style={[
                    styles.welcomeText,
                    { 
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  WELCOME BACK
                </Animated.Text>
                
                <Animated.View
                  style={[
                    styles.titleContainer,
                    { 
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  <Text style={styles.titleText}>
                    READY TO CONTINUE{"\n"}
                    <Text style={styles.highlightText}>YOUR JOURNEY</Text>
                  </Text>
                </Animated.View>
              </View>
              
              {/* Form Container */}
              <Animated.View 
                style={[
                  styles.formContainer,
                  { 
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper, 
                    emailFocused && styles.inputWrapperFocused,
                    errors.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={emailFocused ? "#FFD700" : "#9EA0A4"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      placeholder="Email address"
                      placeholderTextColor="#9EA0A4"
                      style={styles.input}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({...errors, email: null});
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper, 
                    passwordFocused && styles.inputWrapperFocused,
                    errors.password && styles.inputError
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={passwordFocused ? "#FFD700" : "#9EA0A4"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      ref={passwordRef}
                      placeholder="Password"
                      placeholderTextColor="#9EA0A4"
                      style={styles.input}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({...errors, password: null});
                      }}
                      secureTextEntry={!passwordVisible}
                      returnKeyType="done"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity 
                      style={styles.visibilityIcon}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Ionicons 
                        name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9EA0A4" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>
                
                <TouchableOpacity style={styles.forgotPasswordLink}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>LOG IN</Text>
                        <Ionicons name="log-in-outline" size={20} color="#000" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Sign Up Link */}
                <TouchableOpacity
                  style={styles.signupLink}
                  onPress={() => router.push('/(auth)/signup')}
                >
                  <Text style={styles.signupText}>
                    DON'T HAVE AN ACCOUNT? <Text style={styles.signupHighlight}>SIGN UP</Text>
                  </Text>
                </TouchableOpacity>
                
                {/* Social Login Options */}
                <View style={styles.socialContainer}>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR LOGIN WITH</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={handleGoogleLogin}
                    >
                      <Image source={icons.google} style={styles.socialIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Image source={icons.apple} style={styles.socialIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Image source={icons.facebook} style={styles.socialIcon} resizeMode="contain" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
      {/* Error message */}
      {errors.general && (
        <View style={styles.errorToast}>
          <Ionicons name="alert-circle" size={24} color="#FFF" />
          <Text style={styles.errorToastText}>{errors.general}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 50, // Push logo down from top
    marginBottom: 80, // More space below logo to move form down
  },  
  logo: {
    width: width * 0.8, // Increase width to 80% of screen width
    height: 220, // Adjust height for better visibility
    resizeMode: "contain", // Ensure it scales properly
  },  
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
    marginTop: -30,
  },
  titleContainer: {
    marginTop: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  highlightText: {
    color: '#FFD700',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 10,
  },
  inputWrapperFocused: {
    borderBottomColor: '#FFD700',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
  },
  inputError: {
    borderBottomColor: '#FF4D4F',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 30,
  },
  visibilityIcon: {
    padding: 5,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFD700',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  signupHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#9EA0A4',
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  errorToast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorToastText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  
});

export default LoginScreen;
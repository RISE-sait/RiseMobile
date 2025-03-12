import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import images from "@/constants/images";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/app/utils/auth";
import CountryPicker, { Country } from "react-native-country-picker-modal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const SignUpScreen = () => {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState({
    cca2: "US",
    name: "United States",
  });
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [recentCountries, setRecentCountries] = useState([
    { cca2: "US", name: "United States" },
    { cca2: "CA", name: "Canada" },
    { cca2: "GB", name: "United Kingdom" },
    { cca2: "AU", name: "Australia" },
  ]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoSize = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  
  // Refs for inputs to enable auto-focus
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  
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
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoSize, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Animation for success screen
  const animateSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    
    if (!password) newErrors.password = "Password is required";
    else if (!validatePassword(password)) newErrors.password = "Password must be at least 8 characters";
    
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    
    if (!role) newErrors.role = "Please select a role";
    
    if (role === "athlete" && !dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
  
    try {
      // Calculate Age
      const birthYear = dateOfBirth ? parseInt(dateOfBirth.split("-")[0]) : null;
      const currentYear = new Date().getFullYear();
      const age = birthYear ? currentYear - birthYear : null;
  
      if (!age || age < 13) {
        setErrors({ dateOfBirth: "You must be at least 13 years old." });
        return;
      }
  
      // Determine API Endpoint
      const isCustomer = role === "athlete" || role === "parent";
      const endpoint = isCustomer ? "customers/register" : "staff/register";
  
      // Construct Payload
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        age,
        role,
        phone_number: phoneNumber,
        country_code: country.cca2,
        has_consent_to_email_marketing: true,  // Defaulting to true, modify if needed
        has_consent_to_sms: true,             // Defaulting to true, modify if needed
        waivers: [
          {
            is_waiver_signed: true,          // You might need to dynamically update this
            waiver_url: "https://example.com/waiver.pdf"
          }
        ]
      };
  
      // Trigger haptic feedback for submission
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
  
      console.log("📡 Sending Sign-Up Request:", endpoint, payload);
  
      // Send request to your register function (assumed to handle API calls)
      const response = await register(
        email,
        password,
        firstName,
        lastName,
        role,
        age,
        phoneNumber,
        country.cca2 // Country Code
      );
        
      console.log("✅ Registration Successful:", response);
  
      // Show verification pending screen
      setRegistrationComplete(true);
      animateSuccess();
  
      // Save country to recent countries if not already there
      if (!recentCountries.some(c => c.cca2 === country.cca2)) {
        setRecentCountries(prev => [country, ...prev.slice(0, 3)]);
      }
  
    } catch (error) {
      console.error("❌ Signup failed:", error);
      setErrors({ general: "Registration failed. Please try again." });
  
      // Trigger haptic feedback for error
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };
  

  const renderRoleIcon = () => {
    switch (role) {
      case "athlete":
        return <FontAwesome5 name="basketball-ball" size={18} color="#FFD700" />;
      case "coach":
        return <FontAwesome5 name="chalkboard-teacher" size={18} color="#FFD700" />;
      case "parent":
        return <Ionicons name="people" size={18} color="#FFD700" />;
      case "instructor":
        return <MaterialCommunityIcons name="whistle" size={18} color="#FFD700" />;
      default:
        return <Ionicons name="person-outline" size={18} color="#9EA0A4" />;
    }
  };

  const renderStep1 = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({...errors, email: null});
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            ref={passwordRef}
            placeholder="Password (min. 8 characters)"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({...errors, password: null});
            }}
            secureTextEntry={!passwordVisible}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
        
        {/* Password strength indicator */}
        {password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View 
                style={[
                  styles.strengthBar, 
                  { 
                    width: `${Math.min((password.length / 12) * 100, 100)}%`,
                    backgroundColor: password.length < 8 ? '#FF4D4F' : 
                                    password.length < 10 ? '#FFA500' : '#4CAF50'
                  }
                ]} 
              />
            </View>
            <Text style={styles.strengthText}>
              {password.length < 8 ? 'Weak' : 
               password.length < 10 ? 'Good' : 'Strong'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            ref={confirmPasswordRef}
            placeholder="Confirm password"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
            }}
            secureTextEntry={!confirmPasswordVisible}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.visibilityIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Ionicons 
              name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#9EA0A4" 
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (email && password && confirmPassword && password === confirmPassword) {
            setStep(2);
            // Trigger haptic feedback for step change
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          } else {
            validateForm();
          }
        }}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* First Name */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) setErrors({...errors, firstName: null});
            }}
          />
        </View>
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>
  
      {/* Last Name */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) setErrors({...errors, lastName: null});
            }}
          />
        </View>
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>
  
      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="calendar-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.dateOfBirth && styles.inputError]}
            value={dateOfBirth}
            onChangeText={(text) => {
              setDateOfBirth(text);
              if (errors.dateOfBirth) setErrors({...errors, dateOfBirth: null});
            }}
            keyboardType="numeric"
          />
        </View>
        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
      </View>
  
      {/* Role Selection */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.inputWrapper, errors.role && styles.inputError]}
          onPress={() => setRoleModalVisible(true)}
        >
          {renderRoleIcon()}
          <Text style={[styles.pickerText, role ? styles.activePickerText : {}]}>
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Select your role"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9EA0A4" style={styles.dropdownIcon} />
        </TouchableOpacity>
        {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
      </View>
  
      {/* Phone Number */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9EA0A4"
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errors.phoneNumber) setErrors({...errors, phoneNumber: null});
            }}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>
  
      {/* Country Picker */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setCountryPickerVisible(true)}
        >
          <Ionicons name="globe-outline" size={20} color="#9EA0A4" style={styles.inputIcon} />
          <Text style={[styles.pickerText, country ? styles.activePickerText : {}]}>
            {country ? country.name : "Select your country"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9EA0A4" style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>
  
      {/* Country Picker Modal */}
      {countryPickerVisible && (
        <CountryPicker
          withFilter
          withFlag
          withCountryNameButton
          withAlphaFilter
          withEmoji
          countryCode={country?.cca2 || "US"}
          onSelect={(selectedCountry) => {
            setCountry(selectedCountry);
            setCountryPickerVisible(false);
          }}
          onClose={() => setCountryPickerVisible(false)}
          visible={true}
        />
      )}
  
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
  

  // Role Picker Modal
  const renderRoleModal = () => (
    <Modal
      visible={roleModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setRoleModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setRoleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Your Role</Text>
              
              <TouchableOpacity 
                style={styles.roleOption}
                onPress={() => {
                  setRole("athlete");
                  setRoleModalVisible(false);
                  // Trigger haptic feedback
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                <View style={styles.roleIconContainer}>
                  <FontAwesome5 name="basketball-ball" size={24} color="#FFD700" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Athlete</Text>
                  <Text style={styles.roleDescription}>Players looking to improve their game</Text>
                </View>
                {role === "athlete" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.roleOption}
                onPress={() => {
                  setRole("coach");
                  setRoleModalVisible(false);
                  // Trigger haptic feedback
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                <View style={styles.roleIconContainer}>
                  <FontAwesome5 name="chalkboard-teacher" size={24} color="#FFD700" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Coach</Text>
                  <Text style={styles.roleDescription}>Team coaches and trainers</Text>
                </View>
                {role === "coach" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.roleOption}
                onPress={() => {
                  setRole("parent");
                  setRoleModalVisible(false);
                  // Trigger haptic feedback
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                <View style={styles.roleIconContainer}>
                  <Ionicons name="people" size={24} color="#FFD700" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Parent</Text>
                  <Text style={styles.roleDescription}>Parents of young athletes</Text>
                </View>
                {role === "parent" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.roleOption}
                onPress={() => {
                  setRole("instructor");
                  setRoleModalVisible(false);
                  // Trigger haptic feedback
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialCommunityIcons name="whistle" size={24} color="#FFD700" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>Instructor</Text>
                  <Text style={styles.roleDescription}>Specialized skills instructors</Text>
                </View>
                {role === "instructor" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Registration Complete Screen
  const renderRegistrationComplete = () => (
    <View style={styles.successContainer}>
      <Animated.View 
        style={[
          styles.successCircle,
          {
            opacity: successAnim,
            transform: [{ scale: checkmarkScale }]
          }
        ]}
      >
        <Ionicons name="checkmark" size={80} color="#FFD700" />
      </Animated.View>
      
      <Animated.Text 
        style={[
          styles.successTitle,
          { opacity: successAnim }
        ]}
      >
        Registration Complete!
      </Animated.Text>
      
      <Animated.Text 
        style={[
          styles.successMessage,
          { opacity: successAnim }
        ]}
      >
        Your account is pending verification by our team. You'll receive an email when your account is approved and ready to use.
      </Animated.Text>
      
      <Animated.View
        style={[
          styles.successInfo,
          { opacity: successAnim }
        ]}
      >
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Verification email sent to:</Text>
        </View>
        <Text style={styles.infoValue}>{email}</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Estimated approval time:</Text>
        </View>
        <Text style={styles.infoValue}>24-48 hours</Text>
      </Animated.View>
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace("/(auth)/login")}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>GO TO LOGIN</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      {registrationComplete ? (
        renderRegistrationComplete()
      ) : (
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
                colors={['rgba(0,0,0,0.9)', '#121212']}
                style={styles.gradientBackground}
              >
                {/* Basketball court lines background */}
                <View style={styles.courtLinesContainer}>
                  <View style={styles.courtLine} />
                  <View style={styles.courtCircle} />
                  <View style={[styles.courtLine, { top: height * 0.4 }]} />
                </View>
                
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
                      styles.joinText,
                      { 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    JOIN RISE TODAY
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
                      LET'S GET YOU STARTED{"\n"}
                      <Text style={styles.highlightText}>ON YOUR JOURNEY</Text>
                    </Text>
                  </Animated.View>
                </View>
                
                {/* Step indicator */}
                <View style={styles.stepIndicator}>
                  <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]} />
                  <View style={styles.stepLine} />
                  <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]} />
                </View>
                
                {/* Form Steps */}
                <View style={styles.formContainer}>
                  {step === 1 ? renderStep1() : renderStep2()}
                </View>
                
                {/* Login Link */}
                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => router.replace("/(auth)/login")}
                >
                  <Text style={styles.loginText}>
                    ALREADY HAVE AN ACCOUNT? <Text style={styles.loginHighlight}>LOG IN</Text>
                  </Text>
                </TouchableOpacity>
                
                {/* Social Sign Up Options */}
                {step === 1 && (
                  <View style={styles.socialContainer}>
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
                      <View style={styles.divider} />
                    </View>
                    
                    <View style={styles.socialButtonsContainer}>
                      <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome5 name="google" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome5 name="apple" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome5 name="facebook" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
      
      {/* Role Modal */}
      {renderRoleModal()}
      
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
  courtLinesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  courtLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    top: height * 0.2,
  },
  courtCircle: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 2,
    borderColor: '#FFD700',
    top: height * 0.25,
    left: width * 0.25,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: width * 0.5,
    height: 80,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  joinText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  activeStepDot: {
    backgroundColor: '#FFD700',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 5,
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
  pickerText: {
    flex: 1,
    color: '#9EA0A4',
    fontSize: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  activePickerText: {
    color: '#FFFFFF',
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    flex: 2,
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
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loginHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 30,
    paddingHorizontal: 30,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roleDescription: {
    fontSize: 12,
    color: '#9EA0A4',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 10,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeModalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Password strength indicator
  passwordStrengthContainer: {
    marginTop: 8,
    marginLeft: 30,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#9EA0A4',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#000',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#9EA0A4',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  successInfo: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    color: '#9EA0A4',
    fontSize: 14,
    marginLeft: 10,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 30,
    marginBottom: 15,
  },
  loginButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
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

export default SignUpScreen;
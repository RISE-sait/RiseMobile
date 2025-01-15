import { router } from 'expo-router';
import { View } from 'react-native';

const SignUpScreen = () => {
  const handleSignUp = async (email: string, password: string, role: string) => {
    // Call your backend API to register the user
    router.replace('/(auth)/login');
  };

  return (
    <View>
      {/* Sign-up form */}
    </View>
  );
};

export default SignUpScreen;
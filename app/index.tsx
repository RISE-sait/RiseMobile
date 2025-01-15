import { Redirect } from 'expo-router';
import { useAuth } from './utils/auth';

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'athlete') {
    return <Redirect href="/(athlete)/home" />;
  } else if (user.role === 'instructor') {
    return <Redirect href="/(instructor)/home" />;
  } else if (user.role === 'coach') {
    return <Redirect href="/(coach)/home" />;
  }

  return null;
}
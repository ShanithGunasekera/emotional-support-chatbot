import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" options={{ headerShown: true, title: 'Chat with Companion' }} />
            <Stack.Screen name="login" options={{ headerShown: true, title: 'Login', presentation: 'modal' }} />
            <Stack.Screen name="register" options={{ headerShown: true, title: 'Register', presentation: 'modal' }} />
            <Stack.Screen name="profile" options={{ headerShown: true, title: 'Your Profile', presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
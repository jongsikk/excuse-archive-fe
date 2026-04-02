import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, initializeAuth } = useAuthStore();
  const { initializeTheme, initialized } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    if (!initialized) initializeTheme();
  }, [initializeAuth, initialized, initializeTheme]);

  useEffect(() => {
    if (token === null) {
      router.replace('/login');
    }
  }, [token]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { isDark } = useThemeStore();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const headerBg = isDark ? '#192120' : '#f7f9fe';
  const headerTint = isDark ? '#dce4e2' : '#2c333a';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: headerBg },
            headerTintColor: headerTint,
            headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="records/new" options={{ headerShown: false }} />
          <Stack.Screen name="records/[id]" options={{ title: '기록 상세' }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}

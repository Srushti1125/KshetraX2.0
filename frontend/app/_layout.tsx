import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* FIRST SCREEN */}
        <Stack.Screen name="login" />

        {/* AFTER LOGIN */}
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="+not-found" />

      </Stack>

      <StatusBar style="auto" />
    </>
  );
}

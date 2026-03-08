import "react-native-reanimated";
import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function RootLayout() {
  // Initialize store hydration
  useEffect(() => {
    useAuthStore.getState().setHydrated(true);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

import "react-native-reanimated";
import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";
// expo-notifications is not importable in Expo Go SDK 53+.
// Push notification tap handling works only in dev builds.
// The polling mechanism in the home screen handles the redirect in Expo Go.

export default function RootLayout() {
  useEffect(() => {
    useAuthStore.getState().setHydrated(true);
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <Toast />
    </>
  );
}

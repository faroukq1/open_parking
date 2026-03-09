import "react-native-reanimated";
import "../global.css";

import { useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Initialize store hydration
  useEffect(() => {
    useAuthStore.getState().setHydrated(true);
  }, []);

  // Listen for notification taps
  useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        if (data?.screen === "parking") {
          router.push("/(app)/parking?mode=booking");
        }
      });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
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

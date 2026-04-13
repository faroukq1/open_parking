import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  return <Redirect href={user ? "/(app)" : "/(auth)/login"} />;
}

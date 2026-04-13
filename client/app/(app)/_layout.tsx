import { Redirect, Tabs } from "expo-router";
import { Home, MapPin, User } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";

const ICON_WIDTH = 64; // each tab item width

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom + 16,
          height: 64,
          width: 300,
          borderRadius: 20,
          backgroundColor: "#2D3139",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 12,
          paddingTop: 10,
          marginHorizontal: 30,
        },
        tabBarItemStyle: {
          height: 64,
          width: ICON_WIDTH,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIcon: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center ${focused ? "bg-zinc-600" : ""}`}
            >
              <Home
                size={20}
                color={focused ? "#fff" : "#9CA3AF"}
                strokeWidth={1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center ${focused ? "bg-zinc-600" : ""}`}
            >
              <MapPin
                size={20}
                color={focused ? "#fff" : "#9CA3AF"}
                strokeWidth={1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center ${focused ? "bg-zinc-600" : ""}`}
            >
              <User
                size={20}
                color={focused ? "#fff" : "#9CA3AF"}
                strokeWidth={1.8}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

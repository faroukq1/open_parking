import { useRouter } from "expo-router";
import {
  Bell,
  Car,
  ChevronRight,
  Clock,
  Home,
  LogOut,
  Moon,
  Phone,
  Shield,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";

function SectionTitle({ label }: { label: string }) {
  return (
    <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 mt-6 px-1">
      {label}
    </Text>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
  right,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-3.5 bg-white border-b border-zinc-100 last:border-0"
    >
      <View
        className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${danger ? "bg-red-50" : "bg-zinc-100"}`}
      >
        <Icon
          size={16}
          color={danger ? "#EF4444" : "#52525B"}
          strokeWidth={1.8}
        />
      </View>
      <Text
        className={`flex-1 text-[14.5px] font-medium ${danger ? "text-red-500" : "text-zinc-800"}`}
      >
        {label}
      </Text>
      {value && <Text className="text-zinc-400 text-[13px] mr-2">{value}</Text>}
      {right ??
        (onPress && !right && (
          <ChevronRight size={16} color="#D4D4D8" strokeWidth={2} />
        ))}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-zinc-500">Loading...</Text>
      </View>
    );
  }

  const handleLogOut = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      className="flex-1 bg-zinc-50"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <Text className="text-[22px] font-semibold text-zinc-900 tracking-tight mb-6">
        Profile
      </Text>

      {/* ── Avatar card ── */}
      <View
        className="bg-white rounded-2xl p-5 flex-row items-center mb-1"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Avatar */}
        <View className="w-16 h-16 rounded-full bg-[#2D3139] items-center justify-center mr-4">
          <Text className="text-white text-[24px] font-bold">
            {user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-zinc-900 text-[17px] font-semibold">
            {user.full_name}
          </Text>
          <Text className="text-zinc-400 text-[13px] mt-0.5">{user.email}</Text>
          <View className="flex-row items-center mt-2 gap-2">
            <View className="bg-zinc-100 rounded-full px-2.5 py-0.5">
              <Text className="text-zinc-600 text-[11px] font-medium capitalize">
                {user.user_type}
              </Text>
            </View>
            {user.room_number && (
              <View className="bg-zinc-100 rounded-full px-2.5 py-0.5">
                <Text className="text-zinc-600 text-[11px] font-medium">
                  Room {user.room_number}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View className="flex-row gap-3 mt-3 mb-1">
        {[
          {
            label: "Vehicles",
            value:
              user.vehicles && user.vehicles.length > 0
                ? user.vehicles.length
                : 0,
          },
          { label: "Hours Parked", value: 0 },
          { label: "Member Since", value: "Mar 26" },
        ].map((stat) => (
          <View
            key={stat.label}
            className="flex-1 bg-white rounded-2xl items-center py-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text className="text-zinc-900 text-[20px] font-bold">
              {stat.value}
            </Text>
            <Text className="text-zinc-400 text-[11px] mt-0.5">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Account ── */}
      <SectionTitle label="Account" />
      <View className="rounded-2xl overflow-hidden border border-zinc-100">
        <Row
          icon={User}
          label="Full Name"
          value={user.full_name.toString()}
          onPress={() => {}}
        />
        <Row icon={Phone} label="Phone" value={user.phone} onPress={() => {}} />
        {user.room_number && (
          <Row
            icon={Home}
            label="Room Number"
            value={user.room_number}
            onPress={() => {}}
          />
        )}
      </View>

      {/* ── My Vehicle ── */}
      <SectionTitle label="My Vehicle" />
      <View className="rounded-2xl overflow-hidden border border-zinc-100">
        {user.vehicles && user.vehicles.length > 0 ? (
          user.vehicles.map((vehicle) => (
            <Row
              key={vehicle.id}
              icon={Car}
              label="License Plate"
              value={vehicle.plate_number}
              onPress={() => {}}
            />
          ))
        ) : (
          <Row icon={Car} label="No vehicles" onPress={() => {}} />
        )}
        <Row
          icon={Clock}
          label="Last Booking"
          value="Today, 14:20"
          onPress={() => {}}
        />
      </View>

      {/* ── Security ── */}
      <SectionTitle label="Security" />
      <View className="rounded-2xl overflow-hidden border border-zinc-100">
        <Row icon={Shield} label="Change Password" onPress={() => {}} />
      </View>

      {/* ── Logout ── */}
      <SectionTitle label="" />
      <View className="rounded-2xl overflow-hidden border border-red-100">
        <Row icon={LogOut} label="Log Out" danger onPress={handleLogOut} />
      </View>

      {/* ── Version ── */}
      <Text className="text-center text-zinc-300 text-[12px] mt-6">
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

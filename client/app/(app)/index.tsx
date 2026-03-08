import { Car, CheckCircle, Clock, MapPin } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";

// ── Mock data for booking (TODO: replace with actual booking data) ──
const BOOKING = {
  spot: 5,
  status: "active",
  enteredAt: "14:20",
  car: "12345-111-16",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-zinc-500">Loading...</Text>
      </View>
    );
  }

  const fullName = user.full_name.toString();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 100,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-[13px] text-zinc-400 mb-0.5">
            Good afternoon,
          </Text>
          <Text className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            {fullName} 👋
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-zinc-100 items-center justify-center">
          <Text className="text-[15px] font-semibold text-zinc-600">
            {fullName[0]}
          </Text>
        </View>
      </View>

      {/* ── Active booking card ── */}
      <View
        className="bg-[#2D3139] rounded-2xl p-5 mb-6"
        style={{
          shadowColor: "#2D3139",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-zinc-400 text-[13px] font-medium">
            Active Booking
          </Text>
          <View className="flex-row items-center bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
            <Text className="text-emerald-400 text-[11px] font-semibold">
              PARKED
            </Text>
          </View>
        </View>

        <View className="flex-row items-end justify-between mb-5">
          <View>
            <Text className="text-white text-[36px] font-bold tracking-tight leading-none">
              #{BOOKING.spot}
            </Text>
            <Text className="text-zinc-400 text-[13px] mt-1">Spot number</Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-[18px] font-semibold">
              {BOOKING.car}
            </Text>
            <Text className="text-zinc-400 text-[12px] mt-0.5">
              License plate
            </Text>
          </View>
        </View>

        <View className="h-px bg-zinc-700 mb-4" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={14} color="#9CA3AF" strokeWidth={1.8} />
            <Text className="text-zinc-400 text-[13px] ml-1.5">
              Entered at{" "}
              <Text className="text-white font-medium">
                {BOOKING.enteredAt}
              </Text>
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-zinc-700 px-3 py-1.5 rounded-lg">
              <Text className="text-zinc-200 text-[12px] font-medium">
                Extend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-red-500/20 px-3 py-1.5 rounded-lg">
              <Text className="text-red-400 text-[12px] font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Quick actions ── */}
      <Text className="text-[13px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Quick Actions
      </Text>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          className="flex-1 bg-zinc-900 rounded-2xl p-4 items-center justify-center"
          style={{ minHeight: 90 }}
          activeOpacity={0.85}
        >
          <MapPin size={22} color="#fff" strokeWidth={1.8} />
          <Text className="text-white text-[13px] font-medium mt-2 text-center">
            Book a Spot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-zinc-100 rounded-2xl p-4 items-center justify-center"
          style={{ minHeight: 90 }}
          activeOpacity={0.85}
        >
          <Car size={22} color="#3F3F46" strokeWidth={1.8} />
          <Text className="text-zinc-700 text-[13px] font-medium mt-2 text-center">
            My Car
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Status row ── */}
      <Text className="text-[13px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Parking Status
      </Text>
      <View className="border border-zinc-100 rounded-2xl overflow-hidden mb-6">
        {[
          {
            label: "Available Spots",
            value: "8 / 20",
            icon: CheckCircle,
            color: "#10B981",
          },
          {
            label: "Your Room",
            value: user.room_number ? `Room ${user.room_number}` : "N/A",
            icon: null,
            color: null,
          },
          {
            label: "Guest Type",
            value:
              user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1),
            icon: null,
            color: null,
          },
        ].map((item, i) => (
          <View
            key={i}
            className={`flex-row items-center justify-between px-4 py-3.5 ${
              i !== 2 ? "border-b border-zinc-100" : ""
            }`}
          >
            <Text className="text-[14px] text-zinc-500">{item.label}</Text>
            <View className="flex-row items-center gap-1.5">
              {item.icon && (
                <item.icon size={14} color={item.color!} strokeWidth={2} />
              )}
              <Text className="text-[14px] font-semibold text-zinc-900">
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Recent activity ── */}
      <Text className="text-[13px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Recent Activity
      </Text>
      <View className="gap-3">
        {[
          {
            label: "Car entered",
            time: "Today 14:20",
            color: "bg-emerald-100",
            text: "text-emerald-700",
          },
          {
            label: "Booking confirmed",
            time: "Today 13:55",
            color: "bg-blue-100",
            text: "text-blue-700",
          },
          {
            label: "Car registered",
            time: "Yesterday 09:10",
            color: "bg-zinc-100",
            text: "text-zinc-600",
          },
        ].map((item, i) => (
          <View key={i} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                className={`w-2 h-2 rounded-full ${item.color.replace("100", "400")}`}
              />
              <Text className="text-[14px] text-zinc-700">{item.label}</Text>
            </View>
            <Text className="text-[12px] text-zinc-400">{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

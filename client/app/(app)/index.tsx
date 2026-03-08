import { Car, CheckCircle, Clock, MapPin } from "lucide-react-native";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import {
  fetchActiveBooking,
  fetchAvailableSpots,
  fetchBookingHistory,
  type ActiveBooking,
  type AvailableSpots,
  type BookingHistory,
} from "@/lib/parkingApi";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(
    null,
  );
  const [availableSpots, setAvailableSpots] = useState<AvailableSpots | null>(
    null,
  );
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [booking, spots, history] = await Promise.all([
          fetchActiveBooking(String(user.id)),
          fetchAvailableSpots(),
          fetchBookingHistory(String(user.id), 3),
        ]);

        setActiveBooking(booking);
        setAvailableSpots(spots);
        setBookingHistory(history);
      } catch (err: any) {
        console.error("Error fetching home screen data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-zinc-500">Loading...</Text>
      </View>
    );
  }

  const fullName = user.full_name.toString();

  // Format time string (convert ISO or other format to readable time)
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  // Format date for recent activity
  const formatActivityDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return `Today ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return dateString;
    }
  };

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
      {loading ? (
        <View className="bg-zinc-100 rounded-2xl p-6 mb-6 items-center justify-center h-32">
          <ActivityIndicator size="small" color="#9CA3AF" />
          <Text className="text-zinc-400 text-[13px] mt-2">
            Loading booking...
          </Text>
        </View>
      ) : activeBooking ? (
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
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full ${
                activeBooking.status === "PARKED"
                  ? "bg-emerald-500/20"
                  : "bg-blue-500/20"
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  activeBooking.status === "PARKED"
                    ? "bg-emerald-400"
                    : "bg-blue-400"
                }`}
              />
              <Text
                className={`text-[11px] font-semibold ${
                  activeBooking.status === "PARKED"
                    ? "text-emerald-400"
                    : "text-blue-400"
                }`}
              >
                {activeBooking.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-end justify-between mb-5">
            <View>
              <Text className="text-white text-[36px] font-bold tracking-tight leading-none">
                #{activeBooking.spot_number}
              </Text>
              <Text className="text-zinc-400 text-[13px] mt-1">
                Spot number
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-[18px] font-semibold">
                {user?.vehicles?.[0]?.plate_number ||
                  activeBooking.plate_number ||
                  "N/A"}
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
                  {formatTime(activeBooking.entered_at)}
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
      ) : (
        <View
          className="bg-[#2D3139] rounded-2xl p-5 mb-6 items-center justify-center h-32"
          style={{
            shadowColor: "#2D3139",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text className="text-zinc-400 text-[14px] font-medium">
            No active booking
          </Text>
          <Text className="text-zinc-500 text-[13px] mt-1">
            Book a spot to get started
          </Text>
        </View>
      )}

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
            value: loading
              ? "..."
              : `${availableSpots?.available ?? 0} / ${availableSpots?.total ?? 0}`,
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
      {loading ? (
        <View className="items-center justify-center py-6">
          <ActivityIndicator size="small" color="#9CA3AF" />
          <Text className="text-zinc-400 text-[13px] mt-2">Loading...</Text>
        </View>
      ) : bookingHistory.length > 0 ? (
        <View className="gap-3">
          {bookingHistory.map((booking, i) => {
            // Determine activity label based on status
            let label = "Booking";
            if (booking.status === "PARKED") label = "Car parked";
            else if (booking.status === "RESERVED") label = "Spot reserved";
            else if (booking.status === "COMPLETED")
              label = "Booking completed";

            // Determine color based on status
            let colors = {
              bg: "bg-zinc-100",
              text: "text-zinc-600",
              dot: "bg-zinc-400",
            };
            if (booking.status === "PARKED") {
              colors = {
                bg: "bg-emerald-100",
                text: "text-emerald-700",
                dot: "bg-emerald-400",
              };
            } else if (booking.status === "RESERVED") {
              colors = {
                bg: "bg-blue-100",
                text: "text-blue-700",
                dot: "bg-blue-400",
              };
            }

            // Use entered_at if available, otherwise created_at
            const timestamp = booking.entered_at || booking.created_at;

            return (
              <View key={i} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <Text className="text-[14px] text-zinc-700">{label}</Text>
                </View>
                <Text className="text-[12px] text-zinc-400">
                  {formatActivityDate(timestamp)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="text-[13px] text-zinc-400 text-center py-6">
          No recent activity
        </Text>
      )}
    </ScrollView>
  );
}

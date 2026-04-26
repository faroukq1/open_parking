import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import customFetch from "@/lib/customFetch";
import Toast from "react-native-toast-message";

const SPOT_LAT_SIZE = 0.00004;
const SPOT_LON_SIZE = 0.00005;
const GAP_LAT = 0.00002;
const GAP_LON = 0.00002;

const START_LAT = 45.75841;
const START_LON = 4.8309;

const COLS = 14;
const ROWS = 13;
const ROTATION_DEG = 17;

const GRID_CENTER_LAT = START_LAT - (ROWS * (SPOT_LAT_SIZE + GAP_LAT)) / 2;
const GRID_CENTER_LON = START_LON + (COLS * (SPOT_LON_SIZE + GAP_LON)) / 2;

const rotatePoint = (
  lat: number,
  lon: number,
  cLat: number,
  cLon: number,
  deg: number,
) => {
  const rad = (deg * Math.PI) / 180;
  const dLat = lat - cLat;
  const dLon = lon - cLon;
  return {
    latitude: cLat + dLat * Math.cos(rad) - dLon * Math.sin(rad),
    longitude: cLon + dLat * Math.sin(rad) + dLon * Math.cos(rad),
  };
};

type Spot = {
  id: number;
  coordinate: { latitude: number; longitude: number };
  boundary: { latitude: number; longitude: number }[];
};

const generateSpots = (): Spot[] => {
  const spots: Spot[] = [];
  let id = 1;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const topLat = START_LAT - row * (SPOT_LAT_SIZE + GAP_LAT);
      const botLat = topLat - SPOT_LAT_SIZE;
      const leftLon = START_LON + col * (SPOT_LON_SIZE + GAP_LON);
      const rightLon = leftLon + SPOT_LON_SIZE;
      const centerLat = (topLat + botLat) / 2;
      const centerLon = (leftLon + rightLon) / 2;

      const boundary = [
        { latitude: topLat, longitude: leftLon },
        { latitude: topLat, longitude: rightLon },
        { latitude: botLat, longitude: rightLon },
        { latitude: botLat, longitude: leftLon },
      ].map((p) =>
        rotatePoint(
          p.latitude,
          p.longitude,
          GRID_CENTER_LAT,
          GRID_CENTER_LON,
          ROTATION_DEG,
        ),
      );

      const coordinate = rotatePoint(
        centerLat,
        centerLon,
        GRID_CENTER_LAT,
        GRID_CENTER_LON,
        ROTATION_DEG,
      );

      spots.push({ id, coordinate, boundary });
      id++;
    }
  }
  return spots;
};

const SPOTS = generateSpots();

type DbSpot = { id: number; spot_number: number; is_available: boolean };
type Status = "available" | "occupied" | "selected" | "my_spot" | "none";

export default function ParkingScreen() {
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isBookingMode = mode === "booking";
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbSpots, setDbSpots] = useState<DbSpot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [myReservedSpot, setMyReservedSpot] = useState<number | null>(null);
  const [isEnter, setIsEnter] = useState<boolean>(user?.is_enter ?? false);
  const isUnlocked = isBookingMode || !!myReservedSpot || isEnter;

  useFocusEffect(
    useCallback(() => {
      setSpotsLoading(true);
      customFetch
        .get("/spots/")
        .then((res) => setDbSpots(res.data))
        .catch(() => {
          Toast.show({
            type: "error",
            text1: "Failed to load spots",
            text2: "Please check your connection and try again",
          });
        })
        .finally(() => setSpotsLoading(false));

      if (!user?.id) return;
      customFetch
        .get(`/bookings/active/${user.id}`)
        .then((res) => {
          if (res.data?.active) {
            setMyReservedSpot(res.data.spot_number);
          } else {
            setMyReservedSpot(null);
          }
        })
        .catch(() => {});
      customFetch
        .get(`/users/${user.id}/pending-entry`)
        .then((res) => setIsEnter(res.data?.is_enter ?? false))
        .catch(() => {});
    }, [user?.id]),
  );

  // Derived maps from DB spots
  const dbSpotNumbers = new Set(dbSpots.map((s) => s.spot_number));
  const occupiedNumbers = new Set(
    dbSpots.filter((s) => !s.is_available).map((s) => s.spot_number),
  );
  const spotNumberToDbId = Object.fromEntries(
    dbSpots.map((s) => [s.spot_number, s.id]),
  );

  const getStatus = (id: number): Status => {
    if (!dbSpotNumbers.has(id)) return "none";
    if (selected === id) return "selected";
    if (myReservedSpot === id) return "my_spot";
    if (occupiedNumbers.has(id)) return "occupied";
    return "available";
  };

  const getColors = (id: number) => {
    const status = getStatus(id);
    if (status === "selected")
      return { fill: "rgba(255,255,255,0.7)", stroke: "#ffffff" };
    if (status === "my_spot")
      return { fill: "rgba(59,130,246,0.7)", stroke: "#3b82f6" };
    if (status === "occupied")
      return { fill: "rgba(239,68,68,0.7)", stroke: "#ef4444" };
    if (status === "none")
      return { fill: "rgba(120,120,120,0.25)", stroke: "rgba(120,120,120,0.4)" };
    return { fill: "rgba(34,197,94,0.55)", stroke: "#22c55e" };
  };

  const handleReserve = async () => {
    if (!selected || !user) return;

    setIsSubmitting(true);
    try {
      const vehicleId = user.vehicles?.[0]?.id;
      if (!vehicleId) {
        Toast.show({
          type: "error",
          text1: "No vehicle found",
          text2: "Please add a vehicle in your profile first",
        });
        return;
      }
      const dbSpotId = spotNumberToDbId[selected];
      if (!dbSpotId) {
        Toast.show({
          type: "error",
          text1: "Invalid spot",
          text2: "This spot does not exist in the system",
        });
        return;
      }
      await customFetch.post(`/bookings/${user.id}`, {
        spot_id: dbSpotId,
        vehicle_id: vehicleId,
      });
      Toast.show({
        type: "success",
        text1: "Spot Reserved!",
        text2: `Spot #${selected} has been booked`,
      });
      setMyReservedSpot(selected);
      setSelected(null);
      setTimeout(() => router.replace("/(app)"), 1500);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      Toast.show({
        type: "error",
        text1: "Booking Failed",
        text2:
          detail === "Plate scan required before booking"
            ? "Please drive to the entrance first so your plate can be scanned"
            : detail || "Could not reserve spot, please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCount = dbSpots.filter((s) => s.is_available).length;

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        initialRegion={{
          latitude: 45.7582,
          longitude: 4.8311,
          latitudeDelta: 0.00065,
          longitudeDelta: 0.00065,
        }}
        minZoomLevel={16}
        maxZoomLevel={20}
        showsUserLocation
        showsCompass={false}
        toolbarEnabled={false}
      >
        {SPOTS.map((spot) => {
          const colors = getColors(spot.id);
          const isSelected = selected === spot.id;
          const status = getStatus(spot.id);
          const isNone = status === "none";
          const isOccupied = status === "occupied";
          const isMySpot = status === "my_spot";

          return (
            <View key={spot.id}>
              <Polygon
                coordinates={spot.boundary}
                fillColor={colors.fill}
                strokeColor={colors.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                tappable={isUnlocked && !isNone && !isOccupied && !isMySpot}
                onPress={() => {
                  if (!isUnlocked || isNone || isOccupied || isMySpot)
                    return;
                  setSelected((prev) => (prev === spot.id ? null : spot.id));
                }}
              />
              {(isSelected || isOccupied || isMySpot) && (
                <Marker
                  coordinate={spot.coordinate}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={false}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: isOccupied
                        ? "#ef4444"
                        : isMySpot
                          ? "#3b82f6"
                          : "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "800",
                        color: isSelected ? "#111" : "#fff",
                      }}
                    >
                      {isOccupied ? "✕" : isMySpot ? "✓" : spot.id}
                    </Text>
                  </View>
                </Marker>
              )}
            </View>
          );
        })}
      </MapView>

      {/* ── Spots loading overlay ── */}
      {spotsLoading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white text-[13px] mt-3 font-medium">
            Loading spots...
          </Text>
        </View>
      )}

      {/* ── Top HUD ── */}
      <View
        className="absolute left-4 right-4"
        style={{ top: insets.top + 12 }}
        pointerEvents="none"
      >
        {isBookingMode && (
          <View
            className="bg-[#2D3139] rounded-2xl px-5 py-3 mb-2 flex-row items-center gap-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="w-2 h-2 rounded-full bg-green-400" />
            <View className="flex-1">
              <Text className="text-white text-[13px] font-semibold">
                Plate Scanned
              </Text>
              <Text className="text-zinc-400 text-[11px]">
                Tap a green spot to reserve your place
              </Text>
            </View>
          </View>
        )}
        <View
          className="flex-row items-center justify-between bg-[#2D3139] rounded-2xl px-5 py-3.5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View>
            <Text className="text-zinc-400 text-[11px] font-medium uppercase tracking-widest">
              Place Bellecour
            </Text>
            <Text className="text-white text-[18px] font-bold leading-tight">
              {availableCount} / {dbSpots.length} available
            </Text>
          </View>
          <View className="gap-1.5">
            {[
              { color: "#22c55e", label: "Available" },
              { color: "#ef4444", label: "Occupied" },
              { color: "#3b82f6", label: "Reserved" },
              { color: "#ffffff", label: "Selected" },
            ].map((l) => (
              <View key={l.label} className="flex-row items-center gap-1.5">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: l.color,
                    borderWidth: l.color === "#ffffff" ? 1 : 0,
                    borderColor: "#aaa",
                  }}
                />
                <Text className="text-zinc-400 text-[11px]">{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Lock overlay — shown only when no active booking and not in booking mode ── */}
      {!isUnlocked && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          pointerEvents="box-none"
        >
          <View className="bg-[#2D3139] rounded-2xl px-8 py-6 items-center mx-8">
            <Text className="text-white text-[18px] font-bold mb-2">
              🔒 Map Locked
            </Text>
            <Text className="text-zinc-400 text-[13px] text-center leading-5">
              Drive to the parking entrance.{"\n"}Your plate will be scanned
              automatically.
            </Text>
          </View>
        </View>
      )}

      {/* ── Confirm CTA ── */}
      {selected && isUnlocked && (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: insets.bottom + 90 }}
        >
          <TouchableOpacity
            className="bg-zinc-900 rounded-2xl py-4 items-center"
            activeOpacity={0.85}
            onPress={handleReserve}
            disabled={isSubmitting}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white text-[15px] font-semibold">
              {isSubmitting ? "Booking..." : `Reserve Spot #${selected}`}
            </Text>
            <Text className="text-zinc-400 text-[12px] mt-0.5">
              Tap to confirm your reservation
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

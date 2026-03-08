import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Real public parkings in Lyon, France (Presqu'île area) ──
const PARKINGS = [
  {
    id: 1,
    name: "Parking Antonin Poncet",
    address: "Place Antonin Poncet, Lyon 2e",
    coordinate: { latitude: 45.757, longitude: 4.834 },
    capacity: 520,
    fee: "Paid",
    access: "Public",
    operator: "LPA Mobilités",
    open: "24h/24",
  },
  {
    id: 2,
    name: "Garage Bellecour",
    address: "5 Place Gailleton, Lyon 2e",
    coordinate: { latitude: 45.7548, longitude: 4.832 },
    capacity: 280,
    fee: "Paid",
    access: "Public",
    operator: "Parclick",
    open: "24h/24",
  },
  {
    id: 3,
    name: "Parking Majestic",
    address: "18 Quai Tilsitt, Lyon 2e",
    coordinate: { latitude: 45.758, longitude: 4.8272 },
    capacity: 350,
    fee: "Paid",
    access: "Public",
    operator: "LPA Mobilités",
    open: "24h/24",
  },
  {
    id: 4,
    name: "Q-Park Perrache Carnot",
    address: "Cours de Verdun, Lyon 2e",
    coordinate: { latitude: 45.749, longitude: 4.8268 },
    capacity: 610,
    fee: "Paid",
    access: "Public",
    operator: "Q-Park",
    open: "24h/24",
  },
  {
    id: 5,
    name: "Parking Célestins",
    address: "Place des Célestins, Lyon 2e",
    coordinate: { latitude: 45.7612, longitude: 4.833 },
    capacity: 430,
    fee: "Paid",
    access: "Public",
    operator: "LPA Mobilités",
    open: "24h/24",
  },
  {
    id: 6,
    name: "Parking Hôtel de Ville",
    address: "Place de la Comédie, Lyon 1er",
    coordinate: { latitude: 45.7676, longitude: 4.8336 },
    capacity: 390,
    fee: "Paid",
    access: "Public",
    operator: "LPA Mobilités",
    open: "24h/24",
  },
  {
    id: 7,
    name: "Parking Terreaux",
    address: "Place des Terreaux, Lyon 1er",
    coordinate: { latitude: 45.7672, longitude: 4.8318 },
    capacity: 240,
    fee: "Paid",
    access: "Public",
    operator: "Indigo",
    open: "24h/24",
  },
  {
    id: 8,
    name: "Parking Bonnefoi",
    address: "Rue Bonnefoi, Lyon 3e",
    coordinate: { latitude: 45.754, longitude: 4.844 },
    capacity: 460,
    fee: "Paid",
    access: "Public",
    operator: "LPA Mobilités",
    open: "24h/24",
  },
];

// Simulate some as occupied
const OCCUPIED = [3, 6];

export default function ParkingScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [reserved, setReserved] = useState<number[]>([]);

  const selectedParking = PARKINGS.find((p) => p.id === selected);

  const getStatus = (id: number) => {
    if (reserved.includes(id)) return "reserved";
    if (OCCUPIED.includes(id)) return "full";
    return "available";
  };

  const markerStyle = (id: number) => {
    const status = getStatus(id);
    const isSelected = selected === id;
    if (isSelected)
      return { bg: "#2D3139", border: "#fff", text: "#fff", size: 48 };
    if (status === "full")
      return { bg: "#3F3F46", border: "#52525B", text: "#A1A1AA", size: 38 };
    if (status === "reserved")
      return { bg: "#166534", border: "#15803D", text: "#fff", size: 38 };
    return { bg: "#1e3a5f", border: "#3b82f6", text: "#fff", size: 38 };
  };

  const handleReserve = () => {
    if (!selected) return;
    setReserved((prev) => [...prev, selected]);
    setSelected(null);
  };

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        initialRegion={{
          latitude: 45.758,
          longitude: 4.832,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        showsUserLocation
        showsCompass={false}
        toolbarEnabled={false}
      >
        {PARKINGS.map((p) => {
          const style = markerStyle(p.id);
          const status = getStatus(p.id);

          return (
            <Marker
              key={p.id}
              coordinate={p.coordinate}
              onPress={() =>
                setSelected((prev) => (prev === p.id ? null : p.id))
              }
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View
                style={{
                  width: style.size,
                  height: style.size,
                  borderRadius: style.size / 2,
                  backgroundColor: style.bg,
                  borderWidth: selected === p.id ? 3 : 2,
                  borderColor: style.border,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.4,
                  shadowRadius: 5,
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    color: style.text,
                    fontSize: selected === p.id ? 14 : 11,
                    fontWeight: "800",
                  }}
                >
                  {status === "full" ? "✕" : status === "reserved" ? "✓" : "P"}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── Top HUD ── */}
      <View
        className="absolute left-4 right-4"
        style={{ top: insets.top + 12 }}
        pointerEvents="none"
      >
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
              Lyon · Presqu'île
            </Text>
            <Text className="text-white text-[18px] font-bold leading-tight">
              {PARKINGS.length} public parkings
            </Text>
          </View>
          <View className="gap-1.5">
            {[
              { color: "#1e3a5f", border: "#3b82f6", label: "Available" },
              { color: "#3F3F46", border: "#52525B", label: "Full" },
              { color: "#166834", border: "#15803D", label: "Reserved" },
            ].map((l) => (
              <View key={l.label} className="flex-row items-center gap-1.5">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: l.color,
                    borderWidth: 1.5,
                    borderColor: l.border,
                  }}
                />
                <Text className="text-zinc-400 text-[11px]">{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Selected parking card ── */}
      {selected && selectedParking && (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: insets.bottom + 90 }}
        >
          <View
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1 mr-3">
                <Text className="text-zinc-900 text-[16px] font-semibold leading-tight">
                  {selectedParking.name}
                </Text>
                <Text className="text-zinc-400 text-[12px] mt-0.5">
                  {selectedParking.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 items-center justify-center"
              >
                <Text className="text-zinc-500 text-[13px]">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Pills row */}
            <View className="flex-row flex-wrap gap-2 my-3">
              <View className="bg-zinc-100 rounded-full px-3 py-1">
                <Text className="text-zinc-600 text-[12px] font-medium">
                  {selectedParking.capacity} spots
                </Text>
              </View>
              <View className="bg-zinc-100 rounded-full px-3 py-1">
                <Text className="text-zinc-600 text-[12px] font-medium">
                  {selectedParking.open}
                </Text>
              </View>
              <View className="bg-blue-50 rounded-full px-3 py-1">
                <Text className="text-blue-700 text-[12px] font-medium">
                  {selectedParking.fee}
                </Text>
              </View>
              <View className="bg-zinc-100 rounded-full px-3 py-1">
                <Text className="text-zinc-500 text-[12px]">
                  {selectedParking.operator}
                </Text>
              </View>
            </View>

            {/* Status bar */}
            <View className="h-1.5 bg-zinc-100 rounded-full mb-4 overflow-hidden">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: getStatus(selected) === "full" ? "100%" : "45%",
                }}
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              className={`rounded-xl py-3.5 items-center ${
                getStatus(selected) === "full" ? "bg-zinc-200" : "bg-zinc-900"
              }`}
              activeOpacity={0.85}
              onPress={handleReserve}
              disabled={getStatus(selected) === "full"}
            >
              <Text
                className={`text-[14.5px] font-semibold ${
                  getStatus(selected) === "full"
                    ? "text-zinc-400"
                    : "text-white"
                }`}
              >
                {getStatus(selected) === "full"
                  ? "Parking Full"
                  : "Reserve a Spot Here"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

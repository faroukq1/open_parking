import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Place Bellecour bounds (from screenshot)
// The big square: lat 45.7574→45.7590, lon 4.8306→4.8315
// We split it into a 5x4 grid of small spots ──

const SPOT_LAT_SIZE = 0.00008; // height of each spot
const SPOT_LON_SIZE = 0.00016; // width of each spot
const GAP_LAT = 0.00002;
const GAP_LON = 0.00002;

const START_LAT = 45.75838; // top-left corner lat (north)
const START_LON = 4.831; // top-left corner lon (west)

const COLS = 5;
const ROWS = 7;
const OCCUPIED_IDS = [2, 5, 8, 14];
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

type Status = "available" | "occupied" | "selected";

export default function ParkingScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [reserved, setReserved] = useState<number[]>([]);

  const getStatus = (id: number): Status => {
    if (selected === id) return "selected";
    if (reserved.includes(id)) return "selected";
    if (OCCUPIED_IDS.includes(id)) return "occupied";
    return "available";
  };

  const getColors = (id: number) => {
    const status = getStatus(id);
    if (status === "selected")
      return { fill: "rgba(255,255,255,0.7)", stroke: "#ffffff" };
    if (status === "occupied")
      return { fill: "rgba(239,68,68,0.7)", stroke: "#ef4444" };
    return { fill: "rgba(34,197,94,0.55)", stroke: "#22c55e" };
  };

  const handleReserve = () => {
    if (!selected) return;
    setReserved((prev) => [...prev, selected]);
    setSelected(null);
  };

  const available = SPOTS.filter(
    (s) => !OCCUPIED_IDS.includes(s.id) && !reserved.includes(s.id),
  ).length;

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        initialRegion={{
          latitude: 45.7582,
          longitude: 4.831,
          latitudeDelta: 0.0015506436452810135,
          longitudeDelta: 0.00100012868642807,
        }}
        showsUserLocation
        showsCompass={false}
        toolbarEnabled={false}
      >
        {SPOTS.map((spot) => {
          const colors = getColors(spot.id);
          const isSelected = selected === spot.id;
          const isOccupied = OCCUPIED_IDS.includes(spot.id);
          const isReserved = reserved.includes(spot.id);

          return (
            <View key={spot.id}>
              <Polygon
                coordinates={spot.boundary}
                fillColor={colors.fill}
                strokeColor={colors.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                tappable
                onPress={() => {
                  if (isOccupied || isReserved) return;
                  setSelected((prev) => (prev === spot.id ? null : spot.id));
                }}
              />
              {/* Only show number label on selected or occupied */}
              {(isSelected || isOccupied || isReserved) && (
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
                        : isReserved
                          ? "#22c55e"
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
                      {isOccupied ? "✕" : isReserved ? "✓" : spot.id}
                    </Text>
                  </View>
                </Marker>
              )}
            </View>
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
              Place Bellecour
            </Text>
            <Text className="text-white text-[18px] font-bold leading-tight">
              {available} / {SPOTS.length} available
            </Text>
          </View>
          <View className="gap-1.5">
            {[
              { color: "#22c55e", label: "Available" },
              { color: "#ef4444", label: "Occupied" },
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

      {/* ── Confirm CTA ── */}
      {selected && (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: insets.bottom + 90 }}
        >
          <TouchableOpacity
            className="bg-zinc-900 rounded-2xl py-4 items-center"
            activeOpacity={0.85}
            onPress={handleReserve}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white text-[15px] font-semibold">
              Reserve Spot #{selected}
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

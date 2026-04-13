import { useRouter } from "expo-router";
import {
  Car,
  ChevronRight,
  Clock,
  Edit2,
  Home,
  LogOut,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [licensePlateModalVisible, setLicensePlateModalVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [licensePlateForm, setLicensePlateForm] = useState({
    plateNumber: "",
  });

  const router = useRouter();
  const { user, logout, updateUser, changePassword, updateLicensePlate } =
    useAuthStore();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-zinc-500">Loading...</Text>
      </View>
    );
  }

  const handleOpenEditModal = () => {
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (
      !editForm.full_name.trim() ||
      !editForm.email.trim() ||
      !editForm.phone.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });
      setEditModalVisible(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New passwords do not match",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password changed successfully",
      });
      setPasswordModalVisible(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to change password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLicensePlate = async () => {
    if (!licensePlateForm.plateNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "License plate is required",
      });
      return;
    }

    setIsLoading(true);
    try {
      const vehicleId =
        user.vehicles && user.vehicles.length > 0
          ? user.vehicles[0].id
          : undefined;
      await updateLicensePlate(licensePlateForm.plateNumber, vehicleId);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "License plate updated successfully",
      });
      setLicensePlateModalVisible(false);
      setLicensePlateForm({ plateNumber: "" });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update license plate",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        className="bg-white rounded-2xl p-5 flex-row items-center justify-between mb-1"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Avatar */}
        <View className="flex-row flex-1 items-center">
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
            <Text className="text-zinc-400 text-[13px] mt-0.5">
              {user.email}
            </Text>
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

        {/* Edit button */}
        <TouchableOpacity
          onPress={handleOpenEditModal}
          className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center"
        >
          <Edit2 size={16} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
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
          onPress={handleOpenEditModal}
        />
        <Row
          icon={Phone}
          label="Phone"
          value={user.phone}
          onPress={handleOpenEditModal}
        />
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
              onPress={() => {
                setLicensePlateForm({ plateNumber: vehicle.plate_number });
                setLicensePlateModalVisible(true);
              }}
            />
          ))
        ) : (
          <Row
            icon={Car}
            label="Add Vehicle"
            onPress={() => {
              setLicensePlateForm({ plateNumber: "" });
              setLicensePlateModalVisible(true);
            }}
          />
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
        <Row
          icon={Shield}
          label="Change Password"
          onPress={() => setPasswordModalVisible(true)}
        />
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

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6 pb-10"
            style={{
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-[20px] font-semibold text-zinc-900">
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="w-8 h-8 rounded-lg bg-zinc-100 items-center justify-center"
              >
                <X size={18} color="#52525B" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="gap-4">
              {/* Full Name */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={editForm.full_name}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, full_name: text })
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor="#A1A1AA"
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>

              {/* Email */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Email
                </Text>
                <TextInput
                  value={editForm.email}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, email: text })
                  }
                  placeholder="Enter your email"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="email-address"
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>

              {/* Phone */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Phone
                </Text>
                <TextInput
                  value={editForm.phone}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, phone: text })
                  }
                  placeholder="Enter your phone number"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="phone-pad"
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-8 flex-row">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl bg-zinc-100 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-zinc-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                className="flex-1 py-3.5 rounded-xl bg-blue-500 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-white font-semibold">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6 pb-10"
            style={{
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-[20px] font-semibold text-zinc-900">
                Change Password
              </Text>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                className="w-8 h-8 rounded-lg bg-zinc-100 items-center justify-center"
              >
                <X size={18} color="#52525B" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="gap-4">
              {/* Current Password */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Current Password
                </Text>
                <TextInput
                  value={passwordForm.currentPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, currentPassword: text })
                  }
                  placeholder="Enter current password"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>

              {/* New Password */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  New Password
                </Text>
                <TextInput
                  value={passwordForm.newPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, newPassword: text })
                  }
                  placeholder="Enter new password"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>

              {/* Confirm Password */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: text })
                  }
                  placeholder="Confirm new password"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-8 flex-row">
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl bg-zinc-100 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-zinc-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                className="flex-1 py-3.5 rounded-xl bg-blue-500 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-white font-semibold">
                  {isLoading ? "Changing..." : "Change Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Update License Plate Modal ── */}
      <Modal
        visible={licensePlateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLicensePlateModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6 pb-10"
            style={{
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-[20px] font-semibold text-zinc-900">
                License Plate
              </Text>
              <TouchableOpacity
                onPress={() => setLicensePlateModalVisible(false)}
                className="w-8 h-8 rounded-lg bg-zinc-100 items-center justify-center"
              >
                <X size={18} color="#52525B" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="gap-4">
              {/* License Plate */}
              <View>
                <Text className="text-[13px] font-semibold text-zinc-700 mb-2">
                  Plate Number
                </Text>
                <TextInput
                  value={licensePlateForm.plateNumber}
                  onChangeText={(text) =>
                    setLicensePlateForm({ plateNumber: text })
                  }
                  placeholder="Enter license plate number"
                  placeholderTextColor="#A1A1AA"
                  className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-900"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-8 flex-row">
              <TouchableOpacity
                onPress={() => setLicensePlateModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl bg-zinc-100 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-zinc-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateLicensePlate}
                className="flex-1 py-3.5 rounded-xl bg-blue-500 items-center justify-center"
                disabled={isLoading}
              >
                <Text className="text-white font-semibold">
                  {isLoading ? "Saving..." : "Save Plate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

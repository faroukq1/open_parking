import AuthScreenWrapper from "@/components/auth/Authscreenwrapper";
import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async () => {
    if (!agreedToTerms) return;

    if (!fullName || !email || !password || !phone || !plateNumber) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone,
        user_type: "visitor",
        plate_numbers: [plateNumber.trim().toUpperCase()],
      });
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "Welcome! Your account has been created.",
        visibilityTime: 2000,
      });
      setTimeout(() => {
        router.replace("/(app)");
      }, 1000);
    } catch (err: any) {
      console.error("Register error:", err.message);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: err.message || "Registration failed. Please try again.",
        visibilityTime: 3000,
      });
    }
  };

  const handleGoogleRegister = () => {
    // TODO: Google OAuth
  };

  return (
    <AuthScreenWrapper
      title="Create an account"
      subtitle="Enter your details below to create your account."
      bottomText="Already have an account?"
      bottomLinkText="Sign in"
      onBottomLinkPress={() => router.push("/(auth)/login")}
    >
      {/* Full Name */}
      <Input
        label="Full Name"
        placeholder="John Doe"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Email */}
      <Input
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Phone */}
      <Input
        label="Phone"
        placeholder="0665720726"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Password */}
      <Input
        label="Password"
        placeholder="Min. 8 characters"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

      {/* Plate Number */}
      <Input
        label="Car Plate Number"
        placeholder="e.g. 1309368"
        autoCapitalize="characters"
        value={plateNumber}
        onChangeText={setPlateNumber}
      />

      {/* Terms checkbox */}
      <TouchableOpacity
        className="flex-row items-start mb-6 mt-1"
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        activeOpacity={0.7}
      >
        <View
          className={`w-4 h-4 rounded border mt-0.5 mr-2.5 items-center justify-center ${
            agreedToTerms
              ? "bg-zinc-900 border-zinc-900"
              : "bg-white border-zinc-300"
          }`}
        >
          {agreedToTerms && (
            <Text className="text-white text-[10px] font-bold leading-none">
              ✓
            </Text>
          )}
        </View>
        <Text className="text-[13px] text-zinc-500 flex-1 leading-5">
          I agree to the{" "}
          <Text className="text-zinc-800 underline font-medium">
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text className="text-zinc-800 underline font-medium">
            Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Create account button */}
      <Button
        label="Create account"
        loading={loading}
        onPress={handleRegister}
        disabled={loading || !agreedToTerms}
      />

      {/* OR divider */}
      <View className="flex-row items-center mb-5">
        <View className="flex-1 h-px bg-zinc-100" />
        <Text className="mx-3 text-[12px] text-zinc-400 uppercase tracking-widest">
          Or continue with
        </Text>
        <View className="flex-1 h-px bg-zinc-100" />
      </View>

      {/* Google button */}
      <Button
        label="Google"
        variant="outline"
        icon={<Text className="text-[15px]">G</Text>}
        onPress={handleGoogleRegister}
      />
    </AuthScreenWrapper>
  );
}

import AuthScreenWrapper from "@/components/auth/Authscreenwrapper";
import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!agreedToTerms) return;
    setLoading(true);
    // TODO: add your register logic here
    setTimeout(() => setLoading(false), 1500);
  };

  const handleGoogleRegister = () => {
    // TODO: Google OAuth
  };

  return (
    <AuthScreenWrapper
      title="Create an account"
      subtitle="Enter your email below to create your account."
      bottomText="Already have an account?"
      bottomLinkText="Sign in"
      onBottomLinkPress={() => router.push("/(auth)/login")}
    >
      {/* Email */}
      <Input
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <Input
        label="Password"
        placeholder="Min. 8 characters"
        isPassword
        value={password}
        onChangeText={setPassword}
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

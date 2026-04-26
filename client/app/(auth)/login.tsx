import AuthScreenWrapper from "@/components/auth/Authscreenwrapper";
import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);

    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      Toast.show({
        type: "success",
        text1: "Welcome back!",
        visibilityTime: 2000,
      });
      setTimeout(() => {
        router.replace("/(app)");
      }, 1000);
    } catch (err: any) {
      const message =
        err.message && err.message !== "Login failed"
          ? err.message
          : "Wrong email or password.";
      setAuthError(message);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Coming Soon", "Password reset is not yet available.");
  };

  return (
    <AuthScreenWrapper
      title="Sign in"
      subtitle="Enter your email and password to sign in to your account."
      bottomText="Don't have an account?"
      bottomLinkText="Sign up"
      onBottomLinkPress={() => router.push("/(auth)/register")}
      header={
        <View className="flex-row items-center justify-center">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-52 h-52"
            resizeMode="contain"
          />
        </View>
      }
    >
      {/* Email */}
      <Input
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setAuthError(null);
        }}
      />

      {/* Password */}
      <Input
        label="Password"
        placeholder="••••••••"
        isPassword
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setAuthError(null);
        }}
      />

      {/* Inline error message */}
      {authError && (
        <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-1">
          <Text className="text-red-600 text-[13px] font-medium flex-1">
            {authError}
          </Text>
        </View>
      )}

      {/* Sign in button */}
      <Button
        label="Sign in"
        loading={loading}
        onPress={handleLogin}
        disabled={loading}
      />

      {/* Forgot password */}
      <TouchableOpacity onPress={handleForgotPassword} className="items-center mt-2">
        <Text className="text-[13px] text-zinc-500 underline">
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/* Terms notice */}
      <Text className="text-[11.5px] text-zinc-400 text-center mt-6 leading-4 px-2">
        By clicking continue, you agree to our{" "}
        <Text className="underline text-zinc-500">Terms of Service</Text> and{" "}
        <Text className="underline text-zinc-500">Privacy Policy</Text>.
      </Text>
    </AuthScreenWrapper>
  );
}

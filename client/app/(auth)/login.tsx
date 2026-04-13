import AuthScreenWrapper from "@/components/auth/Authscreenwrapper";
import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import Toast from "react-native-toast-message";
// Push token registration is only supported in dev builds (not Expo Go).
// This is intentionally a no-op in Expo Go; the in-app polling handles redirects.

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter email and password",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
        visibilityTime: 2000,
      });
      setTimeout(() => {
        router.replace("/(app)");
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err.message);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err.message || "Please check your credentials.",
        visibilityTime: 3000,
      });
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Coming Soon", "Google login is not yet available.");
    // TODO: Implement Google OAuth
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
        onChangeText={setEmail}
      />

      {/* Password */}
      <Input
        label="Password"
        placeholder="••••••••"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

      {/* Sign in button */}
      <Button
        label="Sign in"
        loading={loading}
        onPress={handleLogin}
        disabled={loading}
      />

      {/* Terms notice */}
      <Text className="text-[11.5px] text-zinc-400 text-center mt-6 leading-4 px-2">
        By clicking continue, you agree to our{" "}
        <Text className="underline text-zinc-500">Terms of Service</Text> and{" "}
        <Text className="underline text-zinc-500">Privacy Policy</Text>.
      </Text>
    </AuthScreenWrapper>
  );
}

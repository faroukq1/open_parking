import AuthScreenWrapper from "@/components/auth/Authscreenwrapper";
import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // TODO: add your auth logic here
    setTimeout(() => setLoading(false), 1500);
    router.push("/(app)");
  };

  const handleGoogleLogin = () => {
    // TODO: Google OAuth
  };

  return (
    <AuthScreenWrapper
      title="Sign in"
      subtitle="Enter your email and password to sign in to your account."
      bottomText="Don't have an account?"
      bottomLinkText="Sign up"
      onBottomLinkPress={() => router.push("/(auth)/register")}
      header={
        <View className="items-center justify-between">
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

      {/* Forgot password */}
      <TouchableOpacity className="self-end mb-5" activeOpacity={0.7}>
        <Text className="text-[13px] text-zinc-500 underline">
          Forgot your password?
        </Text>
      </TouchableOpacity>

      {/* Sign in button */}
      <Button
        label="Sign in"
        loading={loading}
        onPress={handleLogin}
        disabled={loading}
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
        onPress={handleGoogleLogin}
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

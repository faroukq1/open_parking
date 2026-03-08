import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuthScreenWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  bottomText?: string;
  bottomLinkText?: string;
  onBottomLinkPress?: () => void;
  showBackButton?: boolean;
}

export default function AuthScreenWrapper({
  title,
  subtitle,
  children,
  bottomText,
  bottomLinkText,
  onBottomLinkPress,
  showBackButton = true,
}: AuthScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── STATIC: Top bar with back button ── */}
        {showBackButton && (
          <View className="px-6 pt-4 pb-2">
            <TouchableOpacity
              className="w-9 h-9 rounded-md border border-zinc-200 items-center justify-center"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="text-zinc-700 text-[16px]">←</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STATIC: Title block ── */}
        <View className="px-6 pt-6 pb-8">
          <Text className="text-[26px] font-semibold text-zinc-900 tracking-tight mb-1.5">
            {title}
          </Text>
          <Text className="text-[14px] text-zinc-500 leading-5">
            {subtitle}
          </Text>
        </View>

        {/* ── DYNAMIC: Screen-specific content ── */}
        <View className="px-6 flex-1">{children}</View>

        {/* ── STATIC: Bottom link ── */}
        {bottomText && (
          <View className="items-center pt-8">
            <Text className="text-[13.5px] text-zinc-500">
              {bottomText}{" "}
              <Text
                className="text-zinc-900 font-semibold underline"
                onPress={onBottomLinkPress}
              >
                {bottomLinkText}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

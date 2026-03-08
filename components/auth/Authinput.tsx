import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  error?: string;
}

export default function AuthInput({
  label,
  isPassword = false,
  error,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-[13.5px] font-medium text-zinc-700 mb-1.5">
        {label}
      </Text>

      {/* Input wrapper */}
      <View
        className={`flex-row items-center h-11 rounded-md border px-3 bg-white ${
          error
            ? "border-red-500"
            : isFocused
              ? "border-zinc-900"
              : "border-zinc-200"
        }`}
      >
        <TextInput
          className="flex-1 text-[14.5px] text-zinc-900"
          placeholderTextColor="#A1A1AA"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.6}
            className="pl-2"
          >
            {showPassword ? (
              /* Eye open */
              <View className="opacity-40">
                <Text className="text-zinc-600 text-[15px]">◉</Text>
              </View>
            ) : (
              /* Eye closed */
              <View className="opacity-40">
                <Text className="text-zinc-600 text-[15px]">◎</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {error && <Text className="text-red-500 text-[12px] mt-1">{error}</Text>}
    </View>
  );
}

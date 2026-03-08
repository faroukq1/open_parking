import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  isPassword?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  isPassword = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {/* Label */}
      {label && (
        <Text className="text-[13.5px] font-medium text-zinc-700 mb-1.5">
          {label}
        </Text>
      )}

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
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-[14.5px] text-zinc-900"
          placeholderTextColor="#A1A1AA"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />

        {/* Password toggle or custom right icon */}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text className="text-zinc-500 text-[16px]">
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View>{rightIcon}</View>
        ) : null}
      </View>

      {/* Error message */}
      {error && <Text className="text-red-500 text-[12px] mt-1">{error}</Text>}

      {/* Helper text */}
      {helperText && !error && (
        <Text className="text-zinc-400 text-[12px] mt-1">{helperText}</Text>
      )}
    </View>
  );
}

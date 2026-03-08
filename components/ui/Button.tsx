import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function Button({
  label,
  loading = false,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = true,
  disabled = false,
  ...props
}: ButtonProps) {
  // Size styles
  const sizeStyles = {
    sm: "h-9 px-3",
    md: "h-11 px-4",
    lg: "h-12 px-5",
  };

  // Variant styles
  const variantStyles = {
    primary: disabled ? "bg-zinc-200" : "bg-zinc-900",
    secondary: "bg-zinc-100",
    outline: "border border-zinc-200 bg-white",
  };

  // Text color styles
  const textColorStyles = {
    primary: disabled ? "text-zinc-400" : "text-white",
    secondary: "text-zinc-900",
    outline: "text-zinc-900",
  };

  const loaderColor =
    variant === "primary"
      ? disabled
        ? "#888"
        : "#fff"
      : variant === "secondary"
        ? "#000"
        : "#000";

  return (
    <TouchableOpacity
      className={`rounded-md items-center justify-center flex-row my-2.5 ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
      onPress={props.onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`text-[14.5px] font-medium ${textColorStyles[variant]}`}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

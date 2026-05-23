import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../theme";

export function AppButton({
  title,
  icon,
  onPress,
  loading,
  variant = "primary",
  style
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        loading && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.surface : colors.primary} />
      ) : (
        <>
          {icon ? <Ionicons color={variant === "primary" ? colors.surface : colors.primary} name={icon} size={18} /> : null}
          <Text style={[styles.text, variant !== "primary" && styles.altText]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.line,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.65
  },
  text: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "700"
  },
  altText: {
    color: colors.primary
  }
});

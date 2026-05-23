import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { StatusBadge } from "./StatusBadge";

export function AppHeader({
  title,
  subtitle,
  badge,
  badgeTone = "neutral",
  icon = "pulse-outline"
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: "success" | "warning" | "danger" | "info" | "neutral";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.primary} name={icon} size={23} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {badge ? <StatusBadge label={badge} tone={badgeTone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  textWrap: {
    flex: 1,
    gap: 3
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 29
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});

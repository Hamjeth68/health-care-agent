import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../theme";

export function InfoBanner({
  title,
  body,
  tone = "info"
}: {
  title: string;
  body: string;
  tone?: "info" | "warning" | "danger" | "success";
}) {
  const palette = {
    info: { bg: colors.infoSoft, fg: colors.secondary, icon: "shield-checkmark-outline" as const },
    warning: { bg: colors.warningSoft, fg: colors.warning, icon: "alert-circle-outline" as const },
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: "warning-outline" as const },
    success: { bg: colors.successSoft, fg: colors.success, icon: "checkmark-circle-outline" as const }
  }[tone];

  return (
    <View style={[styles.banner, { backgroundColor: palette.bg }]}>
      <Ionicons color={palette.fg} name={palette.icon} size={20} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  textWrap: {
    flex: 1,
    gap: 3
  },
  title: {
    fontSize: 14,
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});

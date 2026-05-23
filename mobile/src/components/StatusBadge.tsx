import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../theme";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneMap: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: colors.successSoft, fg: colors.success, icon: "checkmark-circle-outline" },
  warning: { bg: colors.warningSoft, fg: colors.warning, icon: "alert-circle-outline" },
  danger: { bg: colors.dangerSoft, fg: colors.danger, icon: "warning-outline" },
  info: { bg: colors.infoSoft, fg: colors.secondary, icon: "information-circle-outline" },
  neutral: { bg: colors.surfaceSoft, fg: colors.muted, icon: "ellipse-outline" }
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const nextTone = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: nextTone.bg }]}>
      <Ionicons color={nextTone.fg} name={nextTone.icon} size={14} />
      <Text style={[styles.text, { color: nextTone.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: 5,
    minHeight: 28,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  text: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});

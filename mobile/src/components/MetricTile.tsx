import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, shadow } from "../theme";

export function MetricTile({
  label,
  value,
  unit,
  icon,
  tone = "primary"
}: {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "primary" | "secondary" | "warning" | "danger";
}) {
  const toneColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    warning: colors.warning,
    danger: colors.danger
  }[tone];

  return (
    <View style={styles.tile}>
      <View style={[styles.icon, { backgroundColor: `${toneColor}18` }]}>
        <Ionicons color={toneColor} name={icon} size={20} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    ...shadow,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 132,
    minWidth: "47%",
    padding: 14
  },
  icon: {
    alignItems: "center",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    marginBottom: 12,
    width: 38
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  value: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6
  },
  unit: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  }
});

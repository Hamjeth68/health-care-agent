import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 38
  },
  label: {
    color: colors.muted,
    flex: 1,
    fontSize: 13
  },
  value: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  }
});

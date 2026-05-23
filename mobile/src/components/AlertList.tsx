import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function AlertList({ title, items, icon }: { title: string; items: string[]; icon: keyof typeof Ionicons.glyphMap }) {
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Ionicons color={colors.primary} name={icon} size={18} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 7,
    marginTop: 7,
    width: 7
  },
  item: {
    color: colors.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  }
});

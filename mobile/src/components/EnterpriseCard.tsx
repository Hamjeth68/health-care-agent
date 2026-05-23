import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radii, shadow, spacing } from "../theme";

export function EnterpriseCard({
  title,
  eyebrow,
  trailing,
  children,
  style
}: {
  title?: string;
  eyebrow?: string;
  trailing?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || eyebrow || trailing) ? (
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {trailing}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadow,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  titleWrap: {
    flex: 1,
    gap: 3
  },
  eyebrow: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22
  }
});

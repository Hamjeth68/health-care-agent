import { TextInput, TextInputProps, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        autoCapitalize={props.autoCapitalize ?? "none"}
        placeholderTextColor="#8A9992"
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14
  },
  multiline: {
    minHeight: 108,
    paddingTop: 14,
    textAlignVertical: "top"
  }
});

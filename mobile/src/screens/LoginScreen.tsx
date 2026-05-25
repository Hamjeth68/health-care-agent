import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { getErrorMessage } from "../utils/errors";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { authError, clearAuthError, configured, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    clearAuthError();
    try {
      await login(email, password);
    } catch (error: unknown) {
      Alert.alert("Login failed", getErrorMessage(error, "Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.wrap}>
        <LinearGradient colors={["#E9F7F2", "#FFFFFF"]} style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Enterprise Healthcare AI</Text>
          </View>
          <Text style={styles.title}>Secure care operations from a mobile workspace.</Text>
          <Text style={styles.subtitle}>Authenticate once, monitor vitals, run clinical checks, and keep patient education in a protected flow.</Text>
        </LinearGradient>

        <EnterpriseCard eyebrow="Secure access" title="Sign in to continue">
          {!configured ? <Text style={styles.error}>Add Supabase keys in mobile/.env to enable authentication.</Text> : null}
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
          <TextField label="Email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" value={email} />
          <TextField label="Password" onChangeText={setPassword} placeholder="Minimum 6 characters" secureTextEntry value={password} />
          <AppButton icon="lock-closed-outline" loading={loading} onPress={onLogin} title="Sign in securely" />
          <Pressable onPress={() => navigation.navigate("Signup")} style={styles.linkWrap}>
            <Text style={styles.link}>Create a patient account</Text>
          </Pressable>
        </EnterpriseCard>

        <InfoBanner
          body="Access is route-guarded and session tokens are persisted through native secure storage when available."
          title="Protected mobile session"
          tone="success"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center"
  },
  hero: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: spacing.lg
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  error: {
    backgroundColor: "#FDEDEC",
    borderColor: "#F8C7C3",
    borderRadius: 8,
    borderWidth: 1,
    color: colors.danger,
    padding: 12
  },
  linkWrap: {
    alignItems: "center",
    padding: 10
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  }
});

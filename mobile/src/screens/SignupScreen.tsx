import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { AppButton } from "../components/AppButton";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { getErrorMessage } from "../utils/errors";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert("Check details", "Name, email, and a password of at least 6 characters are required.");
      return;
    }
    setLoading(true);
    try {
      const result = await signup({ name, phone, email, password });
      if (result.emailConfirmationRequired) {
        Alert.alert("Confirm your email", "Open the confirmation link, then sign in.");
        navigation.navigate("Login");
      }
    } catch (error: unknown) {
      Alert.alert("Signup failed", getErrorMessage(error, "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.wrap}>
        <SectionHeader
          title="Create Account"
          subtitle="Set up a protected identity for healthcare monitoring and AI support."
        />
        <EnterpriseCard eyebrow="Account provisioning" title="Patient or caregiver details">
          <TextField autoCapitalize="words" label="Full name" onChangeText={setName} placeholder="Patient or caregiver name" value={name} />
          <TextField keyboardType="phone-pad" label="Phone" onChangeText={setPhone} placeholder="+94..." value={phone} />
          <TextField keyboardType="email-address" label="Email" onChangeText={setEmail} placeholder="you@example.com" value={email} />
          <TextField label="Password" onChangeText={setPassword} placeholder="Minimum 6 characters" secureTextEntry value={password} />
          <AppButton icon="shield-checkmark-outline" loading={loading} onPress={onSignup} title="Create secure account" />
          <Pressable onPress={() => navigation.navigate("Login")} style={styles.linkWrap}>
            <Text style={styles.link}>Already have an account?</Text>
          </Pressable>
        </EnterpriseCard>
        <InfoBanner
          body="Profile data is synced through the backend profile endpoint after authentication."
          title="Identity sync"
          tone="info"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.md,
    justifyContent: "center"
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

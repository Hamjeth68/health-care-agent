import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { DataRow } from "../components/DataRow";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import { colors, spacing } from "../theme";

export function ProfileScreen() {
  const { logout, profile, refreshProfile, user } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile(user.id, name.trim(), phone.trim());
      await refreshProfile();
      Alert.alert("Profile updated", "Your care profile has been synced.");
    } catch (error: any) {
      Alert.alert("Unable to save", error?.message || "Check the backend connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AppHeader
        badge="Secured"
        badgeTone="success"
        icon="person-circle-outline"
        subtitle="Identity, session protection, and mobile governance controls."
        title="Profile & security"
      />
      <View style={styles.identity}>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.caption}>Session tokens are stored in device secure storage when available.</Text>
      </View>

      <EnterpriseCard eyebrow="Care identity" title="Profile details">
        <TextField autoCapitalize="words" label="Full name" onChangeText={setName} placeholder="Your name" value={name} />
        <TextField keyboardType="phone-pad" label="Phone" onChangeText={setPhone} placeholder="+94..." value={phone} />
        <AppButton icon="save-outline" loading={saving} onPress={onSave} title="Save profile" />
      </EnterpriseCard>

      <EnterpriseCard eyebrow="Governance" title="Security controls">
        <DataRow label="Navigation access" value="Authenticated only" />
        <DataRow label="Session storage" value="SecureStore fallback aware" />
        <DataRow label="Secrets" value="Environment configured" />
        <DataRow label="Network calls" value="Typed with timeouts" />
      </EnterpriseCard>

      <InfoBanner
        body="For production, pair this app with device biometrics, audit logging, remote configuration, and healthcare data retention policies."
        title="Enterprise hardening path"
        tone="info"
      />

      <AppButton icon="log-out-outline" onPress={logout} title="Sign out" variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: spacing.md
  },
  email: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  caption: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
});

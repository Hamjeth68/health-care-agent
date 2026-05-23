import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "../components/AppHeader";
import { DataRow } from "../components/DataRow";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { MetricTile } from "../components/MetricTile";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { colors, shadow, spacing } from "../theme";

export function HomeScreen() {
  const { profile, user } = useAuth();
  const displayName = profile?.name?.trim() || user?.email?.split("@")[0] || "there";

  return (
    <Screen>
      <AppHeader
        badge="Protected"
        badgeTone="success"
        icon="business-outline"
        subtitle="Command center for monitoring, triage, and AI-supported patient education."
        title={`Care workspace`}
      />

      <LinearGradient colors={["#DDF4EC", "#F7FBF9"]} style={styles.priority}>
        <View style={styles.priorityTop}>
          <View>
            <Text style={styles.priorityLabel}>Assigned user</Text>
            <Text style={styles.priorityTitle}>{displayName}</Text>
          </View>
          <StatusBadge label="Ready" tone="success" />
        </View>
        <Text style={styles.priorityCopy}>
          Start with fresh vitals, review risk status, then move into AI chat or clinical tools with the same patient context.
        </Text>
        <View style={styles.heroActions}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>4</Text>
            <Text style={styles.heroMetricLabel}>core workflows</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>20s</Text>
            <Text style={styles.heroMetricLabel}>API timeout guard</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        <MetricTile icon="heart-outline" label="Blood pressure" tone="warning" unit="mmHg" value="120/80" />
        <MetricTile icon="fitness-outline" label="Heart rate" unit="bpm" value="76" />
        <MetricTile icon="thermometer-outline" label="Temperature" tone="secondary" unit="C" value="36.8" />
        <MetricTile icon="water-outline" label="SpO2" unit="%" value="98" />
      </View>

      <EnterpriseCard
        eyebrow="Triage pipeline"
        title="Enterprise care flow"
        trailing={<Ionicons color={colors.primary} name="git-branch-outline" size={22} />}
      >
        {[
          ["Capture", "Record BP, pulse, temperature, glucose, and oxygen."],
          ["Classify", "Use backend rules to return stable, watch, or urgent status."],
          ["Act", "Escalate urgent readings or ask educational follow-up questions."]
        ].map(([title, copy], index) => (
          <View key={title} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{title}</Text>
              <Text style={styles.stepCopy}>{copy}</Text>
            </View>
          </View>
        ))}
      </EnterpriseCard>

      <EnterpriseCard eyebrow="Operational readiness" title="System posture">
        <DataRow label="Authentication" value="Supabase guarded routes" />
        <DataRow label="Token storage" value="SecureStore when available" />
        <DataRow label="Backend API" value="FastAPI healthcare agent" />
        <DataRow label="Clinical boundary" value="Informational guidance only" />
      </EnterpriseCard>

      <InfoBanner
        body="The app supports monitoring and patient education. It should not be used as the sole source for emergency medical decisions."
        title="Clinical safety boundary"
        tone="warning"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  priority: {
    ...shadow,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: spacing.lg
  },
  priorityTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between"
  },
  priorityLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  priorityTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 31,
    marginTop: 4
  },
  priorityCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroActions: {
    flexDirection: "row",
    gap: 10
  },
  heroMetric: {
    backgroundColor: "rgba(255,255,255,0.74)",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12
  },
  heroMetricValue: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "900"
  },
  heroMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  step: {
    flexDirection: "row",
    gap: 12
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  stepNumberText: {
    color: colors.primary,
    fontWeight: "900"
  },
  stepText: {
    flex: 1,
    gap: 3
  },
  stepTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  stepCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});

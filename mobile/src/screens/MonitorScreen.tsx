import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AlertList } from "../components/AlertList";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { DataRow } from "../components/DataRow";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { TextField } from "../components/TextField";
import { getMonitoringSummary } from "../services/api";
import { colors, shadow, spacing } from "../theme";
import type { MonitoringPayload, MonitoringSummary } from "../types";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function MonitorScreen() {
  const [form, setForm] = useState({
    age: "55",
    systolic: "160",
    diastolic: "95",
    heartRate: "92",
    temperature: "37.1",
    glucose: "112",
    oxygen: "97"
  });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);

  const statusColor = useMemo(() => {
    if (summary?.status === "urgent") return colors.danger;
    if (summary?.status === "watch") return colors.warning;
    return colors.success;
  }, [summary?.status]);
  const statusTone = summary?.status === "urgent" ? "danger" : summary?.status === "watch" ? "warning" : "success";

  const update = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onAnalyze = async () => {
    const systolic = toNumber(form.systolic);
    if (!systolic) {
      Alert.alert("Blood pressure required", "Enter systolic blood pressure to calculate monitoring risk.");
      return;
    }

    const payload: MonitoringPayload = {
      age: toNumber(form.age),
      systolic_bp: systolic,
      diastolic_bp: toNumber(form.diastolic),
      heart_rate: toNumber(form.heartRate),
      temperature_c: toNumber(form.temperature),
      glucose_mg_dl: toNumber(form.glucose),
      oxygen_saturation: toNumber(form.oxygen)
    };

    setLoading(true);
    try {
      setSummary(await getMonitoringSummary(payload));
    } catch (error: any) {
      Alert.alert("Monitoring unavailable", error?.message || "Check that the FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppHeader
        badge={summary ? summary.status : "New check"}
        badgeTone={summary ? statusTone : "info"}
        icon="pulse-outline"
        subtitle="Structured vitals capture with risk classification and next-step recommendations."
        title="Vitals monitor"
      />

      <InfoBanner
        body="Confirm readings are recent and measured at rest. Urgent symptoms should bypass the app and go directly to emergency care."
        title="Before analysis"
        tone="info"
      />

      <EnterpriseCard eyebrow="Patient readings" title="Enter latest measurements">
        <View style={styles.formGrid}>
          <TextField keyboardType="number-pad" label="Age" onChangeText={update("age")} value={form.age} />
          <TextField keyboardType="number-pad" label="Systolic BP" onChangeText={update("systolic")} value={form.systolic} />
          <TextField keyboardType="number-pad" label="Diastolic BP" onChangeText={update("diastolic")} value={form.diastolic} />
          <TextField keyboardType="number-pad" label="Heart rate" onChangeText={update("heartRate")} value={form.heartRate} />
          <TextField keyboardType="decimal-pad" label="Temperature C" onChangeText={update("temperature")} value={form.temperature} />
          <TextField keyboardType="number-pad" label="Glucose mg/dL" onChangeText={update("glucose")} value={form.glucose} />
          <TextField keyboardType="number-pad" label="Oxygen saturation" onChangeText={update("oxygen")} value={form.oxygen} />
        </View>
        <AppButton icon="analytics-outline" loading={loading} onPress={onAnalyze} title="Analyze vitals" />
      </EnterpriseCard>

      {summary ? (
        <>
          <View style={styles.summary}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryLabel}>Care priority</Text>
                <Text style={[styles.summaryStatus, { color: statusColor }]}>{summary.status.toUpperCase()}</Text>
              </View>
              <StatusBadge label={`Score ${summary.risk_score}/10`} tone={statusTone} />
            </View>
            <Text style={styles.score}>Reviewed by monitoring rules endpoint</Text>
          </View>
          <AlertList icon="warning-outline" items={summary.alerts} title="Alerts" />
          <AlertList icon="checkmark-circle-outline" items={summary.recommendations} title="Recommendations" />
          <Text style={styles.disclaimer}>{summary.disclaimer}</Text>
        </>
      ) : null}

      <EnterpriseCard eyebrow="Reference guardrails" title="Escalation cues">
        <DataRow label="BP crisis" value=">=180 or >=120" />
        <DataRow label="Oxygen saturation" value="<92%" />
        <DataRow label="Glucose low/high" value="<70 or >=250" />
        <DataRow label="Fever" value=">=38 C" />
      </EnterpriseCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formGrid: {
    gap: spacing.md
  },
  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  summary: {
    ...shadow,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.lg
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryStatus: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4
  },
  score: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  }
});

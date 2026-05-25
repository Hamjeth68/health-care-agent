import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { EnterpriseCard } from "../components/EnterpriseCard";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { checkDrugInteraction, predictRisk } from "../services/api";
import { colors } from "../theme";
import { getErrorMessage } from "../utils/errors";

export function ToolsScreen() {
  const [drug1, setDrug1] = useState("aspirin");
  const [drug2, setDrug2] = useState("ibuprofen");
  const [age, setAge] = useState("55");
  const [bp, setBp] = useState("160");
  const [loadingInteraction, setLoadingInteraction] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [interaction, setInteraction] = useState("");
  const [prediction, setPrediction] = useState("");

  const onInteraction = async () => {
    if (!drug1.trim() || !drug2.trim()) {
      Alert.alert("Medication names required", "Enter two drugs to check interaction notes.");
      return;
    }
    setLoadingInteraction(true);
    try {
      const result = await checkDrugInteraction(drug1, drug2);
      setInteraction(result.interaction);
    } catch (error: unknown) {
      Alert.alert("Tool unavailable", getErrorMessage(error, "Check that the backend is running."));
    } finally {
      setLoadingInteraction(false);
    }
  };

  const onRisk = async () => {
    const parsedAge = Number(age);
    const parsedBp = Number(bp);
    if (!Number.isFinite(parsedAge) || !Number.isFinite(parsedBp)) {
      Alert.alert("Numbers required", "Enter age and blood pressure as numbers.");
      return;
    }
    setLoadingRisk(true);
    try {
      const result = await predictRisk(parsedAge, parsedBp);
      setPrediction(result.prediction);
    } catch (error: unknown) {
      Alert.alert("Tool unavailable", getErrorMessage(error, "Check that the backend is running."));
    } finally {
      setLoadingRisk(false);
    }
  };

  return (
    <Screen>
      <AppHeader
        badge="Toolbox"
        badgeTone="info"
        icon="medkit-outline"
        subtitle="Operational calculators and backend tools for repeatable care workflows."
        title="Clinical tools"
      />
      <InfoBanner
        body="Use these tools as structured checks. Medication and risk outputs still require professional review."
        title="Decision support only"
        tone="info"
      />

      <EnterpriseCard eyebrow="Medication safety" title="Drug interaction">
        <TextField autoCapitalize="words" label="First drug" onChangeText={setDrug1} value={drug1} />
        <TextField autoCapitalize="words" label="Second drug" onChangeText={setDrug2} value={drug2} />
        <AppButton icon="medkit-outline" loading={loadingInteraction} onPress={onInteraction} title="Check interaction" />
        {interaction ? <Text style={styles.result}>{interaction}</Text> : null}
      </EnterpriseCard>

      <EnterpriseCard eyebrow="Risk screening" title="Blood pressure risk">
        <TextField keyboardType="number-pad" label="Age" onChangeText={setAge} value={age} />
        <TextField keyboardType="number-pad" label="Blood pressure" onChangeText={setBp} value={bp} />
        <AppButton icon="trending-up-outline" loading={loadingRisk} onPress={onRisk} title="Predict risk" />
        {prediction ? <Text style={styles.result}>{prediction}</Text> : null}
      </EnterpriseCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    padding: 12
  }
});

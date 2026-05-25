import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { InfoBanner } from "../components/InfoBanner";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import { askHealthcareAgent } from "../services/api";
import { colors, spacing } from "../theme";
import type { ChatMessage } from "../types";
import { getErrorMessage } from "../utils/errors";

const suggestions = [
  "bp 160",
  "drug interaction aspirin ibuprofen",
  "covid-19 prevention guidelines",
  "nutrition in pea curry",
  "side effects of oxycodone hydrochloride"
];

const MessageBubble = memo(function MessageBubble({ item }: { item: ChatMessage }) {
  return (
    <View style={styles.messageBlock}>
      <View style={[styles.bubble, styles.userBubble]}>
        <Text style={styles.userText}>{item.user}</Text>
      </View>
      <View style={[styles.bubble, styles.botBubble]}>
        <Text style={styles.botText}>{item.bot}</Text>
      </View>
    </View>
  );
});

export function ChatScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = query.trim().length > 0 && !loading;
  const data = useMemo(() => messages, [messages]);

  const send = useCallback(
    async (preset?: string) => {
      const prompt = (preset ?? query).trim();
      if (!prompt || loading) return;
      setQuery("");
      setLoading(true);
      try {
        const response = await askHealthcareAgent(prompt, role, user?.id);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${prompt}`,
            user: prompt,
            bot: response.response,
            role,
            createdAt: new Date().toISOString()
          }
        ]);
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      } catch (error: unknown) {
        Alert.alert("Agent unavailable", getErrorMessage(error, "Start the backend and try again."));
      } finally {
        setLoading(false);
      }
    },
    [loading, query, role, user?.id]
  );

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.wrap}>
        <AppHeader
          badge={loading ? "Reasoning" : "Online"}
          badgeTone={loading ? "warning" : "success"}
          icon="chatbubble-ellipses-outline"
          subtitle="Education-focused medical retrieval with patient role context."
          title="AI health chat"
        />
        <InfoBanner
          body="Responses are informational and should be reviewed with a qualified clinician for diagnosis, treatment, or emergency decisions."
          title="Clinical review required"
          tone="warning"
        />
        <View style={styles.roleRow}>
          {["user", "patient", "caregiver"].map((nextRole) => (
            <Pressable key={nextRole} onPress={() => setRole(nextRole)} style={[styles.role, role === nextRole && styles.roleActive]}>
              <Text style={[styles.roleText, role === nextRole && styles.roleTextActive]}>{nextRole}</Text>
            </Pressable>
          ))}
        </View>

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons color={colors.primary} name="chatbubble-ellipses-outline" size={36} />
            <Text style={styles.emptyTitle}>Choose a safe starting point</Text>
            <Text style={styles.emptyCopy}>Enterprise flows keep prompts scoped, traceable, and easy to review.</Text>
            <View style={styles.suggestions}>
              {suggestions.map((item) => (
                <Pressable key={item} disabled={loading} onPress={() => send(item)} style={styles.suggestion}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble item={item} />}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
          />
        )}

        {loading ? (
          <View style={styles.typing}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.typingText}>Healthcare agent is reasoning...</Text>
          </View>
        ) : null}

        <View style={styles.composer}>
          <TextField
            label="Message"
            multiline
            onChangeText={setQuery}
            placeholder="Ask a medical question..."
            value={query}
            style={styles.input}
          />
          <AppButton icon="send-outline" loading={loading} onPress={() => send()} title={canSend ? "Send" : "Ask"} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.md
  },
  roleRow: {
    flexDirection: "row",
    gap: 8
  },
  role: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  roleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  roleText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  roleTextActive: {
    color: colors.surface
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: spacing.lg
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
  },
  suggestions: {
    gap: 8,
    width: "100%"
  },
  suggestion: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    padding: 12
  },
  suggestionText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800"
  },
  listContent: {
    gap: 14,
    paddingBottom: 10
  },
  list: {
    flex: 1
  },
  messageBlock: {
    gap: 8
  },
  bubble: {
    borderRadius: 8,
    maxWidth: "92%",
    padding: 13
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  userText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 20
  },
  botText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  typing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  typingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  composer: {
    gap: 10
  },
  input: {
    maxHeight: 120,
    minHeight: 78
  }
});

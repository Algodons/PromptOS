import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface OptimizationResult {
  optimizedPrompt: string;
  improvements: string[];
  scoreImprovement: number;
  tokensReduced: number;
}

const API_URL =
  (Constants.expoConfig?.extra as { EXPO_PUBLIC_API_URL?: string })
    ?.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function OptimizerScreen() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOptimize(): Promise<void> {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Include the auth token when available; the API supports both authenticated
      // and unauthenticated requests (unauthenticated get FREE tier limits).
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } catch {
        // AsyncStorage not available or no token; proceed without auth
      }

      const res = await fetch(`${API_URL}/api/ai/optimize`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      const data = (await res.json()) as OptimizationResult;
      setResult(data);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Prompt Optimizer</Text>
        <Text style={styles.subtitle}>AI-powered enhancement</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Your Prompt</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={6}
            placeholder="Enter your prompt here..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            style={styles.input}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, (!prompt.trim() || loading) && styles.buttonDisabled]}
            onPress={() => void handleOptimize()}
            disabled={!prompt.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#00F5FF" size="small" />
            ) : (
              <Text style={styles.buttonText}>✦ Optimize Prompt</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Optimized</Text>
              <View style={styles.badges}>
                <Text style={styles.badgeCyan}>+{result.scoreImprovement}%</Text>
                <Text style={styles.badgePurple}>-{result.tokensReduced} tkn</Text>
              </View>
            </View>
            <Text style={styles.resultPrompt}>{result.optimizedPrompt}</Text>

            {result.improvements.length > 0 && (
              <View style={styles.improvements}>
                <Text style={styles.improvementsTitle}>Improvements</Text>
                {result.improvements.map((imp, i) => (
                  <Text key={i} style={styles.improvement}>
                    ▸ {imp}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05060A" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 },
  inputCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,245,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    marginBottom: 16,
  },
  label: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  input: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "monospace",
    minHeight: 120,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 10,
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00F5FF",
    backgroundColor: "rgba(0,245,255,0.1)",
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#00F5FF", fontSize: 13, fontWeight: "600" },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.3)",
    backgroundColor: "rgba(0,255,136,0.04)",
    padding: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: { fontSize: 13, fontWeight: "600", color: "#00FF88" },
  badges: { flexDirection: "row", gap: 8 },
  badgeCyan: { fontSize: 11, color: "#00F5FF", fontFamily: "monospace" },
  badgePurple: { fontSize: 11, color: "#A855F7", fontFamily: "monospace" },
  resultPrompt: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 18,
    marginBottom: 12,
  },
  improvements: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  improvementsTitle: { fontSize: 11, color: "#A855F7", marginBottom: 6 },
  improvement: { fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 18 },
});

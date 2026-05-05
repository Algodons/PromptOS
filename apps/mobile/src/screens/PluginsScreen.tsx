import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function PluginsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Plugin Marketplace</Text>
        <Text style={styles.subtitle}>Extend PromptOS capabilities</Text>
        <View style={styles.card}>
          <Text style={styles.empty}>Plugin marketplace coming soon.</Text>
          <Text style={styles.hint}>Upgrade to PRO to access premium plugins.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05060A" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", color: "#ffffff", fontFamily: "monospace", marginBottom: 2 },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    backgroundColor: "rgba(168,85,247,0.04)",
    padding: 24,
    alignItems: "center",
  },
  empty: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 },
  hint: { color: "#A855F7", fontSize: 11 },
});

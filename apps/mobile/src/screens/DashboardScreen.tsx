import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const stats = [
  { label: "Prompts", value: "0", color: "#00F5FF" },
  { label: "Tokens", value: "0", color: "#A855F7" },
  { label: "Saved", value: "$0.00", color: "#00FF88" },
  { label: "Plan", value: "FREE", color: "#FF0090" },
];

export function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>PromptOS</Text>
          <Text style={styles.subtitle}>Command Center</Text>
        </View>

        <View style={styles.grid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.empty}>No activity yet. Create your first prompt to get started.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05060A" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#00F5FF",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "bold", fontFamily: "monospace" },
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,245,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    minHeight: 120,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
    fontFamily: "monospace",
  },
  empty: { fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" },
});

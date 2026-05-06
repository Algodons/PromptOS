import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sections = [
  {
    title: "Account",
    items: ["Profile", "Email & Password", "Connected Wallets"],
  },
  {
    title: "Subscription",
    items: ["Current Plan", "Billing & Invoices", "Upgrade"],
  },
  {
    title: "AI Settings",
    items: ["Default Model", "API Keys", "Cost Limits"],
  },
  {
    title: "App",
    items: ["Appearance", "Notifications", "Data & Privacy"],
  },
];

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.item, idx < section.items.length - 1 && styles.itemBorder]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemLabel}>{item}</Text>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05060A" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", color: "#ffffff", fontFamily: "monospace", marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    color: "rgba(0,245,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  itemLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  arrow: { fontSize: 18, color: "rgba(255,255,255,0.3)" },
});

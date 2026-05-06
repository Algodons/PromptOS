import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import { DashboardScreen } from "../screens/DashboardScreen.js";
import { OptimizerScreen } from "../screens/OptimizerScreen.js";
import { PluginsScreen } from "../screens/PluginsScreen.js";
import { SettingsScreen } from "../screens/SettingsScreen.js";

const Tab = createBottomTabNavigator();

const NEON_CYAN = "#00F5FF";
const DEEP_SPACE = "#05060A";
const GLASS_BORDER = "rgba(0,245,255,0.15)";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: "⬡",
    Optimizer: "✦",
    Plugins: "◈",
    Settings: "⚙",
  };
  return (
    <Text style={{ fontSize: 18, color: focused ? NEON_CYAN : "rgba(255,255,255,0.3)" }}>
      {icons[name] ?? "○"}
    </Text>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: NEON_CYAN,
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarStyle: {
          backgroundColor: "rgba(5,6,10,0.95)",
          borderTopColor: GLASS_BORDER,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "monospace",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Optimizer" component={OptimizerScreen} />
      <Tab.Screen name="Plugins" component={PluginsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

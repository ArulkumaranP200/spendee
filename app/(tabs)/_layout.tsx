import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SmoothPressable } from "@/components/ui/smooth-pressable";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          headerShown: false,
          animation: "fade",
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transactions",
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="list.bullet" color={color} />,
          }}
        />

        <Tabs.Screen
          name="ledger"
          options={{
            title: "Ledger",
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.2.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="budgets"
          options={{
            title: "Budgets",
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="gear" color={color} />,
          }}
        />
      </Tabs>

      {/* Floating Add button, bottom-right, hovering clear of the tab bar */}
      <SmoothPressable
        onPress={() => router.push("/add")}
        accessibilityLabel="Add transaction"
        dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        style={{
          position: "absolute",
          bottom: tabBarHeight + 16,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <IconSymbol size={30} name="plus.circle.fill" color="#fff" />
      </SmoothPressable>
    </View>
  );
}

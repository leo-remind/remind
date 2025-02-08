import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image, View, Text } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

function LogoTitle() {
  return (
    <View className="flex flex-row gap-x-2">
      <Image
        className="w-8 h-8"
        source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
      />
      <Text>Homw...</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#dddddd",
        headerShown: false,
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerStyle: { backgroundColor: "#f4511e" },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },

          headerTitle: (props) => <LogoTitle {...props} />,
        }}
      />
      <Tabs.Screen
        name="memories/index"
        options={{
          title: "Memories",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamepad.fill" color={color} />,
        }}
      />      <Tabs.Screen
      name="practice"
      options={{
        title: "Practice",
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamepad.fill" color={color} />,
      }}
    />
    </Tabs>
  );
}

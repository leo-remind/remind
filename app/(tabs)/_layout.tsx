import { Redirect, Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, Image, View, Text, TextInput } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { chat } from "@/utils/rag/rag";
import { useSQLiteContext } from "expo-sqlite";

function LogoTitle(props: any) {
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
<<<<<<< HEAD
  const [value,setValue] = useState("");
=======
  const colorScheme = useColorScheme()
  const db = useSQLiteContext();

  const [value, setValue] = useState("");
>>>>>>> cc393054651eceaa1979a74b5ea46b77f90bf968

  return (
    <View style={{ flex: 1 }}>
      {/* Search Input Container */}
      <View
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          zIndex: 1,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderTopColor: "#dddddd",
          borderRightColor: "#dddddd",
          borderLeftColor: "#dddddd",
          borderBottomColor: "#ffffff",
          borderTopRightRadius: 32,
          borderTopLeftRadius: 32,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 25,
            paddingHorizontal: 16,
            height: 46,
          }}
        >
          <TextInput
            onSubmitEditing={() => {
              Redirect({
                href : {
                  pathname: "/chat/[query]",
                  query: value
                }
              })
            }}
            onChangeText={newValue => setValue(newValue)}
            placeholder="Ask me anything!"
            style={{
              flex: 1,
              fontSize: 16,
              color: "#333",
            }}
          />
          <MaterialIcons name="mic" size={24} color="#666" />
        </View>
      </View>

      {/* Tabs with adjusted top padding to account for search input */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#000000",
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
          tabBarStyle: {
            ...Platform.select({
              ios: {
                position: "absolute",
              },
            }),
            marginTop: 60, // Add top margin to account for search input
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            headerStyle: { backgroundColor: "#f4511e" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Tabs.Screen
          name="memories/index"
          options={{
            title: "Memories",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Games',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gamepad.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: "Practice",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gamepad.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
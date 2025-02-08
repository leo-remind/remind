<<<<<<< HEAD
import { Tabs, Stack } from "expo-router";
import React from "react";
import { Platform, Image, View, Text } from "react-native";
=======
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, Image, View, Text, TextInput } from "react-native";
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098

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
  const colorScheme = useColorScheme()
  const db = useSQLiteContext();

  const [value,setValue] = useState("");

  return (
<<<<<<< HEAD
    <Stack>
      <Stack.Screen name="(games)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="memory"
        options={{
          presentation: 'modal',
          title: 'Memory Game',
          headerShown: true,
          animation: 'slide_from_right'
        }}
      />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#dddddd",
=======
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
              chat(db, value)
            }}
            onChangeText ={ newValue => setValue(newValue)}
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
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098
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
<<<<<<< HEAD
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
=======
          tabBarStyle: {
            ...Platform.select({
              ios: {
                position: "absolute",
              },
            }),
            marginTop: 60, // Add top margin to account for search input
          },
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
<<<<<<< HEAD
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
=======
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098
            headerStyle: { backgroundColor: "#f4511e" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
<<<<<<< HEAD
            headerTitle: (props) => <LogoTitle {...props} />,
=======
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098
          }}
        />
        <Tabs.Screen
          name="memories/index"
          options={{
            title: "Memories",
<<<<<<< HEAD
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />
            ),
=======
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="my-library-books" color={color} />,
>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
<<<<<<< HEAD
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
    </Stack>
  );
}
=======
            title: "Games",
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="videogame-asset" color={color} />,
          }}
        />
        
      </Tabs>
    </View>
  )
}

>>>>>>> ac328b87aa8fdcd078a3460971c2c909a99b6098

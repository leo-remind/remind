import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";

import { useFonts, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans' ;
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';

import {
  SQLiteProvider,
} from "expo-sqlite";

import {
  migrateDbIfNeeded,
} from "@/utils/database";

import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    DMSans_500Medium, 
    DMSans_700Bold,
    DMSerifText_400Regular
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SQLiteProvider databaseName="remind_db.sqlite" onInit={migrateDbIfNeeded}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
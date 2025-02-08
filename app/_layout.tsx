import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";

import { SQLiteProvider } from "expo-sqlite";

import { migrateDbIfNeeded } from "@/utils/database";

import "../global.css";

import { Button, View } from "react-native";
import {
  AudioRecording,
  ExpoAudioStreamModule,
  AudioRecorderProvider,
  useSharedAudioRecorder,
} from "@siteed/expo-audio-stream";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
      <AudioRecorderProvider>
        <ChildComponent />
      </AudioRecorderProvider>
    </SQLiteProvider>
  );
}

function ChildComponent() {
  const { startRecording, stopRecording, isRecording } = useSharedAudioRecorder();

  const [audioResult, setAudioResult] = useState<AudioRecording | null>(null);

  const handleStart = async () => {
    const { status } = await ExpoAudioStreamModule.requestPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const startResult = await startRecording({
      interval: 500,
      enableProcessing: true,
      onAudioStream: async (_) => {
        console.log(`onAudioStream`, _);
      },
    });
    return startResult;
  };

  const handleStop = async () => {
    const result = await stopRecording();
    setAudioResult(result);
  };

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Button title="start recording" onPress={handleStart}></Button>
      <Button title="stop recording" onPress={handleStop}></Button>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

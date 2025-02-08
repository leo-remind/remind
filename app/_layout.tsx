import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";

import { SQLiteProvider } from "expo-sqlite";

import { migrateDbIfNeeded } from "@/utils/database";

import "../global.css";

// import {
//   ExpoAudioStreamModule,
// } from '@siteed/expo-audio-stream'

// const requestPermissions = async () => {
//   const { granted } =
//       await ExpoAudioStreamModule.requestPermissionsAsync()
//   if (granted) {
//       console.log('Microphone permissions granted')
//   } else {
//       console.log('Microphone permissions denied')
//   }
// }

import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import { Button } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

ReactNativeForegroundService.register({
  config: {
    alert: true,
    onServiceErrorCallBack: () => {
      console.error("Foreground service error occurred");
    },
  },
});

const update = async () => {
  console.log("Update function called");
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  let someCondition = true;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  ReactNativeForegroundService.add_task(() => log(), {
    delay: 1000,
    onLoop: true,
    taskId: 'taskid',
    onError: e => console.log(`Error logging:`, e),
  });

  const startTask = () => {
    ReactNativeForegroundService.start({
      id: 1244,
      title: 'Foreground Service',
      message: 'We are live World',
      icon: 'ic_launcher',
      button: true,
      button2: true,
      buttonText: 'Button',
      button2Text: 'Anther Button',
      buttonOnPress: 'cray',
      // setOnlyAlertOnce: "true",
      color: '#000000',
      progress: {
        max: 100,
        curr: 50,
      },
    });
  };

  const stopTask = () => {
    ReactNativeForegroundService.stopAll();
  };

  // useEffect(() => {
  //   requestPermissions();
  // })

  // useEffect(() => {

  const handleStartService = () => {
    ReactNativeForegroundService.add_task(update, {
      delay: 1000,
      onLoop: true,
      taskId: "AudioRecordingService",
      onError: (e) => console.log(`Error logging:`, e),
    });

    ReactNativeForegroundService.start({
      id: 1244,
      title: "Foreground Service",
      message: "We are live World",
      icon: "ic_launcher",
      button: true,
      button2: true,
      buttonText: "Button",
      button2Text: "Anther Button",
      buttonOnPress: "cray",
      setOnlyAlertOnce: "true",
      color: "#000000",
      progress: {
        max: 100,
        curr: 50,
      },
    });
  };
  // });

  return (
    <SQLiteProvider databaseName="remind_db.sqlite" onInit={migrateDbIfNeeded}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Button onPress={startTask} title="Start The foreground Service" />
        <Button onPress={stopTask} title="Stop The foreground Service" />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}

const log = () => console.log('Hellow World');
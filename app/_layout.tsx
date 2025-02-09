import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useState } from "react";
import "react-native-reanimated";

import { Buffer } from "buffer";

import get from "axios";

import * as Location from "expo-location";

import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";

import { useFonts, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';

import { openDatabaseAsync, SQLiteProvider, useSQLiteContext } from "expo-sqlite";

import { migrateDbIfNeeded } from "@/utils/database";

import "../global.css";

import { Button, View } from "react-native";
import * as FileSystem from "expo-file-system";
import {
  AudioRecording,
  ExpoAudioStreamModule,
  AudioRecorderProvider,
  useSharedAudioRecorder,
  AudioDataEvent,
} from "@siteed/expo-audio-stream";

import { MemoryCreator } from "@/utils/MemoryCreator";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { addConversation } from "@/lib/conversations";
import { populateDummyData } from "@/utils/DummyDataCreator";

// import { MediaSync } from "@/utils/MediaSync&Face";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LOCATION_TRACKING = "location-tracking";

var l1;
var l2;

var callCounter = 0;

export default function RootLayout() {
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
      <AudioRecorderProvider>
        <ChildComponent />
      </AudioRecorderProvider>
    </SQLiteProvider>
  );
}

function ChildComponent() {
  const { startRecording, stopRecording, isRecording } =
    useSharedAudioRecorder();

  const [audioResult, setAudioResult] = useState<AudioRecording | null>(null);
  const [locationStarted, setLocationStarted] = React.useState(false);

  const handleStart = async () => {
    const { status } = await ExpoAudioStreamModule.requestPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const startResult = await startRecording({
      interval: 1000 * 20 * 1,
      keepAwake: true,
      sampleRate: 16000,
      channels: 1,
      encoding: 'pcm_16bit',

      onAudioStream: async (adEvent: AudioDataEvent) => {
        // console.log(adEvent);
        // adEvent.data is base64 encoded string representing the audio buffer.
        console.log("[ad_handler] Audio Data Recieved");
        // handleStop();
        const result: AudioRecording | null = await stopRecording();

        if (result) {

          const audioDataB642 = await FileSystem.readAsStringAsync(
            result.fileUri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );

          console.log("Read as string");
          const audioData2 = new Uint8Array(Buffer.from(audioDataB642, "base64"));
          console.log("Converted");
          // Call arbaaz code
          const db = await openDatabaseAsync("remind_db.sqlite");
          await addConversation(db, audioData2, "", "");
          console.log("[ad_handler] called conversation handler");
          
        } else {
          console.log("No recording result available.");
        }
        setAudioResult(result);

        handleStart();
      },
    });
    return startResult;
  };

  const handleStop = async () => {
    const result = await stopRecording();
    setAudioResult(result);
  };

  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    setLocationStarted(hasStarted);
    console.log("tracking started?", hasStarted);
  };

  const startLocation = () => {
    startLocationTracking();
  };

  const stopLocation = () => {
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  useLayoutEffect(() => {
    handleStart();

    const config = async () => {
      let resf = await Location.requestForegroundPermissionsAsync();
      let resb = await Location.requestBackgroundPermissionsAsync();
      if (resf.status != "granted" && resb.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location granted");
      }
    };

    config();

    if (!locationStarted) {
      startLocation();
    }
  }, []);

  const addStuff = async () => {
    console.log("Adding things?");
    const db = useSQLiteContext();

    populateDummyData(db);
  };

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* <Button title="yo add stuff" onPress={addStuff}></Button> */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data, error }: { data: any; error: any }) => {
    callCounter++;

    console.log(callCounter);

    if (callCounter % 5 == 0) {

      const ts = new Date();

      console.log(`${ts.toISOString()}: Running memory tasks`);

      const db = await openDatabaseAsync("remind_db.sqlite");

      const mcObject = new MemoryCreator();
      mcObject.createMemories(db);
    }

    if (error) {
      console.log("LOCATION_TRACKING task ERROR:", error);
      return;
    }
    if (data) {
      if (data.locations) {
        const { locations } = data;
        let lat = locations[0].coords.latitude;
        let long = locations[0].coords.longitude;

        l1 = lat;
        l2 = long;

        const db = await openDatabaseAsync("remind_db.sqlite");
        // query nominatim to get district
        // https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-34.44076&lon=-58.70521

        const axios_output = await get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`
        );
        // parse the json to get display name
        const place_name = axios_output.data.address.state_district;

        const result = await db.runAsync(
          `INSERT INTO location (place_name, time_of_polling, lat, lon) VALUES ('${place_name}', CURRENT_TIMESTAMP, ${lat}, ${long})`
        );

        // console.log("Inserted location with ID: ", result.lastInsertRowId);

        // const ms = new MediaSync(db);
        // await ms.syncPhotos();

      } else {
        console.log(`${new Date().toISOString()}: No locations data available`);
      }
    }
  }
);

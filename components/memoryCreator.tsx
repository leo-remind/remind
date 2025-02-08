import { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import React from 'react';
import { openDatabaseAsync } from 'expo-sqlite';

const BACKGROUND_FETCH_TASK = 'memory-creator';

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 1 * 60 * 1, // 60 minutes. Lowest: 1 minute
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function MemoryCreator({ value, children }: any) {
  const [isRegistered, setIsRegistered] = useState(false);

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }
  };

  useLayoutEffect(() => {
    if (!isRegistered) { 
        toggleFetchTask();
    }
    console.log("memoryCreator", isRegistered);
  })

  return (
    <>{children}</>
  );
}


// // 1. Define the task by providing a name and the function that should be executed
// // Note: This needs to be called in the global scope (e.g outside of your React components)
// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }) => {
//     const now = Date.now();
  
//     console.log(`Got memory creator call at date: ${new Date(now).toISOString()}`);

//     // creating memory code - calls the Prompt API, Conducts DB queries..
//     const db = await openDatabaseAsync("remind_db.sqlite");
    
//   });

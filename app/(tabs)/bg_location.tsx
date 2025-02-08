import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import get from "axios";

const LOCATION_TRACKING = "location-tracking";

var l1;
var l2;

function UserLocation() {
  const [locationStarted, setLocationStarted] = React.useState(false);

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

  React.useEffect(() => {
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
  }, []);

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

  return (
    <View>
      {locationStarted ? (
        <TouchableOpacity onPress={stopLocation}>
          <Text style={styles.btnText}>Stop Tracking</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={startLocation}>
          <Text style={styles.btnText}>Start Tracking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btnText: {
    fontSize: 20,
    backgroundColor: "green",
    color: "white",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data, error }: { data: any; error: any }) => {
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
        
        const axios_output = await get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`)
        // parse the json to get display name
        const place_name = axios_output.data.display_name;

        await db.execAsync(
          `INSERT INTO location (place_name, time_of_polling, lat, lon) VALUES ('${place_name}', CURRENT_TIMESTAMP, ${lat}, ${long})`
        );

      } else {
        console.log("No locations data available");
      }
    }
  }
);

export default UserLocation;

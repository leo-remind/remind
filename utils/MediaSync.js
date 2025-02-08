import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite/next';

class MediaSync {
  constructor(db) {
    this.db = db;
    this.lastSyncTime = new Date();
  }

  async initialize() {
    await this.requestPermissions();
  }

  async requestPermissions() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media Library permission denied');
    }
  }

  async getNewPhotos() {
    return await MediaLibrary.getAssetsAsync({
      first: 30,
      mediaType: ['photo'],
      createdAfter: this.lastSyncTime.getTime(),
      sortBy: [MediaLibrary.SortBy.creationTime]
    });
  }

  async findNearestLocation(creationTime) {
    // Find the location record closest to the photo's creation time
    const result = await this.db.getFirstAsync(`
      SELECT id 
      FROM location 
      WHERE ABS(STRFTIME('%s', time_of_polling) - STRFTIME('%s', ?)) = (
        SELECT MIN(ABS(STRFTIME('%s', time_of_polling) - STRFTIME('%s', ?)))
        FROM location
        WHERE time_of_polling BETWEEN datetime(?, '-1 hour') AND datetime(?, '+1 hour')
      )
      LIMIT 1
    `, [creationTime, creationTime, creationTime, creationTime]);
    
    return result?.id || null;
  }

  async processPhoto(asset) {
    try {
      // Get full asset info including the URI
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      
      // Fetch the image data as blob
      const response = await fetch(assetInfo.uri);
      const blob = await response.blob();

      // Convert creation time to ISO string for SQLite
      const creationTime = new Date(asset.creationTime).toISOString();
      
      // Find the nearest location based on photo creation time
      const locationId = await this.findNearestLocation(creationTime);

      // Using the new SQLite context API with updated schema
      await this.db.executeAsync(
        `INSERT INTO photos (
          blob_data, 
          caption, 
          caption_vector, 
          location_id,
          creation_time
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          blob,
          asset.filename || `Photo_${asset.id}`,
          new ArrayBuffer(384), // Placeholder for caption vector
          locationId,
          creationTime
        ]
      );

      // If no location was found within the time window, log it
      if (!locationId) {
        console.warn(`No matching location found for photo taken at ${creationTime}`);
      }
    } catch (error) {
      console.error(`Error processing photo ${asset.id}:`, error);
    }
  }

  async syncPhotos() {
    try {
      const assets = await this.getNewPhotos();
      
      // Process each photo
      for (const asset of assets.assets) {
        await this.processPhoto(asset);
      }
      
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Photo sync failed:', error);
    }
  }
}

export default function MediaSyncComponent() {
  const db = useSQLiteContext();
  const [sync, setSync] = useState(null);

  useEffect(() => {
    async function initializeTables() {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          blob_data BLOB NOT NULL,
          caption TEXT,
          caption_vector BLOB,
          location_id INTEGER,
          creation_time TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES location (id)
        );
      `);
    }
    
    // Initialize tables and MediaSync with the database context
    initializeTables().then(() => setSync(new MediaSync(db)));
  }, [db]);

  useEffect(() => {
    if (!sync) return;

    async function startSync() {
      try {
        await sync.initialize();
        const interval = setInterval(() => sync.syncPhotos(), 5000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to initialize media sync:', error);
      }
    }
    startSync();
  }, [sync]);

  return null;
}
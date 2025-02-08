import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite/next';
import * as faceapi from 'face-api.js';

class MediaSync {
  constructor(db) {
    this.db = db;
    this.lastSyncTime = new Date();
    this.faceDetectionNet = null;
    this.faceRecognitionNet = null;
  }

  async initialize() {
    await this.requestPermissions();
    await this.initializeFaceAPI();
  }

  // async initializeFaceAPI() {
  //   await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  //   await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  //   this.faceDetectionNet = faceapi.nets.ssdMobilenetv1;
  //   this.faceRecognitionNet = faceapi.nets.faceRecognitionNet;
  // }

  async initializeFaceAPI() {
    try {
      console.log('Starting face API initialization');
      
      // Get path to models
      const modelDir = await ModelLoader.ensureModelsCopied();
      console.log('Models copied successfully to:', modelDir);
      
      // Load the models
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelDir);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);
      
      this.faceDetectionNet = faceapi.nets.ssdMobilenetv1;
      this.faceRecognitionNet = faceapi.nets.faceRecognitionNet;
      
      console.log('Face detection models initialized successfully');
    } catch (error) {
      console.error('Error initializing face detection:', error);
      throw error;
    }
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

  async createNewPerson(faceDescriptor) {
    try {
      const result = await this.db.executeAsync(
        `INSERT INTO persons (
          name,
          face_embedding
        ) VALUES (?, ?)
        RETURNING id`,
        [
          'Untitled Person',
          Buffer.from(faceDescriptor)
        ]
      );
      
      return result[0].id;
    } catch (error) {
      console.error('Error creating new person:', error);
      throw error;
    }
  }

  async detectFacesAndMatch(imageBlob) {
    const img = await faceapi.bufferToImage(imageBlob);
    
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // For each face, either match to existing person or create new person
    const personIds = await Promise.all(
      detections.map(async detection => {
        const faceDescriptor = Array.from(detection.descriptor);
        
        // Try to match with existing person
        let personId = await matchFaceToExistingPerson(faceDescriptor, 0.75);
        
        // If no match found, create new person with just the face embedding
        if (personId === null) {
          personId = await this.createNewPerson(faceDescriptor);
          console.log('Created new person with ID:', personId);
        }
        
        return personId;
      })
    );

    return personIds;
  }

  async storePersonPhotoMatches(photoId, personIds) {
    // Insert entries into person_photos for each matched person
    for (const personId of personIds) {
      try {
        await this.db.executeAsync(
          `INSERT INTO person_photos (person_id, photo_id) 
           VALUES (?, ?)`,
          [personId, photoId]
        );
      } catch (error) {
        console.error(`Error storing person-photo match (person: ${personId}, photo: ${photoId}):`, error);
      }
    }
  }

  async processPhoto(asset) {
    let photoId = null;
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      const response = await fetch(assetInfo.uri);
      const blob = await response.blob();
      const creationTime = new Date(asset.creationTime).toISOString();
      const locationId = await this.findNearestLocation(creationTime);

      // Insert photo first and get its ID using RETURNING clause
      const result = await this.db.executeAsync(
        `INSERT INTO photos (
          blob_data, 
          caption, 
          caption_vector, 
          location_id,
          creation_time
        ) VALUES (?, ?, ?, ?, ?)
        RETURNING id`,
        [
          blob,
          asset.filename || `Photo_${asset.id}`,
          new ArrayBuffer(384),
          locationId,
          creationTime
        ]
      );

      // Extract the photo_id from the result
      photoId = result[0].id;
      
      if (!photoId) {
        throw new Error('Failed to get photo_id from insert operation');
      }

      // Detect faces and get array of matched person_ids
      const matchedPersonIds = await this.detectFacesAndMatch(blob);

      // Store each person-photo relationship
      for (const personId of matchedPersonIds) {
        await this.db.executeAsync(
          `INSERT INTO person_photos (person_id, photo_id) 
           VALUES (?, ?)`,
          [personId, photoId]
        );
        console.log(`Stored match: person_id=${personId}, photo_id=${photoId}`);
      }

      if (!locationId) {
        console.warn(`No matching location found for photo taken at ${creationTime}`);
      }
    } catch (error) {
      console.error(`Error processing photo ${asset.id}${photoId ? ` (photo_id: ${photoId})` : ''}:`, error);
    }
  }

  async syncPhotos() {
    try {
      const assets = await this.getNewPhotos();
      for (const asset of assets.assets) {
        await this.processPhoto(asset);
      }
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Photo sync failed:', error);
    }
  }
}

// Placeholder function for face matching
async function matchFaceToExistingPerson(faceDescriptor, threshold) {
  // This function should be implemented to return either null or an integer
  // based on your face matching criteria
  return null;
}

export default function MediaSyncComponent() {
  const db = useSQLiteContext();
  const [sync, setSync] = useState(null);

  useEffect(() => {
    async function initializeTables() {
      // Create persons table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS persons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NULL,
          birthdate DATE NULL,
          relation TEXT NULL,
          audio BLOB NULL,
          face_embedding BLOB,
          photo_data BLOB
        );
      `);

      // Create photos table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          blob_data BLOB NOT NULL,
          time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          caption TEXT NULL,
          caption_vector BLOB NULL,
          location_id INTEGER,
          FOREIGN KEY (location_id) REFERENCES location (id)
        );
      `);

      // Create person_photos table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS person_photos (
          person_id INTEGER NOT NULL,
          photo_id INTEGER NOT NULL,
          PRIMARY KEY (person_id, photo_id),
          FOREIGN KEY (person_id) REFERENCES persons(id),
          FOREIGN KEY (photo_id) REFERENCES photos(id)
        );
      `);
    }
    
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